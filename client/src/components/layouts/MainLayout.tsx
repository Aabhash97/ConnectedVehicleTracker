import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pt-4 md:pt-0">
        <div className="md:py-6 md:px-8 px-4 py-20 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
