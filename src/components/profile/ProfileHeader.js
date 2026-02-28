import { User as UserIcon } from "lucide-react";

export default function ProfileHeader({ name, email, level }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 mb-8 text-center md:text-left">
      <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 border-4 border-white shadow-md">
        {name ? (
          <span className="text-4xl font-extrabold">
            {name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <UserIcon size={40} />
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {name || "Learner"}
        </h2>
        <p className="text-slate-500 font-medium mb-2">{email}</p>
        <span className="inline-block bg-brand-50 text-brand-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-100">
          Level {level}
        </span>
      </div>
    </div>
  );
}
