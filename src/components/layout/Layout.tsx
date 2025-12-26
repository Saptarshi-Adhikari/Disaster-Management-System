import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    // bg-[#0B1221] matches your dark theme dashboard exactly
    <div className="flex min-h-screen bg-[#0B1221]"> 
      <Sidebar />
      {/* md:pl-64 prevents the dashboard from sliding under the sidebar */}
      <main className="flex-1 md:pl-64 transition-all duration-300">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}