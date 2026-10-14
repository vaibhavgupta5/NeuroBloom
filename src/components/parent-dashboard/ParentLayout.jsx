"use client";

import Sidebar from "./Sidebar";
import ParentMobileNav from "./ParentMobileNav";

export default function ParentLayout({ children }) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col pb-28 md:pb-0">{children}</main>
      <ParentMobileNav />
    </div>
  );
}
