"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      offset={24}
      gap={12}
      visibleToasts={4}
      closeButton
      richColors={false}
      theme="light"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#FFFFFF",
          border: "1px solid #E8E1D8",
          borderRadius: "12px",
          padding: "14px 18px",
          color: "#171717",
          boxShadow: "0 8px 28px rgba(69,4,7,0.12)",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        },
      }}
    />
  );
}
