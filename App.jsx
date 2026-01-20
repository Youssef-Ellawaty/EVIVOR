import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Activity, Thermometer, History as HistoryIcon, 
  User, ChevronRight, AlertCircle, Save, Edit2, Play
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchESP32Data } from "./Logic";
import logoImg from "@assets/unnamed-removebg-preview_1768896144305.png";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// --- Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl ${className}`}>
    {children}
  </div>
);

const BottomNav = () => {
  const [location, setLocation] = useLocation();
  const tabs = [
    { id: "home", icon: Activity, label: { en: "Home", ar: "الرئيسية" }, path: "/" },
    { id: "history", icon: HistoryIcon, label: { en: "History", ar: "السجل" }, path: "/history" },
    { id: "profile", icon: User, label: { en: "Profile", ar: "الملف" }, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-slate-950/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setLocation(tab.path)}
          className={`flex flex-col items-center gap-1 transition-all ${
            location === tab.path ? "text-teal-400 scale-110" : "text-slate-500"
          }`}
        >
          <tab.icon size={24} />
          <span className="text-xs font-medium">
            {document.documentElement.dir === "rtl" ? tab.label.ar : tab.label.en}
          </span>
        </button>
      ))}
    </div>
  );
};

// --- Pages ---

const WelcomePage = ({ onComplete }) => {
  const [step, setStep] = useState("lang");
  const [data, setData] = useState({ lang: "en", role: "patient" });

  const setLang = (l) => {
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    setData({ ...data, lang: l });
    setStep("role");
  };

  const setRole = (r) => {
    setData({ ...data, role: r });
    setStep("reg");
  };

  const t = {
    en: {
      welcome: "Welcome to EVIVOR",
      selectLang: "Choose Your Language",
      selectRole: "Select Your Role",
      patient: "Patient",
      caregiver: "Caregiver",
      register: "Registration",
      name: "Full Name",
      age: "Age",
      history: "Medical History",
      start: "Start Journey",
    },
    ar: {
      welcome: "مرحباً بك في إيفيفور",
      selectLang: "اختر لغتك",
      selectRole: "حدد دورك",
      patient: "مريض",
      caregiver: "مرافق",
      register: "التسجيل",
      name: "الاسم بالكامل",
      age: "العمر",
      history: "التاريخ المرضي",
      start: "ابدأ الرحلة",
    }
  }[data.lang];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />

      <AnimatePresence mode="wait">
        {step === "lang" && (
          <motion.div 
            key="lang" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="text-center w-full max-w-md flex flex-col items-center"
          >
            <img src={logoImg} alt="EVIVOR Logo" className="w-32 h-32 mb-8 object-contain" />
            <h1 className="text-4xl font-bold mb-12 tracking-tight">EVIVOR</h1>
            <p className="text-slate-400 mb-8">{t.selectLang}</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button onClick={() => setLang("en")} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500 transition-all font-semibold">English</button>
              <button onClick={() => setLang("ar")} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500 transition-all font-semibold text-xl">العربية</button>
            </div>
          </motion.div>
        )}

        {step === "role" && (
          <motion.div 
            key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="text-center w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-8">{t.selectRole}</h2>
            <div className="space-y-4">
              <button onClick={() => setRole("patient")} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500 transition-all flex items-center justify-between group">
                <span className="text-lg">{t.patient}</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
              <button onClick={() => setRole("caregiver")} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500 transition-all flex items-center justify-between group">
                <span className="text-lg">{t.caregiver}</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "reg" && (
          <motion.div 
            key="reg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">{t.register}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              onComplete({
                name: formData.get("name"),
                age: parseInt(formData.get("age")),
                role: data.role,
                language: data.lang,
                chronicConditions: formData.get("history")
              });
            }} className="space-y-4">
              <input name="name" placeholder={t.name} required className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none" />
              <input name="age" type="number" placeholder={t.age} required className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none" />
              <textarea name="history" placeholder={t.history} rows={4} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none resize-none" />
              <button type="submit" className="w-full p-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold transition-all mt-4">{t.start}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ profile }) => {
  const [vitals, setVitals] = useState({ bpm: 0, spo2: 0, resRate: 0, isFall: false });
  const [chartData, setChartData] = useState([]);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const t = profile.language === "ar" ? {
    vitals: "المؤشرات الحيوية",
    bpm: "ضربات القلب",
    spo2: "نسبة الأكسجين",
    res: "معدل التنفس",
    baseline: "معايرة الذكاء الاصطناعي",
    calibrating: "جاري المعايرة...",
    emergency: "تنبيه: حالة سقوط!",
  } : {
    vitals: "Live Vitals",
    bpm: "Heart Rate",
    spo2: "SpO2",
    res: "Resp. Rate",
    baseline: "AI Baseline",
    calibrating: "Calibrating...",
    emergency: "Emergency: Fall Detected!",
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchESP32Data();
      setVitals(data);
      setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), val: data.bpm }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logger = setInterval(() => {
      if (vitals.bpm > 0) {
        fetch("/api/vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vitals)
        });
      }
    }, 60000);
    return () => clearInterval(logger);
  }, [vitals]);

  const calibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 30000);
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      {vitals.isFall && (
        <div className="fixed inset-0 bg-red-600/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-pulse">
          <AlertCircle size={120} className="mb-8" />
          <h1 className="text-4xl font-bold mb-4">{t.emergency}</h1>
          <button onClick={() => setVitals({...vitals, isFall: false})} className="px-12 py-4 bg-white text-red-600 rounded-full font-bold text-xl shadow-2xl">DISMISS</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold">{t.vitals}</h1>
            <p className="text-teal-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              Live Connection
            </p>
          </div>
        </div>
        <button 
          onClick={calibrate}
          disabled={isCalibrating}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            isCalibrating ? "border-yellow-500 text-yellow-500 animate-pulse" : "border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
          }`}
        >
          <Play size={16} />
          <span className="text-xs font-semibold">{isCalibrating ? t.calibrating : t.baseline}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex flex-col items-center text-center">
          <Heart className="text-red-400 mb-2" />
          <span className="text-slate-400 text-sm">{t.bpm}</span>
          <div className="text-4xl font-bold mt-1">{vitals.bpm} <span className="text-sm font-normal text-slate-500">BPM</span></div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center text-center">
          <Activity className="text-blue-400 mb-2" />
          <span className="text-slate-400 text-sm">{t.spo2}</span>
          <div className="text-4xl font-bold mt-1">{vitals.spo2} <span className="text-sm font-normal text-slate-500">%</span></div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center text-center">
          <Thermometer className="text-teal-400 mb-2" />
          <span className="text-slate-400 text-sm">{t.res}</span>
          <div className="text-4xl font-bold mt-1">{vitals.resRate} <span className="text-sm font-normal text-slate-500">/min</span></div>
        </GlassCard>
      </div>

      <GlassCard className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[40, 120]} hide />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="val" stroke="#14b8a6" strokeWidth={3} dot={false} animationDuration={300} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
};

const HistoryPage = ({ profile }) => {
  const { data: logs, isLoading } = useQuery({ queryKey: ["/api/vitals"] });
  const isAr = profile.language === "ar";

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
        <h1 className="text-2xl font-bold">{isAr ? "سجل المريض" : "Patient History"}</h1>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin text-teal-500" /></div>
      ) : (
        <div className="space-y-4">
          {logs?.map((log) => (
            <GlassCard key={log.id} className="flex justify-between items-center py-4 px-6">
              <div>
                <div className="text-sm text-slate-400">{new Date(log.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</div>
                <div className="flex gap-4 mt-1">
                  <span className="text-sm"><span className="text-red-400 font-bold">{log.bpm}</span> BPM</span>
                  <span className="text-sm"><span className="text-blue-400 font-bold">{log.spo2}</span> %</span>
                </div>
              </div>
              {log.isFall && <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Fall</span>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ profile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const isAr = profile.language === "ar";
  
  const t = isAr ? {
    title: "الملف الشخصي",
    name: "الاسم",
    age: "العمر",
    conditions: "التاريخ المرضي",
    save: "حفظ",
  } : {
    title: "Patient File",
    name: "Name",
    age: "Age",
    conditions: "Medical History",
    save: "Save",
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <button 
          onClick={() => {
            if (editing) {
              const form = document.getElementById("profile-form");
              const data = new FormData(form);
              onUpdate({
                name: data.get("name"),
                age: parseInt(data.get("age")),
                role: profile.role,
                language: profile.language,
                chronicConditions: data.get("history")
              });
            }
            setEditing(!editing);
          }}
          className="p-2 rounded-full bg-teal-500/10 text-teal-400"
        >
          {editing ? <Save size={20} /> : <Edit2 size={20} />}
        </button>
      </div>

      <form id="profile-form" className="space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center text-3xl font-bold">
            {profile.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-xl font-bold">{profile.name}</div>
            <div className="text-slate-400 text-sm uppercase tracking-widest">{profile.role}</div>
          </div>
        </div>

        <GlassCard className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase block mb-1">{t.name}</label>
            {editing ? <input name="name" defaultValue={profile.name} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none" /> : <div className="text-lg">{profile.name}</div>}
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase block mb-1">{t.age}</label>
            {editing ? <input name="age" type="number" defaultValue={profile.age} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none" /> : <div className="text-lg">{profile.age}</div>}
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase block mb-1">{t.conditions}</label>
            {editing ? <textarea name="history" defaultValue={profile.chronicConditions} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none resize-none" rows={4} /> : <div className="text-slate-300">{profile.chronicConditions || "---"}</div>}
          </div>
        </GlassCard>
      </form>
    </div>
  );
};

// --- App Orchestrator ---

function AppContent() {
  const { data: profile, isLoading, refetch } = useQuery({ queryKey: ["/api/profile"] });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: (newData) => {
      qc.setQueryData(["/api/profile"], newData);
    }
  });

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Activity className="animate-spin text-teal-500" /></div>;

  // Set RTL based on profile if it exists
  if (profile) {
    document.documentElement.dir = profile.language === "ar" ? "rtl" : "ltr";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {!profile ? (
        <WelcomePage onComplete={mutation.mutate} />
      ) : (
        <>
          <Switch>
            <Route path="/history" component={() => <HistoryPage profile={profile} />} />
            <Route path="/profile" component={() => <ProfilePage profile={profile} onUpdate={mutation.mutate} />} />
            <Route path="/" component={() => <Dashboard profile={profile} />} />
            <Route component={() => <Dashboard profile={profile} />} />
          </Switch>
          <BottomNav />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
