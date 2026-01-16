export function readGuestAttempts(key: string, fallback: string[]) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return fallback;
    }

    return parsedValue.filter((value): value is string => typeof value === "string");
  } catch {
    return fallback;
  }
}

export function writeGuestAttempts(key: string, attempts: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(attempts));
    return true;
  } catch {
    return false;
  }
}
