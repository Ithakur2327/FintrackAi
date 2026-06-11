import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}