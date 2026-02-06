"use client";

import { useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <ToastProvider>
      <div className="antialiased">{children}</div>
    </ToastProvider>
  );
}
