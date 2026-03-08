import React from 'react';
import { motion } from 'motion/react';
import { TreeDeciduous, Sparkles, BookHeart, Gamepad2, Layout, ArrowRight, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="relative overflow-hidden bg-[#FFF9F9] min-h-screen">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cute-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cute-yellow/10 rounded-full blur-3xl animate-pulse" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-4 border-cute-pink/20 text-cute-pink font-bold text-sm mb-8 shadow-sm"
          >
            <Sparkles size={16} />
            <span>มาสนุกกับน้องต้นไม้กันเถอะ! ✨</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-black text-slate-800 mb-6 leading-tight"
          >
            เรียนรู้เรื่อง <span className="text-cute-pink">Tree</span> <br />
            แบบ <span className="text-cute-yellow">น่ารัก</span> และ <span className="text-cute-mint">เข้าใจง่าย</span> 🌳
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium"
          >
            เปลี่ยนเรื่องโครงสร้างข้อมูลที่แสนยาก ให้กลายเป็นเรื่องสนุกและสดใสไปกับ Arboris 
            มาลองปลูกต้นไม้ในจินตนาการของคุณกันนะ! ✨
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/visualizer" className="group relative px-8 py-4 bg-cute-pink text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-cute-pink/30 hover:scale-105 active:scale-95 transition-all">
              เริ่มปลูกต้นไม้เลย! 🌳
              <div className="absolute -top-2 -right-2 bg-cute-yellow text-slate-800 p-1 rounded-full animate-bounce">
                <Star size={16} fill="currentColor" />
              </div>
            </Link>
            <Link to="/learn" className="px-8 py-4 bg-white text-slate-600 rounded-[2rem] font-bold text-lg border-4 border-slate-50 hover:bg-slate-50 transition-all">
              เรียนรู้พื้นฐาน 📖
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'จำลองต้นไม้',
                desc: 'ลองใส่ตัวเลขแล้วดูน้องต้นไม้เติบโตแบบเรียลไทม์เลยนะ!',
                icon: <Layout className="text-cute-pink" />,
                color: 'bg-cute-pink/10',
                path: '/visualizer'
              },
              {
                title: 'บทเรียนแสนสนุก',
                desc: 'เข้าใจเรื่อง Tree ได้ง่ายๆ ไม่ต้องปวดหัวอีกต่อไป!',
                icon: <BookHeart className="text-cute-blue" />,
                color: 'bg-cute-blue/10',
                path: '/learn'
              },
              {
                title: 'ควิซท้าทาย',
                desc: 'มาทดสอบความรู้กันว่าคุณเก่งเรื่องน้องต้นไม้แค่ไหน!',
                icon: <Gamepad2 className="text-cute-orange" />,
                color: 'bg-cute-orange/10',
                path: '/game'
              },
              {
                title: 'ความรู้รอบตัว',
                desc: 'เรื่องน่ารู้เกี่ยวกับ Tree ในโลกคอมพิวเตอร์!',
                icon: <Sparkles className="text-cute-yellow" />,
                color: 'bg-cute-yellow/10',
                path: '/learn'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="cute-card p-8 flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-black text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">{feature.desc}</p>
                <Link to={feature.path} className="mt-auto text-cute-pink font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  ไปดูกันเลย <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cute CTA */}
      <section className="py-20 px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-cute-gradient rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-cute-pink/20"
        >
          <div className="relative z-10">
            <Heart size={48} className="mx-auto mb-6 animate-bounce-slow" fill="currentColor" />
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">พร้อมที่จะเป็น <br />ผู้เชี่ยวชาญเรื่องต้นไม้หรือยัง?</h2>
            <p className="text-white/90 font-medium max-w-xl mx-auto mb-10 text-lg">
              มาเริ่มต้นการเดินทางที่แสนวิเศษไปกับน้อง Arboris กันเถอะ! รับรองว่าคุณจะรักโครงสร้างข้อมูลแบบนี้แน่นอน ✨
            </p>
            <Link to="/visualizer" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-cute-pink rounded-[2rem] font-bold text-lg hover:scale-110 active:scale-95 transition-all shadow-xl">
              เริ่มกันเลย! ✨
            </Link>
          </div>
          {/* Decorative bubbles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </motion.div>
      </section>
    </div>
  );
};
