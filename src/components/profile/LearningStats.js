import { BookOpen, BrainCircuit, Trophy } from "lucide-react";

export default function LearningStats({ learning, reviewing, mastered }) {
  const stats = [
    {
      label: "Learning",
      value: learning,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Reviewing",
      value: reviewing,
      icon: BrainCircuit,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Mastered",
      value: mastered,
      icon: Trophy,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center transition-all hover:shadow-md"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}
            >
              <Icon className={stat.color} size={24} />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 mb-1">
              {stat.value}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
