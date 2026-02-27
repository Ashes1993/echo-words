"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { completeLessonAction } from "../../../../actions/lesson.js";

export default function GameEngine({ lessonTitle, payload, lessonId }) {
  const router = useRouter();

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("learn"); // 'learn', 'quiz', or 'complete'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentWord = payload[currentIndex];

  // Progress Bar calculation
  const progressPercentage = (currentIndex / payload.length) * 100;

  const handleNextPhase = async () => {
    if (phase === "learn") {
      setPhase("quiz");
    } else if (phase === "quiz") {
      setSelectedAnswer(null);

      if (currentIndex + 1 < payload.length) {
        // Move to the next word
        setCurrentIndex(currentIndex + 1);
        setPhase("learn");
      } else {
        // The lesson is over, trigger the server action
        setIsSaving(true);
        const wordIds = payload.map((w) => w.id);

        const result = await completeLessonAction(lessonId, wordIds);

        setIsSaving(false);
        if (result.success) {
          setPhase("complete");
        } else {
          // Fallback if the database fails, just show the complete screen anyway for now
          setPhase("complete");
          console.error("Failed to save, but letting user proceed.");
        }
      }
    }
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return; // Prevent double-clicking
    setSelectedAnswer(option);
  };

  // --- UI: Completion Screen ---
  if (phase === "complete") {
    return (
      <div className="animate-slide-up bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6">
          <Trophy size={40} className="text-brand-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Lesson Complete!
        </h2>
        <p className="text-slate-500 mb-8">
          You successfully mastered {payload.length} words.
        </p>

        <div className="flex gap-4 mb-8 w-full justify-center">
          <div className="bg-brand-50 px-6 py-4 rounded-2xl border border-brand-100">
            <span className="block text-sm text-brand-600 font-bold mb-1">
              XP Earned
            </span>
            <span className="text-2xl font-extrabold text-brand-900">+50</span>
          </div>
          <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100">
            <span className="block text-sm text-amber-600 font-bold mb-1">
              Coins
            </span>
            <span className="text-2xl font-extrabold text-amber-900">+10</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/play")}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-brand-600 transition-colors active:scale-95"
        >
          Return to Path
        </button>
      </div>
    );
  }

  // Safety check in case a word has no quiz data seeded
  const currentQuiz = currentWord.quizzes[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-auto pb-safe">
      {/* Top Header & Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {lessonTitle}
          </span>
          <span className="text-sm font-bold text-brand-500">
            {currentIndex + 1} / {payload.length}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col justify-center min-h-[400px]">
        {/* --- Phase 1: Learning --- */}
        {phase === "learn" && (
          <div
            key={`learn-${currentWord.id}`}
            className="animate-slide-up bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
          >
            <div className="mb-6">
              <h2 className="text-4xl font-extrabold text-slate-900 capitalize mb-2">
                {currentWord.text}
              </h2>
              {currentWord.partOfSpeech && (
                <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-md mb-4">
                  {currentWord.partOfSpeech}
                </span>
              )}
              <p className="text-lg text-slate-700 leading-relaxed">
                {currentWord.definition}
              </p>
            </div>

            {currentWord.examples.length > 0 && (
              <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Example
                </span>
                <p className="text-slate-600 italic">
                  "{currentWord.examples[0].textBody}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- Phase 2: Quiz --- */}
        {phase === "quiz" && currentQuiz && (
          <div
            key={`quiz-${currentWord.id}`}
            className="animate-fade-in flex flex-col h-full"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-6">
              <span className="text-sm font-bold text-brand-500 mb-4 block flex items-center gap-2">
                <CheckCircle2 size={16} /> Knowledge Check
              </span>
              <p className="text-xl font-medium text-slate-800 leading-relaxed">
                {currentQuiz.textBody.replace("_____", "__________")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-auto">
              {currentQuiz.options.map((option, idx) => {
                const isCorrect = option === currentQuiz.correctAnswer;
                const isSelected = selectedAnswer === option;

                let buttonClass =
                  "bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50";

                if (selectedAnswer) {
                  if (isCorrect)
                    buttonClass =
                      "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-500 ring-opacity-50";
                  else if (isSelected)
                    buttonClass = "bg-red-50 border-red-500 text-red-700";
                  else
                    buttonClass =
                      "bg-white border-slate-200 text-slate-400 opacity-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-semibold ${buttonClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-4">
        {phase === "learn" ? (
          <button
            onClick={handleNextPhase}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-brand-600 transition-colors active:scale-95"
          >
            I got it <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleNextPhase}
            disabled={!selectedAnswer}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all active:scale-95 ${
              selectedAnswer
                ? "bg-brand-600 text-white shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Continue"} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
