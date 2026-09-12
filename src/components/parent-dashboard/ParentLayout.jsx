"use client";

import Sidebar from "./Sidebar";
import ParentMobileNav from "./ParentMobileNav";
import ParentSplashScreen from "./ParentSplashScreen";

export default function ParentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#E8FAF6] dot-grid">
      <ParentSplashScreen />
      <Sidebar />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        {children}
      </main>
      <ParentMobileNav />
    </div>
  );
}
