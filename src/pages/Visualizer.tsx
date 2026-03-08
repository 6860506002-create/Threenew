import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, RotateCcw, TreeDeciduous, Share2, Check, 
  Dices, Sparkles, Layout, Zap, 
  Layers, Palette, BarChart3, Trash2,
  TrendingUp, Hash, Heart, Info, Star
} from 'lucide-react';
import { TreeDiagram } from '../components/TreeDiagram';
import { cn } from '../utils';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface TreeStats {
  height: number;
  count: number;
  traversals: {
    inOrder: number[];
    preOrder: number[];
  };
}

export const Visualizer = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [treeStats, setTreeStats] = useState<TreeStats | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [treeType, setTreeType] = useState<'bst' | 'max-heap' | 'min-heap'>('bst');
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'radial'>('vertical');
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'nature'>('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tree');
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();
      setTreeData(data.tree);
      setTreeType(data.type);
      setTreeStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch tree:", err);
      setError("ไม่สามารถเชื่อมต่อกับระบบจำลองได้จ้า 🌸");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const values = inputValue.split(/[\s,]+/).map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) return;
    setInputValue('');
    try {
      const res = await fetch('/api/tree/insert-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
      });
      const data = await res.json();
      setTreeData(data.tree);
      setTreeStats(data.stats);
    } catch (err) {
      console.error("Failed to insert:", err);
    }
  };

  const handleRandom = () => {
    const values = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
    setInputValue(values.join(', '));
    setTimeout(() => handleInsert(), 100);
  };

  const handleTypeChange = async (type: 'bst' | 'max-heap' | 'min-heap') => {
    try {
      const res = await fetch('/api/tree/type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      setTreeType(type);
      setTreeData(null);
      setTreeStats(null);
    } catch (err) {
      console.error("Failed to change type:", err);
    }
  };

  const resetTree = async () => {
    if (!confirm("ต้องการลบข้อมูลน้องต้นไม้ทั้งหมดใช่ไหมจ๊ะ? 🌸")) return;
    try {
      await fetch('/api/tree', { method: 'DELETE' });
      setTreeData(null);
      setTreeStats(null);
    } catch (err) {
      console.error("Failed to reset:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cute-pink rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cute-pink/30 animate-bounce-slow">
              <TreeDeciduous size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-slate-800">Arboris <span className="text-cute-pink">จำลอง</span></h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ระบบปลูกต้นไม้อัจฉริยะ ✨</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white border-4 border-slate-50 rounded-2xl text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
            >
              {copied ? <Check size={16} className="text-cute-mint" /> : <Share2 size={16} />}
              {copied ? "คัดลอกแล้ว!" : "แชร์ให้เพื่อนดู"}
            </button>
            <div className="h-8 w-[2px] bg-slate-100" />
            <div className="flex items-center gap-2 px-5 py-2 bg-cute-mint/10 border-2 border-cute-mint/20 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-cute-mint animate-pulse" />
              <span className="text-xs font-bold text-cute-mint uppercase tracking-widest">ระบบพร้อมทำงาน ✨</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Input Bento Box */}
            <div className="cute-card p-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={16} className="text-cute-yellow" fill="currentColor" /> แผงควบคุมการปลูก
              </h2>
              
              <form onSubmit={handleInsert} className="space-y-4">
                <div className="relative group">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="ใส่ตัวเลข (เช่น 10, 20...)"
                    className="w-full bg-slate-50 border-4 border-white rounded-[2rem] px-6 py-4 font-bold text-slate-700 placeholder:text-slate-300 focus:border-cute-pink/30 focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 px-5 bg-cute-pink text-white rounded-2xl shadow-lg shadow-cute-pink/30 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={handleRandom} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-slate-600 text-sm font-bold border-4 border-slate-50 hover:bg-slate-50 transition-all shadow-sm">
                    <Dices size={18} /> สุ่มตัวเลข
                  </button>
                  <button type="button" onClick={resetTree} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-cute-pink text-sm font-bold border-4 border-slate-50 hover:bg-cute-pink/5 transition-all shadow-sm">
                    <Trash2 size={18} /> ล้างข้อมูล
                  </button>
                </div>
              </form>

              <div className="mt-10 space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} /> เลือกประเภทต้นไม้
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        "w-full text-left px-6 py-4 rounded-[2rem] border-4 transition-all text-sm font-bold flex items-center justify-between",
                        treeType === t ? "bg-cute-pink/10 border-cute-pink/20 text-cute-pink" : "bg-white border-slate-50 text-slate-500 hover:border-cute-pink/20"
                      )}
                    >
                      {t === 'bst' ? 'Binary Search Tree' : t === 'max-heap' ? 'Max Heap' : 'Min Heap'}
                      {treeType === t && <Check size={18} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Bento Box */}
            {treeStats && (
              <div className="cute-card p-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BarChart3 size={16} /> ข้อมูลน้องต้นไม้
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-[2rem] border-4 border-slate-50 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                      <TrendingUp size={14} /> ความสูง
                    </span>
                    <span className="text-3xl font-black text-cute-pink">{treeStats.height}</span>
                  </div>
                  <div className="p-5 bg-white rounded-[2rem] border-4 border-slate-50 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                      <Hash size={14} /> จำนวนโหนด
                    </span>
                    <span className="text-3xl font-black text-cute-pink">{treeStats.count}</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-cute-yellow" fill="currentColor" /> ลำดับการเรียง (In-Order)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {treeStats.traversals.inOrder.map((v, i) => (
                        <span key={i} className="px-4 py-2 bg-cute-pink/5 rounded-xl text-sm font-bold text-cute-pink border-2 border-cute-pink/10">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Visualization Area */}
          <main className="lg:col-span-8 space-y-8">
            <div className="cute-card p-4 min-h-[700px] flex flex-col relative overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b-4 border-slate-50 mb-4">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border-2 border-white shadow-inner">
                  {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={cn(
                        "px-6 py-2.5 text-xs font-bold rounded-2xl transition-all uppercase tracking-widest",
                        layout === l ? "bg-white text-cute-pink shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {l === 'vertical' ? 'แนวตั้ง' : l === 'horizontal' ? 'แนวนอน' : 'วงกลม'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border-2 border-white shadow-inner">
                  {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "px-6 py-2.5 text-xs font-bold rounded-2xl transition-all uppercase tracking-widest",
                        theme === t ? "bg-cute-pink text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t === 'classic' ? 'คลาสสิก' : t === 'cyberpunk' ? 'ไซเบอร์' : 'ธรรมชาติ'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Stage */}
              <div className="flex-1 bg-white rounded-[3rem] overflow-hidden relative border-4 border-slate-50 m-2 shadow-inner">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F472B6 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                
                <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
                
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-14 w-14 border-4 border-cute-pink border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-cute-pink uppercase tracking-widest animate-pulse">กำลังปลูกต้นไม้... ✨</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/90 backdrop-blur-sm z-30">
                    <div className="p-6 bg-cute-pink/10 text-cute-pink rounded-[2.5rem] border-4 border-white mb-6 shadow-lg">
                      <Info size={48} />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 mb-2">{error}</h3>
                    <p className="text-sm text-slate-400 font-bold mb-8">ระบบจำลองขัดข้องนิดหน่อยจ้า ลองใหม่อีกทีนะ!</p>
                    <button 
                      onClick={fetchTree}
                      className="px-10 py-5 bg-cute-pink text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-cute-pink/30 transition-all hover:scale-105 active:scale-95"
                    >
                      เริ่มระบบใหม่ ✨
                    </button>
                  </div>
                )}

                {/* Legend Overlay */}
                <div className="absolute bottom-8 left-8 flex items-center gap-6">
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur rounded-2xl border-2 border-slate-50 text-xs font-bold text-slate-400 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-cute-pink" /> โหนด
                   </div>
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur rounded-2xl border-2 border-slate-50 text-xs font-bold text-slate-400 shadow-sm">
                      <div className="w-5 h-[3px] bg-slate-200 rounded-full" /> เส้นเชื่อม
                   </div>
                </div>

                {/* Floating Decorations */}
                <div className="absolute top-8 right-8 pointer-events-none">
                  <Heart size={32} className="text-cute-pink/20 animate-pulse" />
                </div>
                <div className="absolute bottom-24 right-12 pointer-events-none">
                  <Star size={32} className="text-cute-yellow/30 animate-bounce" fill="currentColor" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
