import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { ALLOWED_EMAILS, isAdminEmail } from "../constants";
import { toast } from "sonner";

export const useAuth = () => {
  const { setUser, setIsAdmin, setAuthLoading, setIsLoading } = useStore();

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      const loader = document.getElementById("pwa-loader");
      if (loader && loader.style.opacity !== "0") {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => loader.remove(), 500);
        setAuthLoading(false);
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(safetyTimeout);
      setUser(currentUser);
      
      if (currentUser && currentUser.email) {
        if (isAdminEmail(currentUser.email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
      setAuthLoading(false);

      const loader = document.getElementById("pwa-loader");
      if (loader) {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => loader.remove(), 500);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [setUser, setIsAdmin, setAuthLoading, setIsLoading]);

  const handleLogin = async () => {
    if (!window.navigator.onLine) {
      toast.error("আপনার ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে সংযোগ চেক করুন।");
      return;
    }
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error("পপ-আপ ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অপশনটি চালু করুন।");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("নেটওয়ার্ক সমস্যা। আপনার ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।");
      } else {
        toast.error("লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return { handleLogin, handleLogout };
};
