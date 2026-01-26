import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Activity, Thermometer, History as HistoryIcon, 
User, ChevronRight, AlertCircle, Save, Edit2, Play, LogOut, Users, Settings, Bell, Shield, Zap, ShieldAlert, Accessibility
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { fetchESP32Data } from "./Logic";
import NotificationSystem from "./Notification";

import logoImg from "./logo.png";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// --- UI Components ---

const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, unit, color, trend }) => (
  <GlassCard className="group hover:border-white/20 transition-all duration-500">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className={`text-${color}-400`} size={24} />
    </div>
    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-2 mt-2">
      <span className="text-2xl font-black truncate">{value}</span>
      {unit && <span className="text-slate-500 text-xs font-medium">{unit}</span>}
    </div>
    {trend && (
      <div className={`mt-4 text-[10px] font-bold px-2 py-1 rounded-lg bg-${color}-500/10 text-${color}-400 inline-block`}>
        {trend}
      </div>
    )}
  </GlassCard>
);

const BottomNav = () => {
  const [location, setLocation] = useLocation();
  const tabs = [
    { id: "home", icon: Activity, label: { en: "Home", ar: "الرئيسية" }, path: "/" },
    { id: "history", icon: HistoryIcon, label: { en: "Logs", ar: "السجل" }, path: "/history" },
    { id: "profile", icon: User, label: { en: "Profile", ar: "الملف" }, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex justify-around items-center shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLocation(tab.path)}
            className={`relative flex flex-col items-center py-3 px-6 rounded-2xl transition-all duration-300 ${
              location === tab.path ? "text-teal-400 bg-white/5" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {location === tab.path && (
              <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/5 rounded-2xl -z-10" />
            )}
            <tab.icon size={22} className={location === tab.path ? "animate-pulse" : ""} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
              {document.documentElement.dir === "rtl" ? tab.label.ar : tab.label.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Pages ---

const WelcomePage = ({ onComplete }) => {
  const [step, setStep] = useState("lang");
  const [data, setData] = useState({ lang: "en", role: "patient" });
  const [savedProfiles, setSavedProfiles] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('evivor_profiles') || "[]");
    setSavedProfiles(stored);
  }, []);

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
      welcome: "EVIVOR",
      tagline: "Intelligent Wearable Guardian",
      selectLang: "Choose Your Language",
      selectRole: "Select Your Role",
      patient: "Patient",
      caregiver: "Caregiver",
      register: "Registration",
      name: "Full Name",
      nationalId: "National ID (14 digits)",
      age: "Age",
      history: "Medical History",
      start: "Start Journey",
      existing: "Quick Switch",
      back: "Back",
    },
    ar: {
      welcome: "إيفيفور",
      tagline: "الحارس الذكي القابل للارتداء",
      selectLang: "اختر لغتك",
      selectRole: "حدد دورك",
      patient: "مريض",
      caregiver: "مرافق",
      register: "التسجيل",
      name: "الاسم بالكامل",
      nationalId: "الرقم القومي (١٤ رقم)",
      age: "العمر",
      history: "التاريخ المرضي",
      start: "ابدأ الرحلة",
      existing: "تبديل سريع",
      back: "رجوع",
    }
  }[data.lang];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[160px] animate-pulse" />

      <AnimatePresence mode="wait">
        {step === "lang" && (
          <motion.div 
            key="lang" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="text-center w-full max-w-md flex flex-col items-center"
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
              <img src={logoImg} alt="EVIVOR" className="w-56 h-56 relative z-10 drop-shadow-[0_0_30px_rgba(20,184,166,0.3)]" />
            </div>
            <h1 className="text-6xl font-black mb-2 tracking-tighter bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">{t.welcome}</h1>
            <p className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-16">{t.tagline}</p>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              <button onClick={() => setLang("en")} className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-lg font-bold relative z-10">English</span>
              </button>
              <button onClick={() => setLang("ar")} className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-2xl font-black relative z-10 font-arabic">العربية</span>
              </button>
            </div>

            {savedProfiles.length > 0 && (
              <button onClick={() => setStep("switch")} className="mt-12 flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors font-bold text-xs uppercase tracking-widest">
                <Users size={16} />
                <span>{t.existing}</span>
              </button>
            )}
          </motion.div>
        )}

        {step === "switch" && (
          <motion.div 
            key="switch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="text-center w-full max-w-md"
          >
            <h2 className="text-3xl font-black mb-8 tracking-tight">{t.existing}</h2>
            <div className="space-y-3 mb-12">
              {savedProfiles.map((p) => (
                <button 
                  key={p.nationalId}
                  onClick={() => onComplete(p)}
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="text-left rtl:text-right flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold">
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-teal-400 transition-colors">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{p.nationalId}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-teal-400 group-hover:translate-x-1 transition-all rtl:rotate-180" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep("lang")} className="text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
              {t.back}
            </button>
          </motion.div>
        )}

        {step === "role" && (
          <motion.div 
            key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="text-center w-full max-w-md"
          >
            <h2 className="text-3xl font-black mb-12 tracking-tight">{t.selectRole}</h2>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setRole("patient")} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all flex items-center justify-between group">
                <div className="flex flex-col items-start rtl:items-end">
                  <span className="text-2xl font-black text-white group-hover:text-teal-400 transition-colors">{t.patient}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Health Monitoring</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
              </button>
              <button onClick={() => setRole("caregiver")} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all flex items-center justify-between group">
                <div className="flex flex-col items-start rtl:items-end">
                  <span className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{t.caregiver}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Remote Access</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
              </button>
            </div>
            <button onClick={() => setStep("lang")} className="mt-12 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
              {t.back}
            </button>
          </motion.div>
        )}

        {step === "reg" && (
          <motion.div 
            key="reg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-black mb-10 text-center tracking-tight">{t.register}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              onComplete({
                name: formData.get("name"),
                nationalId: formData.get("nationalId"),
                age: parseInt(formData.get("age")),
                role: data.role,
                language: data.lang,
                chronicConditions: formData.get("history")
              });
            }} className="space-y-4">
              <input name="name" placeholder={t.name} required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600 font-bold" />
              <input name="nationalId" placeholder={t.nationalId} required maxLength={14} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600 font-bold font-mono" />
              <input name="age" type="number" placeholder={t.age} required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600 font-bold" />
              <textarea name="history" placeholder={t.history} rows={3} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600 font-bold resize-none" />
              <button type="submit" className="w-full p-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-lg transition-all mt-6 shadow-[0_10px_20px_rgba(20,184,166,0.2)]">
                {t.start}
              </button>
            </form>
            <button onClick={() => setStep("role")} className="w-full mt-6 text-slate-500 hover:text-white transition-colors text-center font-bold text-xs uppercase tracking-widest">
              {t.back}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ profile, onDismissFall }) => {
  const [vitals, setVitals] = useState({ bpm: 0, spo2: 0, resRate: 0, isFall: false, activity: "Analysing..." });
  const [chartData, setChartData] = useState([]);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const t = profile.language === "ar" ? {
    vitals: "المؤشرات الحيوية",
    bpm: "ضربات القلب",
    spo2: "الأكسجين",
    res: "التنفس",
    status: "الحالة (AI)",
    baseline: "معايرة الذكاء",
    calibrating: "جاري المعايرة...",
    emergency: "تنبيه: حالة سقوط!",
  } : {
    vitals: "Health Dashboard",
    bpm: "Heart Rate",
    spo2: "Oxygen Level",
    status: "AI Status",
    res: "Resp. Rate",
    baseline: "AI Calibration",
    calibrating: "Calibrating...",
    emergency: "Emergency: Fall!",
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchESP32Data();
      // Placeholder activity logic
      const activities = ["Sitting", "Sleeping", "Walking", "Running", "Stable"];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setVitals({ ...data, activity: data.isFall ? "FALLEN" : randomActivity });
      setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), val: data.bpm }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logger = setInterval(() => {
      if (vitals.bpm > 0) {
        const logs = JSON.parse(localStorage.getItem(`evivor_history_${profile.nationalId}`) || '[]');
        const newLog = {
          ...vitals,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        };
        logs.push(newLog);
        localStorage.setItem(`evivor_history_${profile.nationalId}`, JSON.stringify(logs.slice(-50)));
      }
    }, 60000);
    return () => clearInterval(logger);
  }, [vitals, profile.nationalId]);

  return (
    <div className="p-8 space-y-8 pb-32">
      <NotificationSystem profile={profile} vitals={vitals} onDismissFall={onDismissFall} />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">{t.vitals}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em]">Guardian Active</span>
          </div>
        </div>
        <button 
          onClick={() => setIsCalibrating(true)}
          disabled={isCalibrating}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all font-bold text-[10px] uppercase tracking-wider ${
            isCalibrating ? "border-yellow-500/20 text-yellow-500 animate-pulse" : "border-white/10 text-slate-400 hover:border-teal-500/50 hover:text-teal-400"
          }`}
        >
          <Zap size={14} className={isCalibrating ? "animate-spin" : ""} />
          {isCalibrating ? t.calibrating : t.baseline}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Heart} label={t.bpm} value={vitals.bpm} unit="BPM" color="red" trend="+2% normal" />
        <StatCard icon={Activity} label={t.spo2} value={vitals.spo2} unit="%" color="blue" trend="Stable" />
        <StatCard icon={Thermometer} label={t.res} value={vitals.resRate} unit="/min" color="teal" trend="Good" />
        <StatCard icon={Accessibility} label={t.status} value={vitals.activity} color="purple" trend="AI Live" />
      </div>

      <GlassCard className="h-72 p-8 overflow-hidden relative">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time HR</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[40, 140]} hide />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem" }} />
            <Area type="monotone" dataKey="val" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
};

// ... History and Profile simplified for space ...

const HistoryPage = ({ profile }) => {
  const [logs, setLogs] = useState([]);
  const isAr = profile.language === "ar";
  useEffect(() => {
    const stored = localStorage.getItem(`evivor_history_${profile.nationalId}`);
    setLogs(stored ? JSON.parse(stored) : []);
  }, [profile.nationalId]);

  return (
    <div className="p-8 pb-32 space-y-8">
      <h1 className="text-4xl font-black tracking-tight">{isAr ? "سجل المتابعة" : "Health Logs"}</h1>
      <div className="space-y-4">
        {logs.map((log) => (
          <GlassCard key={log.id} className="flex justify-between items-center py-5 px-8 group hover:scale-[1.02] transition-transform">
            <div className="flex gap-6 items-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(log.timestamp).toLocaleDateString(undefined, {month:'short'})}</span>
                <span className="text-lg font-black">{new Date(log.timestamp).getDate()}</span>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div className="flex gap-4 mt-1 font-bold">
                  <span className="text-red-400">{log.bpm} BPM</span>
                  <span className="text-blue-400">{log.spo2}%</span>
                </div>
              </div>
            </div>
            {log.isFall && <div className="bg-red-500/20 text-red-500 p-2 rounded-xl animate-pulse"><ShieldAlert size={20}/></div>}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = ({ profile, onLogout }) => {
  const isAr = profile.language === "ar";
  return (
    <div className="p-8 pb-32 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tight">{isAr ? "الملف الشخصي" : "Guardian Profile"}</h1>
        <button onClick={onLogout} className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 transition-colors"><LogOut size={24}/></button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-teal-500/20 blur-3xl -z-10" />
        <GlassCard className="flex items-center gap-8 py-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center text-4xl font-black shadow-xl shadow-teal-500/20">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-3xl font-black">{profile.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full uppercase tracking-widest text-slate-400">{profile.role}</span>
              <span className="text-[10px] font-black px-3 py-1 bg-teal-500/10 rounded-full uppercase tracking-widest text-teal-400">Verified</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <GlassCard className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-slate-500 font-bold uppercase text-xs">National ID</span>
            <span className="font-mono font-bold tracking-tighter text-slate-300">{profile.nationalId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-slate-500 font-bold uppercase text-xs">Age</span>
            <span className="font-bold text-slate-300">{profile.age} Years</span>
          </div>
          <div className="space-y-2">
            <span className="text-slate-500 font-bold uppercase text-xs">Medical History</span>
            <p className="text-slate-300 font-medium leading-relaxed">{profile.chronicConditions || "No records provided"}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// --- App Orchestrator ---

function AppContent() {
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('evivor_current_profile');
    return stored ? JSON.parse(stored) : null;
  });

  const handleProfileUpdate = (data) => {
    const profiles = JSON.parse(localStorage.getItem('evivor_profiles') || "[]");
    const index = profiles.findIndex(p => p.nationalId === data.nationalId);
    if (index > -1) profiles[index] = data; else profiles.push(data);
    localStorage.setItem('evivor_profiles', JSON.stringify(profiles));
    localStorage.setItem('evivor_current_profile', JSON.stringify(data));
    setProfile(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500/30">
      {!profile ? (
        <WelcomePage onComplete={handleProfileUpdate} />
      ) : (
        <div className="max-w-2xl mx-auto min-h-screen relative">
          <Switch>
            <Route path="/history" component={() => <HistoryPage profile={profile} />} />
            <Route path="/profile" component={() => <ProfilePage profile={profile} onLogout={() => {localStorage.removeItem('evivor_current_profile'); setProfile(null);}} />} />            <Route path="/" component={() => <Dashboard profile={profile} onDismissFall={() => {}} />} />
          </Switch>
          <BottomNav />
        </div>
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
