import React from 'react';
import { motion } from 'motion/react';
import { Info, GitCommit, Layers, Network, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '../components/Card';

const topics = [
  {
    id: 'what-is-tree',
    title: 'Tree คืออะไร?',
    icon: <Info size={20} />,
    content: 'Tree คือโครงสร้างข้อมูลแบบไม่เชิงเส้น (Non-linear) ที่แสดงความสัมพันธ์แบบลำดับชั้นระหว่างโหนด ต่างจาก Array หรือ Linked List ตรงที่ Tree จะถูกจัดระเบียบในโครงสร้างแบบ พ่อ-ลูก (Parent-Child)',
    example: 'ผังครอบครัว หรือระบบไดเรกทอรีของไฟล์ในคอมพิวเตอร์',
    diagram: 'Root -> ลูก 1, ลูก 2 -> หลาน'
  },
  {
    id: 'terminology',
    title: 'คำศัพท์เกี่ยวกับ Tree',
    icon: <GitCommit size={20} />,
    content: 'เพื่อที่จะเข้าใจ Tree คุณจำเป็นต้องรู้จักคำศัพท์สำคัญเหล่านี้:',
    list: [
      { name: 'Root (ราก)', desc: 'โหนดบนสุดที่ไม่มีโหนดพ่อ' },
      { name: 'Parent (พ่อ)', desc: 'โหนดที่มีโหนดลูกอย่างน้อยหนึ่งโหนด' },
      { name: 'Child (ลูก)', desc: 'โหนดที่สืบทอดมาจากโหนดพ่อ' },
      { name: 'Leaf (ใบ)', desc: 'โหนดที่ไม่มีลูก (จุดสิ้นสุด)' }
    ]
  },
  {
    id: 'depth-height',
    title: 'ความลึกและความสูง',
    icon: <Layers size={20} />,
    content: 'ตัวชี้วัดเหล่านี้ช่วยให้เราเข้าใจขนาดของ Tree:',
    list: [
      { name: 'Depth (ความลึก)', desc: 'จำนวนเส้นเชื่อมจาก Root ไปยังโหนดที่ระบุ' },
      { name: 'Height (ความสูง)', desc: 'จำนวนเส้นเชื่อมบนเส้นทางที่ยาวที่สุดจากโหนดไปยังใบ' }
    ]
  },
  {
    id: 'types',
    title: 'ประเภทของ Tree',
    icon: <Network size={20} />,
    content: 'มีโครงสร้าง Tree พิเศษหลายประเภทที่ใช้เพื่อวัตถุประสงค์ที่แตกต่างกัน:',
    subtopics: [
      { name: 'General Tree', desc: 'ไม่มีข้อจำกัดเรื่องจำนวนลูกต่อหนึ่งโหนด' },
      { name: 'Binary Tree', desc: 'แต่ละโหนดมีลูกได้ไม่เกิน 2 โหนด (ซ้ายและขวา)' },
      { name: 'Binary Search Tree (BST)', desc: 'Binary Tree ที่ค่าฝั่งซ้าย < พ่อ < ฝั่งขวา' },
      { name: 'Heap Tree', desc: 'Binary Tree แบบสมบูรณ์ที่ใช้สำหรับ Priority Queues' }
    ]
  },
  {
    id: 'environment',
    title: 'การประยุกต์ใช้งาน (Environment)',
    icon: <Sparkles size={20} />,
    content: 'ในโลกแห่งความเป็นจริง โครงสร้าง Tree ถูกนำไปใช้ในสภาพแวดล้อมที่หลากหลาย:',
    list: [
      { name: 'File Systems', desc: 'การจัดเก็บโฟลเดอร์และไฟล์ในคอมพิวเตอร์ของคุณ' },
      { name: 'HTML DOM', desc: 'โครงสร้างของหน้าเว็บที่คุณกำลังดูอยู่ในขณะนี้' },
      { name: 'Databases', desc: 'การใช้ B-Trees เพื่อช่วยให้ค้นหาข้อมูลมหาศาลได้อย่างรวดเร็ว' },
      { name: 'AI & Machine Learning', desc: 'Decision Trees ช่วยให้ AI ตัดสินใจตามเงื่อนไขต่างๆ' }
    ]
  }
];

export const Learn = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">เรียนรู้โครงสร้าง Tree</h1>
        <p className="text-lg text-slate-600">ฝึกฝนพื้นฐานการจัดระเบียบข้อมูลแบบลำดับชั้น</p>
      </div>

      <div className="grid gap-12">
        {topics.map((topic, index) => (
          <motion.section
            key={topic.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-[1fr_2fr] items-start"
          >
            <div className="sticky top-24">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vibrant-gradient text-white shadow-lg shadow-blue-100 mb-4">
                  {topic.icon}
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mb-2">{topic.title}</h2>
               <div className="h-1 w-12 bg-vibrant-pink rounded-full" />
            </div>

            <Card className="p-8">
              <p className="mb-6 text-lg leading-relaxed">{topic.content}</p>
              
              {topic.list && (
                <div className="grid gap-4 mb-6">
                  {topic.list.map((item) => (
                    <div key={item.name} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="font-bold text-brand-600 min-w-[80px]">{item.name}</div>
                      <div className="text-slate-600">{item.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {topic.subtopics && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {topic.subtopics.map((sub) => (
                    <div key={sub.name} className="p-4 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors">
                      <div className="font-bold text-slate-900 mb-1">{sub.name}</div>
                      <div className="text-sm text-slate-500">{sub.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {topic.example && (
                <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
                  <span className="font-bold text-brand-700">ตัวอย่าง:</span> {topic.example}
                </div>
              )}

              {topic.diagram && (
                <div className="mt-6 flex items-center justify-center p-8 rounded-2xl bg-slate-900 text-brand-400 font-mono text-sm">
                   {topic.diagram}
                </div>
              )}
            </Card>
          </motion.section>
        ))}
      </div>

      <div className="mt-20 text-center">
         <Card className="bg-brand-600 text-white border-none p-12">
            <h2 className="text-3xl font-bold mb-4">พร้อมทดสอบความรู้หรือยัง?</h2>
            <p className="text-brand-100 mb-8 max-w-xl mx-auto">
              คุณได้เรียนรู้พื้นฐานแล้ว มาลองดูว่าคุณจำได้มากแค่ไหนด้วยควิซแบบโต้ตอบของเรา
            </p>
            <a href="/game" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-brand-600 transition-all hover:scale-105">
               เล่นเกมควิซ
               <ChevronRight size={20} />
            </a>
         </Card>
      </div>
    </div>
  );
};
