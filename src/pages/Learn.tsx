import React from 'react';
import { motion } from 'motion/react';
import { Info, GitCommit, Layers, Network, ChevronRight, Sparkles, BookHeart, Target, Cpu } from 'lucide-react';

const topics = [
  {
    id: 'what-is-tree',
    title: 'น้องต้นไม้คืออะไรนะ?',
    icon: <Info size={20} />,
    content: 'Tree หรือ "ต้นไม้" คือวิธีการจัดเก็บข้อมูลที่เหมือนกับกิ่งก้านของต้นไม้จริงๆ เลยล่ะ! โดยจะมีจุดเริ่มต้นที่เรียกว่า "ราก" แล้วค่อยๆ แตกกิ่งก้านสาขาออกไปหา "ลูกๆ" ของมันนั่นเอง',
    example: 'ระบบโฟลเดอร์ในคอมพิวเตอร์ หรือแผนผังครอบครัว',
    diagram: 'ราก -> กิ่ง A, กิ่ง B -> ใบไม้'
  },
  {
    id: 'terminology',
    title: 'คำศัพท์น่ารู้',
    icon: <GitCommit size={20} />,
    content: 'มาทำความรู้จักกับสมาชิกในครอบครัวต้นไม้กันเถอะ:',
    list: [
      { name: 'Root (ราก)', desc: 'โหนดบนสุดที่เป็นจุดเริ่มต้นของทุกอย่าง' },
      { name: 'Parent (พ่อแม่)', desc: 'โหนดที่มีลูกๆ แตกกิ่งออกมา' },
      { name: 'Child (ลูก)', desc: 'โหนดที่เกิดมาจากโหนดพ่อแม่อีกที' },
      { name: 'Leaf (ใบ)', desc: 'โหนดสุดท้ายที่ไม่มีลูกแล้ว เหมือนใบไม้ปลายกิ่ง' }
    ]
  },
  {
    id: 'depth-height',
    title: 'ความลึกและความสูง',
    icon: <Layers size={20} />,
    content: 'เราสามารถวัดขนาดของน้องต้นไม้ได้ด้วยนะ:',
    list: [
      { name: 'Depth (ความลึก)', desc: 'วัดจากรากลงมาหาโหนดนั้นๆ ว่าอยู่ลึกแค่ไหน' },
      { name: 'Height (ความสูง)', desc: 'วัดจากโหนดนั้นลงไปหาใบที่ไกลที่สุด' }
    ]
  },
  {
    id: 'types',
    title: 'ต้นไม้แบบต่างๆ',
    icon: <Network size={20} />,
    content: 'น้องต้นไม้มีหลายสายพันธุ์เลยนะ แต่ละแบบก็เก่งไม่เหมือนกัน:',
    subtopics: [
      { name: 'General Tree', desc: 'ต้นไม้ทั่วไป มีลูกกี่คนก็ได้ตามใจชอบเลย' },
      { name: 'Binary Tree', desc: 'ต้นไม้คู่ มีลูกได้ไม่เกิน 2 คน (ซ้ายกับขวา)' },
      { name: 'BST', desc: 'ต้นไม้ค้นหา ที่จัดระเบียบให้หาข้อมูลง่ายสุดๆ' },
      { name: 'Heap', desc: 'ต้นไม้พิเศษที่ช่วยจัดลำดับความสำคัญได้เก่งมาก' }
    ]
  },
  {
    id: 'environment',
    title: 'น้องต้นไม้อยู่ที่ไหนบ้าง?',
    icon: <Cpu size={20} />,
    content: 'ในโลกคอมพิวเตอร์ เราเจอน้องต้นไม้ได้ทุกที่เลยนะ:',
    list: [
      { name: 'File Systems', desc: 'ช่วยจัดระเบียบไฟล์และโฟลเดอร์ให้เรา' },
      { name: 'HTML DOM', desc: 'โครงสร้างของหน้าเว็บสวยๆ ที่เราเห็นกัน' },
      { name: 'Databases', desc: 'ช่วยให้เราหาข้อมูลเจอในพริบตาเดียว' },
      { name: 'AI Logic', desc: 'ช่วยให้ AI ตัดสินใจได้อย่างชาญฉลาด' }
    ]
  }
];

export const Learn = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F9] pb-24">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b-4 border-white mb-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cute-pink/10 border-2 border-cute-pink/20 text-cute-pink text-sm font-bold mb-6">
            <BookHeart size={16} />
            <span>บทเรียนแสนสนุก v3.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-slate-800 mb-4">เรียนรู้เรื่อง <span className="text-cute-pink">Tree</span> ✨</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">มาทำความรู้จักกับโครงสร้างข้อมูลที่น่ารักที่สุดในโลกกันเถอะ!</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-20">
          {topics.map((topic, index) => (
            <motion.section
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit text-center lg:text-left">
                <div className="w-16 h-16 bg-cute-pink rounded-[2rem] flex items-center justify-center text-white mx-auto lg:mx-0 mb-6 shadow-lg shadow-cute-pink/30 animate-bounce-slow">
                  {topic.icon}
                </div>
                <h2 className="text-3xl font-display font-black text-slate-800 mb-4">{topic.title}</h2>
                <div className="w-16 h-2 bg-cute-yellow rounded-full mx-auto lg:mx-0" />
              </div>

              <div className="lg:col-span-8 cute-card p-10 md:p-14">
                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">{topic.content}</p>
                
                {topic.list && (
                  <div className="grid gap-4 mb-10">
                    {topic.list.map((item) => (
                      <div key={item.name} className="flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-[2rem] bg-slate-50 border-4 border-white shadow-sm">
                        <div className="text-xs font-bold text-white bg-cute-pink px-4 py-1.5 rounded-full w-fit shadow-sm">{item.name}</div>
                        <div className="text-slate-500 font-medium">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {topic.subtopics && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {topic.subtopics.map((sub) => (
                      <div key={sub.name} className="p-6 rounded-[2rem] bg-white border-4 border-slate-50 hover:border-cute-pink transition-colors shadow-sm group">
                        <div className="font-black text-cute-pink mb-2 text-sm uppercase tracking-wider group-hover:scale-110 transition-transform origin-left">{sub.name}</div>
                        <div className="text-sm text-slate-500 font-medium">{sub.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {topic.example && (
                  <div className="mt-10 p-6 rounded-[2rem] bg-cute-yellow text-slate-800 flex items-center gap-4 shadow-lg shadow-cute-yellow/20">
                    <Target size={24} className="shrink-0" />
                    <p className="font-bold text-sm">ตัวอย่าง: {topic.example}</p>
                  </div>
                )}

                {topic.diagram && (
                  <div className="mt-8 p-10 rounded-[2.5rem] bg-slate-800 text-cute-yellow font-mono text-sm flex items-center justify-center border-4 border-white shadow-inner">
                     {topic.diagram}
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 bg-cute-gradient rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-cute-pink/20"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-black mb-8 leading-tight">พร้อมไปลอง <br />ปลูกต้นไม้หรือยัง? ✨</h2>
            <p className="text-white/90 font-medium max-w-xl mx-auto mb-12 text-lg">
              เรียนรู้ทฤษฎีไปแล้ว มาลองสร้างน้องต้นไม้ด้วยตัวเองในโหมดจำลองกันเถอะ! รับรองว่าสนุกสุดๆ
            </p>
            <a href="/visualizer" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-cute-pink rounded-[2rem] font-bold text-lg hover:scale-110 active:scale-95 transition-all shadow-xl">
               ไปที่โหมดจำลอง ✨
               <ChevronRight size={20} />
            </a>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </motion.div>
      </div>
    </div>
  );
};
