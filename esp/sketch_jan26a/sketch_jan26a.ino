#include <Wire.h>
#include <MAX30105.h>
#include <heartRate.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>

// إعدادات WiFi
const char* ssid = "XUP_Ellawaty";
const char* password = "11112222";

// إنشاء الكائنات
MAX30105 particleSensor;
Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial GPS_Serial(1); // استخدام UART1

// متغيرات MAX30102
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

// متغيرات MPU6050
float accelX, accelY, accelZ;
float gyroX, gyroY, gyroZ;

// متغيرات GPS
float latitude = 0.0;
float longitude = 0.0;
int satellites = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== بدء اختبار الحساسات ===\n");

  // بدء I2C
  Wire.begin(21, 22); // SDA=21, SCL=22
  
  // الاتصال بالواي فاي
  Serial.print("جاري الاتصال بالواي فاي");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nتم الاتصال بالواي فاي!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // إعداد MAX30102
  Serial.println("\n--- اختبار MAX30102 ---");
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("❌ فشل في العثور على MAX30102");
  } else {
    Serial.println("✓ تم العثور على MAX30102");
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  // إعداد MPU6050
  Serial.println("\n--- اختبار MPU6050 ---");
  if (!mpu.begin()) {
    Serial.println("❌ فشل في العثور على MPU6050");
  } else {
    Serial.println("✓ تم العثور على MPU6050");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // إعداد GPS NEO-6M
  Serial.println("\n--- اختبار NEO-6M GPS ---");
  GPS_Serial.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17
  Serial.println("✓ تم تهيئة GPS");
  
  Serial.println("\n=== بدء القراءات ===\n");
  delay(2000);
}

void loop() {
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // قراءة MAX30102
  readMAX30102();
  
  // قراءة MPU6050
  readMPU6050();
  
  // قراءة GPS
  readGPS();
  
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  delay(2000); // تأخير ثانيتين بين القراءات
}

void readMAX30102() {
  Serial.println("📊 MAX30102 (النبض والأكسجين):");
  
  long irValue = particleSensor.getIR();
  
  if (irValue < 50000) {
    Serial.println("   ⚠️ لا يوجد إصبع على الحساس");
    beatsPerMinute = 0;
    beatAvg = 0;
  } else {
    if (checkForBeat(irValue) == true) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      
      beatsPerMinute = 60 / (delta / 1000.0);
      
      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= RATE_SIZE;
        
        beatAvg = 0;
        for (byte x = 0; x < RATE_SIZE; x++)
          beatAvg += rates[x];
        beatAvg /= RATE_SIZE;
      }
    }
    
    Serial.print("   IR: ");
    Serial.print(irValue);
    Serial.print(" | BPM: ");
    Serial.print(beatsPerMinute);
    Serial.print(" | Avg BPM: ");
    Serial.println(beatAvg);
  }
}

void readMPU6050() {
  Serial.println("🎯 MPU6050 (التسارع والدوران):");
  
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  accelX = a.acceleration.x;
  accelY = a.acceleration.y;
  accelZ = a.acceleration.z;
  
  gyroX = g.gyro.x;
  gyroY = g.gyro.y;
  gyroZ = g.gyro.z;
  
  Serial.print("   التسارع (m/s²) - X: ");
  Serial.print(accelX, 2);
  Serial.print(" | Y: ");
  Serial.print(accelY, 2);
  Serial.print(" | Z: ");
  Serial.println(accelZ, 2);
  
  Serial.print("   الدوران (rad/s) - X: ");
  Serial.print(gyroX, 2);
  Serial.print(" | Y: ");
  Serial.print(gyroY, 2);
  Serial.print(" | Z: ");
  Serial.println(gyroZ, 2);
  
  // كشف السقوط البسيط
  float totalAccel = sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ);
  if (totalAccel < 5.0) {
    Serial.println("   ⚠️ تحذير: اكتشاف سقوط محتمل!");
  }
}

void readGPS() {
  Serial.println("📍 NEO-6M GPS (الموقع):");
  
  // قراءة بيانات GPS لمدة ثانية واحدة
  unsigned long start = millis();
  while (millis() - start < 1000) {
    while (GPS_Serial.available() > 0) {
      gps.encode(GPS_Serial.read());
    }
  }
  
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
    satellites = gps.satellites.value();
    
    Serial.print("   خط العرض: ");
    Serial.println(latitude, 6);
    Serial.print("   خط الطول: ");
    Serial.println(longitude, 6);
    Serial.print("   الأقمار الصناعية: ");
    Serial.println(satellites);
    Serial.print("   الوقت: ");
    if (gps.time.isValid()) {
      Serial.printf("%02d:%02d:%02d\n", gps.time.hour(), gps.time.minute(), gps.time.second());
    }
  } else {
    Serial.println("   ⚠️ جاري البحث عن إشارة GPS...");
    Serial.print("   عدد الأحرف المعالجة: ");
    Serial.println(gps.charsProcessed());
  }
}