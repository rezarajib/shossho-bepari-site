import { useState, useEffect, useCallback } from "react";

/**
 * ব্রাউজারের LocalStorage-এ ডাটা অটো-সেভ এবং সিঙ্ক রাখার কাস্টম হুক
 * @param {string} key - LocalStorage কী (Key)
 * @param {*} initialValue - প্রাথমিক ডিফল্ট ভ্যালু
 */
export const useLocalStorage = (key, initialValue) => {
  // ১. প্রাথমিক ডাটা পড়া
  const readValue = useCallback(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readValue);

  // ২. নতুন ভ্যালু সেট ও LocalStorage-এ সংরক্ষণ
  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // একই পেজের অন্য কম্পোনেন্টকে জানানোর জন্য কাস্টম ইভেন্ট
          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // ৩. ডাটা মুছে ডিফল্ট অবস্থায় ফিরিয়ে নেওয়া
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // ৪. ব্রাউজারের অন্য ট্যাব থেকে ডাটা পরিবর্তন হলে অটো-আপডেট হওয়া
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;