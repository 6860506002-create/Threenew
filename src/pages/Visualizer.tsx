import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, RotateCcw, Binary, Share2, Check, 
  Dices, Activity, ListTree, Settings2, 
  Search, Info, ChevronRight, Zap, 
  Layout, Palette, BarChart3, Trash2,
  TrendingUp, Hash, Layers, ShieldCheck
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
  min: number | null;
  max: number | null;
  isBalanced: boolean;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [history, setHistory] = useState<{ action: string, value?: number, time: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'stats' | 'history'>('controls');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const addHistory = (action: string, value?: number) => {
    setHistory(prev => [{ 
      action, 
      value, 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 8));
  };

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tree');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setTreeData(data.tree);
      setTreeType(data.type);
      setTreeStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch tree:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const values = inputValue.split(/[\s,]+/).map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) return;

    setIsSyncing(true);
    values.slice(0, 3).forEach(v => addHistory('เพิ่มโหนด', v));
    if (values.length > 3) addHistory(`และอีก ${values.length - 3} โหนด`);
    
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
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRandom = () => {
    const count = Math.floor(Math.random() * 5) + 3;
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 100));
    setInputValue(values.join(', '));
    setTimeout(() => handleInsert(), 100);
  };

  const handleTypeChange = async (type: 'bst' | 'max-heap' | 'min-heap') => {
    setIsSyncing(true);
    addHistory('เปลี่ยนประเภทเป็น ' + type.toUpperCase());
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
    } finally {
      setIsSyncing(false);
    }
  };

  const resetTree = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")) return;
    setIsSyncing(true);
    addHistory('รีเซ็ตข้อมูลทั้งหมด');
    try {
      await fetch('/api/tree', { method: 'DELETE' });
      setTreeData(null);
      setTreeStats(null);
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-600 pb-12">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 0, scale: 1.1 }}
              initial={{ rotate: 3 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"
            >
              <Binary size={24} />
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Arboris <span className="text-indigo-600">Pro</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tree Simulation Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              {copied ? "COPIED!" : "SHARE"}
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Engine Online</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Controls & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Input Card */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Input Console
              </h2>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRandom} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-indigo-500" 
                title="Random Nodes"
              >
                <Dices size={20} />
              </motion.button>
            </div>

            <form onSubmit={handleInsert} className="space-y-4">
              <div className="relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="เช่น 10, 20, 30..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-700 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={resetTree}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-black border border-rose-100 hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={14} /> RESET
                </button>
                <button 
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-black border border-slate-100 cursor-not-allowed"
                >
                  <Search size={14} /> FIND
                </button>
              </div>
            </form>
          </section>

          {/* Stats & Info Tabs */}
          <section className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[450px] flex flex-col">
            <div className="flex border-b border-slate-100">
              {(['controls', 'stats', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === tab ? "text-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />}
                </button>
              ))}
            </div>

            <div className="p-8 flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'controls' && (
                  <motion.div 
                    key="controls"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Layers size={12} /> Algorithm Type
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => handleTypeChange(t)}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl border-2 transition-all font-black text-sm",
                              treeType === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                            )}
                          >
                            {t === 'bst' ? 'Binary Search Tree' : t === 'max-heap' ? 'Max Heap' : 'Min Heap'}
                            {treeType === t && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Palette size={12} /> Visual Theme
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-2",
                              theme === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div 
                    key="stats"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {!treeStats ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-4">
                        <BarChart3 size={48} strokeWidth={1} />
                        <p className="font-bold italic text-sm">No data to analyze...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 flex items-center gap-1">
                            <TrendingUp size={10} /> Height
                          </span>
                          <span className="text-2xl font-black text-indigo-600">{treeStats.height}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1 flex items-center gap-1">
                            <Hash size={10} /> Nodes
                          </span>
                          <span className="text-2xl font-black text-indigo-600">{treeStats.count}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Min Value</span>
                          <span className="text-xl font-black text-slate-700">{treeStats.min}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Max Value</span>
                          <span className="text-xl font-black text-slate-700">{treeStats.max}</span>
                        </div>
                        <div className="col-span-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2">
                            <ShieldCheck size={12} /> Balanced Status
                          </span>
                          <span className={cn("text-xs font-black uppercase", treeStats.isBalanced ? "text-emerald-500" : "text-rose-500")}>
                            {treeStats.isBalanced ? "Balanced" : "Unbalanced"}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-4">
                        <Activity size={48} strokeWidth={1} />
                        <p className="font-bold italic text-sm">Activity log is empty...</p>
                      </div>
                    ) : (
                      history.map((h, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={i} 
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-[11px] font-black text-slate-600">{h.action} {h.value !== undefined && <span className="text-indigo-600">[{h.value}]</span>}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase">{h.time}</span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Content: Visualization & Traversals */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visualizer Card */}
          <section className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200/40 border border-slate-100 min-h-[650px] flex flex-col">
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Activity size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Visualization</h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl">
                {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayout(l)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black rounded-lg transition-all",
                      layout === l ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 relative m-4 rounded-[2.5rem] bg-slate-50/50 overflow-hidden border-2 border-slate-100/50">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
                    <Info size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-700">{error}</p>
                    <p className="text-xs text-slate-400 font-bold">หากคุณใช้ Vercel กรุณาตรวจสอบการตั้งค่า API</p>
                  </div>
                  <button 
                    onClick={fetchTree}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              ) : (
                <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
              )}
              
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Computing Tree...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend Overlay */}
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> Node
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-3 h-[2px] bg-slate-300" /> Link
                 </div>
              </div>
            </div>
          </section>

          {/* Traversal Results */}
          <section className="grid md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
            >
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ListTree size={14} className="text-indigo-400" />
                In-Order Traversal
              </h4>
              <div className="flex flex-wrap gap-2">
                {(!treeStats || !treeStats.traversals?.inOrder?.length) ? (
                  <span className="text-xs text-slate-300 italic font-bold">Waiting for nodes...</span>
                ) : (
                  treeStats.traversals.inOrder.map((v, i) => (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={i} 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-slate-600"
                    >
                      {v}
                    </motion.span>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
            >
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                Pre-Order Traversal
              </h4>
              <div className="flex flex-wrap gap-2">
                {(!treeStats || !treeStats.traversals?.preOrder?.length) ? (
                  <span className="text-xs text-slate-300 italic font-bold">Waiting for nodes...</span>
                ) : (
                  treeStats.traversals.preOrder.map((v, i) => (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={i} 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-slate-600"
                    >
                      {v}
                    </motion.span>
                  ))
                )}
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 border-t border-slate-200/60 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-300" /> ENGINE: V3.0.0</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> STATUS: OPERATIONAL</span>
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Arboris Simulation Lab • 2026
        </div>
      </footer>
    </div>
  );
};
