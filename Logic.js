// SensorData matches the response from ESP32 or Mock
/**
 * @typedef {Object} SensorData
 * @property {number} bpm
 * @property {number} spo2
 * @property {number} resRate
 * @property {boolean} isFall
 * @property {number} lat
 * @property {number} lng
 */

// Fallback Mock Generator
function generateMockData() {
  const isFall = Math.random() < 0.01; // 1% chance of fall for demo
  
  return {
    bpm: Math.floor(Math.random() * (100 - 60) + 60), // 60-100 bpm
    spo2: Math.floor(Math.random() * (100 - 95) + 95), // 95-100 %
    resRate: Math.floor(Math.random() * (20 - 12) + 12), // 12-20 breaths/min
    isFall: isFall,
    lat: 24.7136 + (Math.random() * 0.01 - 0.005), // Approx Riyadh
    lng: 46.6753 + (Math.random() * 0.01 - 0.005),
  };
}

// Main fetch function
export async function fetchESP32Data(espIp = "http://192.168.1.50/data") {
  try {
    // Attempt to fetch from local IP with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout
    
    const response = await fetch(espIp, { 
      signal: controller.signal,
      mode: 'cors' // Assuming ESP32 handles CORS
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("ESP32 response not ok");
    }

    const data = await response.json();
    return {
      bpm: Number(data.bpm),
      spo2: Number(data.spo2),
      resRate: Number(data.resRate),
      isFall: Boolean(data.isFall),
      lat: Number(data.lat),
      lng: Number(data.lng),
    };
  } catch (error) {
    // console.warn("ESP32 offline or unreachable, using mock data:", error);
    return generateMockData();
  }
}

// Baseline Calibration Logic
export function calculateBaseline(history) {
  if (!history || history.length === 0) return { avgBpm: 75, avgSpo2: 98 };
  
  const totalBpm = history.reduce((acc, curr) => acc + curr.bpm, 0);
  const totalSpo2 = history.reduce((acc, curr) => acc + curr.spo2, 0);
  
  return {
    avgBpm: Math.round(totalBpm / history.length),
    avgSpo2: Math.round(totalSpo2 / history.length),
  };
}
