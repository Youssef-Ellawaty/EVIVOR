import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, UserCheck, XCircle, Users, ShieldAlert } from 'lucide-react';

const NotificationSystem = ({ profile, vitals, onDismissFall }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const isAr = profile?.language === "ar";

  useEffect(() => {
    if (vitals.isFall && !showPrompt && !notificationSent) {
      setShowPrompt(true);
    }
  }, [vitals.isFall, showPrompt, notificationSent]);

  const sendToFamily = () => {
    console.log(`Emergency alert sent for patient ID: ${profile.nationalId}`);
    setNotificationSent(true);
    setShowPrompt(false);
    alert(isAr 
      ? `🚨 تم إرسال تنبيه استغاثة فوري لعائلتك! (الرقم القومي: ${profile.nationalId})` 
      : `🚨 Emergency alert sent to your family! (ID: ${profile.nationalId})`
    );
  };

  const handleImOkay = () => {
    setShowPrompt(false);
    onDismissFall();
    setNotificationSent(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 40, rotateX: 15 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          className="w-full max-w-md bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(20,184,166,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative group">
            <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:blur-2xl transition-all" />
            <ShieldAlert size={48} className="text-red-500 relative z-10 animate-bounce" />
          </div>
          
          <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {isAr ? "هل أنت بخير؟" : "Are you okay?"}
          </h2>
          
          <p className="text-slate-400 mb-10 leading-relaxed text-lg">
            {isAr 
              ? "لقد تم رصد سقوط مفاجئ بواسطة حساساتنا الذكية. هل تحتاج إلى مساعدة طبية عاجلة؟"
              : "A sudden fall has been detected by our smart sensors. Do you need immediate medical assistance?"
            }
          </p>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleImOkay}
              className="py-5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(20,184,166,0.2)] active:scale-95"
            >
              <UserCheck size={24} />
              <span className="text-lg">{isAr ? "أنا بخير تماماً" : "I'm perfectly fine"}</span>
            </button>
            
            <button
              onClick={sendToFamily}
              className="py-5 bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10 hover:border-red-500/50 active:scale-95"
            >
              <XCircle size={24} />
              <span className="text-lg">{isAr ? "أحتاج للمساعدة" : "No, send help"}</span>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-3 text-slate-500">
            <Users size={18} />
            <span className="text-sm font-medium tracking-wider">{isAr ? `الرقم القومي: ${profile.nationalId}` : `National ID: ${profile.nationalId}`}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationSystem;
