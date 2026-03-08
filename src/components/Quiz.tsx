import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Trophy } from 'lucide-react';
import { cn } from '../utils';

const questions = [
  {
    id: 1,
    question: "Root (ราก) ของ Tree คืออะไร?",
    options: ["โหนดที่อยู่ล่างสุด", "โหนดบนสุดที่ไม่มีโหนดพ่อ", "โหนดที่ไม่มีลูก", "เส้นเชื่อมระหว่างโหนด"],
    answer: 1,
  },
  {
    id: 2,
    question: "โหนดใดที่ไม่มีโหนดลูก?",
    options: ["Root node", "Internal node", "Leaf node", "Parent node"],
    answer: 2,
  },
  {
    id: 3,
    question: "Binary Tree สามารถมีลูกได้สูงสุดกี่โหนดต่อหนึ่งโหนด?",
    options: ["1", "2", "3", "ไม่จำกัด"],
    answer: 1,
  },
  {
    id: 4,
    question: "Height (ความสูง) ของ Tree คืออะไร?",
    options: ["จำนวนโหนดทั้งหมดใน Tree", "ความยาวของเส้นทางที่ยาวที่สุดจาก Root ไปยัง Leaf", "จำนวนระดับใน Tree", "จำนวนเส้นเชื่อมที่ต่อกับ Root"],
    answer: 1,
  },
  {
    id: 5,
    question: "ใน Binary Search Tree (BST) ค่าที่น้อยกว่าจะถูกเก็บไว้ที่ใดเมื่อเทียบกับโหนดปัจจุบัน?",
    options: ["ใน Subtree ฝั่งขวา", "ใน Subtree ฝั่งซ้าย", "ในโหนดพ่อ", "ในโหนดใบเท่านั้น"],
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
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                คำถามที่ {currentQuestion + 1} จาก {questions.length}
              </span>
              <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-vibrant-gradient transition-all duration-500" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="mb-8 text-2xl font-bold text-slate-900">
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
                      "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                      !isAnswered && "hover:border-brand-200 hover:bg-brand-50",
                      isAnswered && isCorrect && "border-green-500 bg-green-50 text-green-700",
                      isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-50 text-red-700",
                      !isSelected && (!isAnswered || !isCorrect) && "border-slate-100 text-slate-600"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="text-green-500" size={20} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={cn(
                  "rounded-xl px-8 py-3 font-semibold text-white transition-all shadow-lg",
                  isAnswered 
                    ? "bg-vibrant-gradient hover:scale-105 shadow-blue-200" 
                    : "bg-slate-200 cursor-not-allowed"
                )}
              >
                {currentQuestion === questions.length - 1 ? "เสร็จสิ้น" : "คำถามถัดไป"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xl"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-vibrant-yellow text-slate-900 shadow-xl shadow-yellow-100">
              <Trophy size={40} />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-slate-900">ทำควิซเสร็จแล้ว!</h2>
            <p className="mb-8 text-slate-500">คุณได้คะแนน {score} จาก {questions.length}</p>
            
            <div className="mb-10 flex justify-center gap-4">
               <div className="rounded-2xl bg-vibrant-blue/10 p-4 min-w-[120px] border border-vibrant-blue/20">
                  <div className="text-2xl font-bold text-vibrant-blue">{Math.round((score/questions.length)*100)}%</div>
                  <div className="text-xs text-vibrant-blue/60 uppercase font-semibold">ความแม่นยำ</div>
               </div>
               <div className="rounded-2xl bg-brand-50 p-4 min-w-[120px] border border-brand-100">
                  <div className="text-2xl font-bold text-brand-600">{score}</div>
                  <div className="text-xs text-brand-600/60 uppercase font-semibold">ถูกต้อง</div>
               </div>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 mx-auto rounded-xl bg-vibrant-gradient px-8 py-3 font-semibold text-white transition-all hover:scale-105 shadow-xl shadow-blue-200"
            >
              <RefreshCcw size={20} />
              ลองอีกครั้ง
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
