import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, RotateCcw, Binary, Share2, Check, Dices, ListTree, Zap, Layers, BarChart3 } from 'lucide-react';
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

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tree');
      const data = await res.json();
      setTreeData(data.tree);
      setTreeType(data.type);
      setTreeStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch tree:", err);
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
    if (!confirm("ล้างข้อมูลทั้งหมด?")) return;
    try {
      await fetch('/api/tree', { method: 'DELETE' });
      setTreeData(null);
      setTreeStats(null);
    } catch (err) {
      console.error("Failed to reset:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Binary size={24} />
              </div>
              <h1 className="text-xl font-bold">Tree Visualizer</h1>
            </div>

            <form onSubmit={handleInsert} className="space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ใส่ตัวเลข เช่น 10, 20..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleRandom} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all">
                  <Dices size={14} /> สุ่มตัวเลข
                </button>
                <button type="button" onClick={resetTree} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all">
                  <RotateCcw size={14} /> รีเซ็ต
                </button>
              </div>
            </form>

            <div className="mt-8 space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} /> ประเภทโครงสร้าง
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium",
                      treeType === t ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    {t === 'bst' ? 'Binary Search Tree' : t === 'max-heap' ? 'Max Heap' : 'Min Heap'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {treeStats && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 size={12} /> ข้อมูลสถิติ
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">ความสูง</span>
                  <span className="text-xl font-bold text-indigo-600">{treeStats.height}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">จำนวนโหนด</span>
                  <span className="text-xl font-bold text-indigo-600">{treeStats.count}</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">In-Order:</div>
                <div className="flex flex-wrap gap-1">
                  {treeStats.traversals.inOrder.map((v, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{v}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main View */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-200 min-h-[600px] flex flex-col relative">
            <div className="p-4 flex justify-between items-center border-b border-slate-50 mb-4">
              <div className="flex gap-2">
                {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                  <button key={l} onClick={() => setLayout(l)} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-lg", layout === l ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400")}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-lg", theme === t ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400")}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50/50 rounded-2xl overflow-hidden relative">
              <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
