import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Trophy, ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import { cn } from '../utils';

const questions = [
  {
    id: 1,
    question: "โหนดบนสุดของต้นไม้เรียกว่าอะไรนะ?",
    options: ["Leaf (ใบ)", "Root (ราก)", "Branch (กิ่ง)", "Seed (เมล็ด)"],
    answer: 1,
  },
  {
    id: 2,
    question: "โหนดที่ไม่มีลูกเลยเรียกว่าอะไร?",
    options: ["Root node", "Internal node", "Leaf node", "Parent node"],
    answer: 2,
  },
  {
    id: 3,
    question: "Binary Tree หนึ่งโหนดมีลูกได้มากที่สุดกี่คน?",
    options: ["1 คน", "2 คน", "3 คน", "ไม่จำกัด"],
    answer: 1,
  },
  {
    id: 4,
    question: "ความสูงของต้นไม้ (Height) วัดจากอะไร?",
    options: ["จำนวนโหนดทั้งหมด", "เส้นทางที่ยาวที่สุดจากรากไปหาใบ", "จำนวนชั้นทั้งหมด", "จำนวนกิ่งที่ติดกับราก"],
    answer: 1,
  },
  {
    id: 5,
    question: "ใน Binary Search Tree (BST) ข้อมูลที่น้อยกว่าจะถูกเก็บไว้ที่ไหน?",
    options: ["ฝั่งขวา", "ฝั่งซ้าย", "โหนดพ่อแม่", "โหนดใบเท่านั้น"],
    answer: 1,
  },
];

export const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="cute-card p-10 md:p-16 relative overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
              <motion.div 
                className="h-full bg-cute-pink" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="mb-12 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 mb-1">
                  คำถามที่ {currentQuestion + 1} จาก {questions.length}
                </span>
                <span className="text-sm font-bold text-cute-pink flex items-center gap-1">
                  <Sparkles size={14} /> กำลังทดสอบความรู้...
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cute-yellow/20 text-slate-700 font-bold text-sm">
                <Star size={16} fill="currentColor" className="text-cute-orange" />
                <span>คะแนน: {score}</span>
              </div>
            </div>

            <h2 className="mb-10 text-3xl font-display font-black text-slate-800 leading-tight">
              {questions[currentQuestion].question}
            </h2>

            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => {
                const isCorrect = index === questions[currentQuestion].answer;
                const isSelected = selectedOption === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                    className={cn(
                      "flex items-center justify-between rounded-[2rem] border-4 p-6 text-left transition-all group",
                      !isAnswered && "border-slate-50 hover:border-cute-pink hover:bg-slate-50",
                      isAnswered && isCorrect && "border-cute-mint bg-cute-mint/10 text-slate-800",
                      isAnswered && isSelected && !isCorrect && "border-cute-pink bg-cute-pink/10 text-slate-800",
                      !isSelected && (!isAnswered || !isCorrect) && "border-slate-50 text-slate-400"
                    )}
                  >
                    <span className="font-bold text-lg">{option}</span>
                    <div className="shrink-0">
                      {isAnswered && isCorrect && <CheckCircle2 className="text-cute-mint" size={28} />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="text-cute-pink" size={28} />}
                      {!isAnswered && <div className="w-7 h-7 rounded-full border-4 border-slate-100 group-hover:border-cute-pink transition-colors" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[2rem] px-10 py-5 font-bold text-lg transition-all shadow-xl",
                  isAnswered 
                    ? "bg-cute-pink text-white hover:scale-105 shadow-cute-pink/30" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                {currentQuestion === questions.length - 1 ? "ดูผลคะแนน ✨" : "ข้อถัดไป"}
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cute-card p-16 md:p-24 text-center relative overflow-hidden"
          >
            <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-cute-yellow text-slate-800 shadow-xl shadow-cute-yellow/30 animate-bounce-slow">
              <Trophy size={48} />
            </div>
            <h2 className="mb-4 text-5xl font-display font-black text-slate-800">จบเกมแล้ว! ✨</h2>
            <p className="mb-12 text-slate-500 font-medium text-xl">คุณทำคะแนนได้ {score} จาก {questions.length} คะแนน</p>
            
            <div className="mb-16 flex flex-wrap justify-center gap-6">
               <div className="rounded-[2.5rem] bg-white border-4 border-slate-50 p-8 min-w-[160px] shadow-sm">
                  <div className="text-4xl font-black text-cute-pink mb-1">{Math.round((score/questions.length)*100)}%</div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">ความแม่นยำ</div>
               </div>
               <div className="rounded-[2.5rem] bg-white border-4 border-slate-50 p-8 min-w-[160px] shadow-sm">
                  <div className="text-4xl font-black text-cute-mint mb-1">{score}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">ข้อที่ถูก</div>
               </div>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-3 mx-auto rounded-[2rem] bg-cute-pink px-10 py-5 font-bold text-lg text-white transition-all hover:scale-110 active:scale-95 shadow-xl shadow-cute-pink/30"
            >
              <RefreshCcw size={20} />
              เริ่มใหม่นะ ✨
            </button>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-cute-pink/10 animate-pulse">
              <Heart size={40} fill="currentColor" />
            </div>
            <div className="absolute bottom-10 right-10 text-cute-yellow/20 animate-bounce">
              <Star size={40} fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
