import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { ALLOWED_EMAILS } from "../constants";
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
        const email = currentUser.email.toLowerCase();
        if (ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(email)) {
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
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return { handleLogin, handleLogout };
};
