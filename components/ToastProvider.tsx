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
      theme="dark"
      toastOptions={{
         style: {
           background: "rgba(20,20,20,0.92)",
           border: "1px solid rgba(255,255,255,0.08)",
           backdropFilter: "blur(40px) saturate(180%)",
           borderRadius: "20px",
           padding: "14px 18px",
           color: "white",
           boxShadow: "0 20px 60px -12px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)",
           fontSize: "0.875rem",
           lineHeight: "1.5",
         },
       }}
    />
  );
}
