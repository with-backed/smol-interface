declare global {
  interface Window {
    pirsch(
      eventName: string,
      options: { duration?: number; meta?: { [key: string]: any } }
    ): void;
  }
}

export const pirsch: typeof window.pirsch = (...args) => {
  // Pirsch may be blocked by extensions; only try to send if it really exists
  if (window.pirsch) {
    window.pirsch(...args);
  }
};
