import Link from "next/link";
import { BrainCircuit, CheckCircle2 } from "lucide-react";

export default function DailyReviewBanner({ pendingReviewsCount }) {
  if (pendingReviewsCount === 0) {
    return (
      <div className="bg-brand-50 border border-brand-100 p-6 rounded-3xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-900">
              All caught up!
            </h2>
            <p className="text-brand-700 font-medium">
              Your daily reviews are complete. Hit the path to learn new words.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-lg shadow-slate-900/20">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center shadow-inner">
          <BrainCircuit size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold mb-1">Daily Review Ready</h2>
          <p className="text-slate-300 font-medium">
            You have{" "}
            <span className="text-brand-400 font-bold">
              {pendingReviewsCount} words
            </span>{" "}
            ready to be reinforced.
          </p>
        </div>
      </div>

      <Link
        href="/review"
        className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 font-extrabold rounded-2xl hover:bg-brand-50 transition-colors active:scale-95 text-center"
      >
        Start Review
      </Link>
    </div>
  );
}
