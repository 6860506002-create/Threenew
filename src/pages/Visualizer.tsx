import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, RotateCcw, Binary, Share2, Check } from 'lucide-react';
import { TreeDiagram } from '../components/TreeDiagram';
import { Card } from '../components/Card';
import { cn } from '../utils';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

export const Visualizer = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [treeType, setTreeType] = useState<'bst' | 'max-heap' | 'min-heap'>('bst');
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'radial'>('vertical');
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'nature'>('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean, mode: string } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [history, setHistory] = useState<{ action: string, value?: number, time: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch tree data on mount
  useEffect(() => {
    fetchTree();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({ connected: false, mode: "Disconnected" });
    }
  };

  const addHistory = (action: string, value?: number) => {
    setHistory(prev => [{ 
      action, 
      value, 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 5));
  };

  const fetchTree = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tree');
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setTreeData(data.tree);
      setTreeType(data.type);
    } catch (err) {
      console.error("Failed to fetch tree:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Support multiple values separated by space or comma
    const values = inputValue.split(/[\s,]+/).map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) return;

    setIsSyncing(true);
    
    // Add to history (first 3 if many)
    values.slice(0, 3).forEach(v => addHistory('เพิ่มโหนด', v));
    if (values.length > 3) addHistory(`และอีก ${values.length - 3} โหนด`, undefined);
    
    // Optimistic update
    setInputValue('');
    
    try {
      const res = await fetch('/api/tree/insert-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
      });
      const data = await res.json();
      setTreeData(data.tree);
    } catch (err) {
      console.error("Failed to insert:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTypeChange = async (type: 'bst' | 'max-heap' | 'min-heap') => {
    setIsSyncing(true);
    addHistory('เปลี่ยนประเภท', undefined);
    try {
      await fetch('/api/tree/type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      setTreeType(type);
      setTreeData(null);
    } catch (err) {
      console.error("Failed to change type:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetTree = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")) return;
    
    setIsSyncing(true);
    addHistory('รีเซ็ตข้อมูล', undefined);
    try {
      await fetch('/api/tree', { method: 'DELETE' });
      setTreeData(null);
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header Section - Cute Style */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 border-2 border-pink-50">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-200 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Binary size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Arboris <span className="text-pink-500">Magic</span> Tree
            </h1>
            <p className="text-slate-400 font-bold text-sm">มาสร้างต้นไม้แสนวิเศษกันเถอะ! ✨</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 rounded-2xl bg-white border-2 border-pink-100 px-5 py-2 text-sm font-bold text-pink-500 hover:bg-pink-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            {copied ? "คัดลอกแล้ว!" : "แชร์ให้เพื่อน"}
          </button>

          {/* Hidden DB status, only show sync animation if active */}
          {isSyncing && (
            <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest border-2 border-blue-100 animate-bounce">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>กำลังร่ายมนต์...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        <div className="space-y-8">
          {/* Menu 1: Tree Type Selection */}
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-100/50 border-2 border-indigo-50">
            <label className="flex items-center gap-2 text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-4">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              เลือกประเภทต้นไม้
            </label>
            <div className="grid grid-cols-1 gap-3">
              {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-black transition-all border-2 group relative overflow-hidden",
                    treeType === t 
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-200" 
                      : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                  )}
                >
                  <span className="relative z-10">{t === 'bst' ? '🌳 Binary Search' : t === 'max-heap' ? '👑 Max Heap' : '🌱 Min Heap'}</span>
                  {treeType === t && <div className="w-2 h-2 rounded-full bg-white animate-pulse relative z-10" />}
                </button>
              ))}
            </div>
          </div>

          {/* Menu 2: Input Controls */}
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-pink-100/50 border-2 border-pink-50">
            <label className="flex items-center gap-2 text-[12px] font-black text-pink-400 uppercase tracking-widest mb-4">
              <div className="w-2 h-2 rounded-full bg-pink-400" />
              ป้อนตัวเลขนำโชค
            </label>
            <form onSubmit={handleInsert} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="เช่น 10, 20, 30..."
                  className="w-full rounded-2xl border-4 border-slate-50 bg-slate-50 px-5 py-4 text-lg font-black text-slate-700 placeholder:text-slate-300 focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 hover:scale-110 active:scale-90 transition-all"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
              
              <button
                type="button"
                onClick={resetTree}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-500 hover:bg-rose-500 hover:text-white transition-all border-2 border-transparent"
              >
                <RotateCcw size={16} strokeWidth={3} />
                เริ่มปลูกใหม่ (Reset)
              </button>
            </form>
          </div>

          {/* Menu 3: History Log */}
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-amber-100/50 border-2 border-amber-50">
            <label className="flex items-center gap-2 text-[12px] font-black text-amber-400 uppercase tracking-widest mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              บันทึกความจำ
            </label>
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-[11px] text-slate-300 font-bold italic text-center py-4">ยังไม่มีการเคลื่อนไหว...</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        h.action.includes('เพิ่ม') ? "bg-emerald-400" : h.action.includes('รีเซ็ต') ? "bg-rose-400" : "bg-sky-400"
                      )} />
                      <span className="text-[11px] font-black text-slate-600">{h.action} {h.value !== undefined && <span className="text-pink-500">[{h.value}]</span>}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase">{h.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Visualization Card */}
          <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200/50 border-4 border-white min-h-[650px] flex flex-col overflow-hidden">
            <div className="p-6 flex flex-wrap justify-between items-center gap-6">
               <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">มุมมอง</span>
                  <div className="flex gap-1">
                    {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLayout(l)}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black rounded-xl transition-all",
                          layout === l ? "bg-white text-indigo-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {l === 'vertical' ? '📐 แนวตั้ง' : l === 'horizontal' ? '📏 แนวนอน' : '⭕ วงกลม'}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl">
                  {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "px-4 py-2 text-[10px] font-black rounded-xl transition-all",
                        theme === t ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t === 'classic' ? '🎨 พาสเทล' : t === 'cyberpunk' ? '🌌 นีออน' : '🍃 ธรรมชาติ'}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 relative rounded-[2rem] overflow-hidden bg-slate-50/30 m-2 border-2 border-slate-50">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
              
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-pink-100" />
                    <span className="text-xs font-black text-pink-500 uppercase tracking-widest animate-pulse">กำลังเสกต้นไม้...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-6 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-300" /> TYPE: {treeType}</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-300" /> MODE: {layout}</span>
              </div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Magic Tree Visualizer v2.0
              </div>
            </div>
          </div>

          {/* Info Section - Friendly Style */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border-2 border-white shadow-xl shadow-indigo-100/30">
              <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-3">
                <div className="w-3 h-6 bg-indigo-400 rounded-full" />
                ความลับของต้นไม้นี้
              </h3>
              <p className="text-sm text-indigo-800/70 font-bold leading-relaxed">
                {treeType === 'bst' 
                  ? "ต้นไม้แบบ BST จะช่วยเก็บข้อมูลให้เป็นระเบียบ! ถ้าตัวเลขไหนน้อยกว่าเพื่อนจะไปอยู่ทางซ้าย ถ้ามากกว่าจะไปอยู่ทางขวาจ้า"
                  : `ต้นไม้แบบ Heap จะเน้นลำดับความสำคัญ! โดยใน ${treeType === 'max-heap' ? 'Max Heap' : 'Min Heap'} ตัวเลขที่ ${treeType === 'max-heap' ? 'ใหญ่ที่สุด' : 'เล็กที่สุด'} จะต้องอยู่บนสุดเสมอเลยนะ`}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-[2.5rem] border-2 border-white shadow-xl shadow-pink-100/30">
              <h3 className="text-lg font-black text-pink-900 mb-4 flex items-center gap-3">
                <div className="w-3 h-6 bg-pink-400 rounded-full" />
                ไม่ต้องกลัวหาย!
              </h3>
              <p className="text-sm text-pink-800/70 font-bold leading-relaxed">
                ต้นไม้ที่คุณปลูกจะถูกบันทึกไว้ในสมุดเวทมนตร์ส่วนตัว (Database) ไม่ว่าจะปิดเครื่องหรือเปลี่ยนไปเล่นเครื่องอื่น ต้นไม้ต้นเดิมก็จะยังรอคุณอยู่ที่นี่เสมอจ้า ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
