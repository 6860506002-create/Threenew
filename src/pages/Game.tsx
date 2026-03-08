import React from 'react';
import { Quiz } from '../components/Quiz';
import { Gamepad2, Trophy, Sparkles } from 'lucide-react';

export const Game = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F9] pb-24">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b-4 border-white mb-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cute-yellow/20 text-slate-700 font-bold text-sm mb-6">
            <Trophy size={16} className="text-cute-orange" />
            <span>โหมดท้าทายความรู้ ✨</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-slate-800 mb-4">มาทดสอบ <span className="text-cute-pink">ความเก่ง</span> กัน!</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">ตอบคำถามเกี่ยวกับน้องต้นไม้ให้ถูกทุกข้อนะคนเก่ง!</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6">
        <Quiz />
      </div>
    </div>
  );
};
