import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export default function RootLayout() {
  return (
    <div className="h-screen min-h-screen w-screen bg-slate-200 dark:bg-slate-600">
    <div className="h-full max-w-[88rem] mx-auto flex shadow-2xl bg-white dark:bg-gray-900 rounded-lg">
      {/* Sidebar */}
        <Sidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
    </div>
  );
}