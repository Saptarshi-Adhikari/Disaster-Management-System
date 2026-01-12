import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen bg-[#0B1221]"> 
      <Sidebar />
      
      {/* md:pl-64: Maintains space for sidebar on PC/Tablets.
          flex flex-col: Allows the spacer and content to stack.
      */}
      <main className="flex-1 md:pl-64 transition-all duration-300 flex flex-col w-full">
        
        {/* MOBILE SPACER: 
            This creates a 64px (h-16) empty zone at the top ONLY on mobile.
            This ensures that page titles never overlap with the hamburger menu.
        */}
        <div className="h-16 md:hidden shrink-0" />

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}