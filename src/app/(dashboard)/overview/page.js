export default function OverviewPage() {
  return (
    <div className="animate-slide-up">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Your daily statistics and progress.
        </p>
      </header>

      {/* Skeleton placeholder for where charts/data will go */}
      <div className="h-64 rounded-2xl bg-white border border-slate-200 shadow-sm"></div>
    </div>
  );
}
