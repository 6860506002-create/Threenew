import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, TreeDeciduous, BookOpen, Gamepad2, Binary, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { cn } from '../utils';

export const Home = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl px-4"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Sparkles size={16} />
            <span>เก่งโครงสร้างข้อมูล</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            เรียนรู้เรื่อง Tree แบบ <span className="text-transparent bg-clip-text bg-vibrant-gradient">เห็นภาพ</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Arboris คือแพลตฟอร์มการเรียนรู้แบบโต้ตอบที่ออกแบบมาเพื่อช่วยให้คุณเข้าใจ 
            สร้างภาพจำลอง และเชี่ยวชาญโครงสร้างข้อมูลแบบ Tree ผ่านการลงมือทำจริง
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="flex items-center gap-2 rounded-2xl bg-vibrant-gradient px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:scale-105 hover:rotate-1"
            >
              เริ่มเรียนรู้
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/visualizer"
              className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-brand-500"
            >
              ลองใช้เครื่องมือจำลอง
            </Link>
          </div>
        </motion.div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 -z-10 h-full w-full opacity-40">
           <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-200 blur-[100px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-vibrant-pink/20 blur-[100px] animate-pulse" />
           <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-vibrant-blue/20 blur-[80px]" />
        </div>
      </section>

      {/* Game Center Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">ศูนย์รวมเกม (Game Center)</h2>
          <p className="text-slate-500">เลือกโหมดการเล่นที่คุณต้องการเพื่อทดสอบฝีมือ</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'โหมดคลาสสิก', color: 'bg-brand-500', shadow: 'shadow-brand-200', icon: <Gamepad2 /> },
            { name: 'โหมดจับเวลา', color: 'bg-vibrant-pink', shadow: 'shadow-pink-200', icon: <Sparkles /> },
            { name: 'โหมดผู้เชี่ยวชาญ', color: 'bg-vibrant-purple', shadow: 'shadow-purple-200', icon: <Trophy /> },
            { name: 'โหมดฝึกฝน', color: 'bg-vibrant-orange', shadow: 'shadow-orange-200', icon: <BookOpen /> },
          ].map((game, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
              className="relative"
            >
              <Link
                to="/game"
                className={cn(
                  "flex flex-col items-center justify-center gap-4 rounded-3xl p-8 text-white shadow-2xl transition-all h-full",
                  game.color,
                  game.shadow
                )}
              >
                <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                  {React.cloneElement(game.icon as React.ReactElement, { size: 32 })}
                </div>
                <span className="text-xl font-bold">{game.name}</span>
                <div className="mt-2 rounded-full bg-white/30 px-4 py-1 text-xs font-bold uppercase tracking-widest">
                  เล่นเลย
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card 
            title="บทเรียนแบบโต้ตอบ" 
            icon={<BookOpen size={24} />}
            delay={0.1}
          >
            เจาะลึกคำศัพท์เกี่ยวกับ Tree, ประเภทต่างๆ และอัลกอริทึม พร้อมคำอธิบายและแผนภาพที่ชัดเจน
          </Card>
          <Card 
            title="ความท้าทายจากควิซ" 
            icon={<Gamepad2 size={24} />}
            delay={0.2}
          >
            ทดสอบความรู้ของคุณด้วยเกมควิซแบบโต้ตอบ และติดตามความก้าวหน้าของคุณในขณะที่เรียนรู้
          </Card>
          <Card 
            title="เครื่องมือจำลองสด" 
            icon={<Binary size={24} />}
            delay={0.3}
          >
            สร้าง Tree ของคุณเองแบบเรียลไทม์ ใส่โหนดและดูว่าโครงสร้างเปลี่ยนแปลงไปอย่างไรอย่างรวดเร็ว
          </Card>
        </div>
      </section>

      {/* Quick Stats/Info */}
      <section className="mx-auto max-w-5xl px-4">
         <div className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
               <div>
                  <h2 className="mb-4 text-3xl font-bold">ทำไมต้องเรียนเรื่อง Tree?</h2>
                  <p className="text-slate-400 leading-relaxed">
                    Tree เป็นพื้นฐานสำคัญของวิทยาการคอมพิวเตอร์ มันขับเคลื่อนทุกอย่างตั้งแต่ระบบไฟล์ 
                    และฐานข้อมูล ไปจนถึงการตัดสินใจของ AI และโครงสร้าง DOM ในเว็บเบราว์เซอร์ 
                    การเข้าใจเรื่องนี้เป็นกุญแจสำคัญในการเป็นวิศวกรซอฟต์แวร์ระดับสูง
                  </p>
               </div>
               <div className="flex justify-center">
                  <div className="relative h-48 w-48 flex items-center justify-center">
                     <TreeDeciduous size={120} className="text-brand-500" />
                     <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-700 animate-spin-slow" />
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};
