import * as React from "react";

function dispatchStorageEvent(key: string, newValue: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

const setLocalStorageItem = (key: string, value: unknown) => {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const removeLocalStorageItem = (key: string) => {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

const getLocalStorageItem = (key: string) => {
  return window.localStorage.getItem(key);
};

const subscribeLocalStorage = (callback: (event: StorageEvent) => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

type SetStateCallback<T> = (value: T) => T;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = () => getLocalStorageItem(key);

  const store = React.useSyncExternalStore(subscribeLocalStorage, getSnapshot, () =>
    JSON.stringify(initialValue),
  );

  const setState = React.useCallback(
    (v: T | SetStateCallback<T>) => {
      try {
        const nextState =
          typeof v === "function" && store ? (v as SetStateCallback<T>)(JSON.parse(store)) : v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store],
  );

  React.useEffect(() => {
    if (getLocalStorageItem(key) === null && typeof initialValue !== "undefined") {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [store ? JSON.parse(store) : initialValue, setState] as [T, typeof setState];
}
