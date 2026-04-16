import { useEffect, useState } from "react";

function resolveDefaultValue(defaultValue) {
  return typeof defaultValue === "function" ? defaultValue() : defaultValue;
}

function useLocalStorage(key, defaultValue) {
  const [storedValue, setStoredValue] = useState(() =>
    resolveDefaultValue(defaultValue)
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    try {
      const savedValue = window.localStorage.getItem(key);

      if (savedValue !== null) {
        setStoredValue(JSON.parse(savedValue));
      } else {
        setStoredValue(resolveDefaultValue(defaultValue));
      }
    } catch (error) {
      setStoredValue(resolveDefaultValue(defaultValue));
    } finally {
      setIsHydrated(true);
    }
  }, [defaultValue, key]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [isHydrated, key, storedValue]);

  return [storedValue, setStoredValue, isHydrated];
}

export default useLocalStorage;
