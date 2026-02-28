export default function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${bgClass}`}
      >
        <Icon className={colorClass} size={28} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
