// src/app/(dashboard)/play/[id]/GameEngine.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy, BookOpen } from "lucide-react";
import { completeLessonAction } from "../../actions/lesson.js";

export default function GameEngine({ lessonTitle, steps, lessonId, wordId }) {
  const router = useRouter();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const step = steps[currentStepIndex];
  const progressPercentage = (currentStepIndex / steps.length) * 100;

  const handleNext = async () => {
    setSelectedAnswer(null); // Reset choice for the next screen

    if (currentStepIndex + 1 < steps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // End of the 6 steps
      setIsSaving(true);
      const result = await completeLessonAction(lessonId, [wordId]);
      setIsSaving(false);
      setIsComplete(true);
    }
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
  };

  // --- Completion Screen ---
  if (isComplete) {
    return (
      <div className="animate-slide-up bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6">
          <Trophy size={40} className="text-brand-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Word Mastered!
        </h2>
        <p className="text-slate-500 mb-8">
          You successfully completed all 6 exercises.
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

  // --- Render Current Step ---
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-auto pb-safe">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {lessonTitle}
          </span>
          <span className="text-sm font-bold text-brand-500">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col justify-center min-h-[400px]">
        {/* Step Type: Reveal */}
        {step.type === "reveal" && (
          <div
            key={`reveal-${currentStepIndex}`}
            className="animate-slide-up bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center"
          >
            <span className="text-brand-500 font-bold text-sm uppercase tracking-widest mb-6 block">
              {step.title}
            </span>
            <h2 className="text-5xl font-extrabold text-slate-900 capitalize mb-4">
              {step.word}
            </h2>
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-md mb-6">
              {step.partOfSpeech}
            </span>
            <p className="text-xl text-slate-700 leading-relaxed max-w-sm mx-auto">
              {step.definition}
            </p>
          </div>
        )}

        {/* Step Type: Story */}
        {step.type === "story" && (
          <div
            key={`story-${currentStepIndex}`}
            className="animate-fade-in bg-slate-900 rounded-3xl shadow-sm p-8 text-slate-100 relative overflow-hidden"
          >
            <BookOpen
              size={120}
              className="absolute -right-10 -bottom-10 text-slate-800 opacity-50"
            />
            <span className="text-brand-400 font-bold text-sm uppercase tracking-widest mb-6 block relative z-10">
              {step.title}
            </span>
            <p className="text-2xl leading-relaxed font-medium relative z-10">
              "{step.text}"
            </p>
          </div>
        )}

        {/* Step Type: Quiz (Formal, Casual, Synonym, T/F) */}
        {step.type === "quiz" && (
          <div
            key={`quiz-${currentStepIndex}`}
            className="animate-slide-up flex flex-col h-full"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-6">
              <span className="text-sm font-bold text-brand-500 mb-4 block">
                {step.title}
              </span>
              <p className="text-xl font-medium text-slate-800 leading-relaxed">
                {step.question.replace("_____", "__________")}
              </p>
            </div>

            <div
              className={`grid gap-3 mt-auto ${step.options.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {step.options.map((option, idx) => {
                const isCorrect = option === step.answer;
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
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all text-sm md:text-base font-medium leading-snug ${buttonClass}`}
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
        {step.type !== "quiz" ? (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-brand-600 transition-colors active:scale-95"
          >
            Continue <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedAnswer || isSaving}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all active:scale-95 ${
              selectedAnswer
                ? "bg-brand-600 text-white shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving Progress..." : "Continue"}{" "}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
