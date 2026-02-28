import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Retain | Authentication",
  description: "Sign in to continue your vocabulary journey.",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Brand Header */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="text-brand-600" size={24} />
          <span className="text-2xl font-extrabold tracking-tight">
            Retain.
          </span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative z-10 animate-slide-up">
        {children}
      </div>
    </div>
  );
}
