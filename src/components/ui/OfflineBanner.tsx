import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-500 text-white text-[10px] font-bold py-1 px-4 flex items-center justify-center space-x-2 sticky top-0 z-[60]"
        >
          <WifiOff size={12} />
          <span>আপনি এখন অফলাইনে আছেন। কিছু ফিচার কাজ নাও করতে পারে।</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
