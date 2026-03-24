import { useState, useEffect } from "react";

export const TOAST_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warn",
  INFO: "info",
};

export const dispatchToast = ({ message, status, duration = 2000 }) => {
  // TODO: Rename event to @nmfs-ocio/react-radfish:dispatchToast (breaking change — requires major version bump)
  const toast = new CustomEvent("@nmfs-radfish/react-radfish:dispatchToast", {
    detail: { message, status, duration, expires_at: Date.now() + duration },
  });
  document.dispatchEvent(toast);
};

export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const nextToasts = [...toasts];
      const now = Date.now();
      const duration = event.detail.duration;

      const toast = {
        message: event.detail.message,
        status: event.detail.status,
        duration: now + duration,
      };
      nextToasts.unshift(toast);

      setTimeout(() => {
        setToasts((toasts) => toasts.filter((t) => t.expires_at < now));
      }, duration);

      setToasts(nextToasts);
    }

    // TODO: Rename event to @nmfs-ocio/react-radfish:dispatchToast (breaking change — requires major version bump)
    document.addEventListener("@nmfs-radfish/react-radfish:dispatchToast", handleToast);

    return () => {
      // TODO: Rename event to @nmfs-ocio/react-radfish:dispatchToast (breaking change — requires major version bump)
      document.removeEventListener("@nmfs-radfish/react-radfish:dispatchToast", handleToast);
    };
  }, []);

  return {
    toasts,
    setToasts,
  };
};
