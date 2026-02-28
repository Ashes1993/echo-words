import Link from "next/link";
import { Home, Gamepad2, User, BookOpen } from "lucide-react";
import Header from "../../components/layout/Header.js";

export const metadata = {
  title: "Retain | Dashboard",
  description: "Track your vocabulary progression and daily streaks.",
};

export default function DashboardLayout({ children }) {
  const navItems = [
    { name: "Overview", href: "/overview", icon: Home },
    { name: "Play", href: "/play", icon: Gamepad2 },
    { name: "Store", href: "#", icon: BookOpen, disabled: true },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-extrabold text-brand-600 tracking-tight">
            Retain.
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed pointer-events-none text-slate-400"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
                }`}
                aria-label={`Maps to ${item.name}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* The Dynamic Header */}
        <Header />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                item.disabled
                  ? "opacity-30 pointer-events-none"
                  : "text-slate-500 hover:text-brand-600 active:scale-90"
              }`}
              aria-label={`Maps to ${item.name}`}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-[10px] font-semibold tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
