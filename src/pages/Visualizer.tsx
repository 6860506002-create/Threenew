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
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setIsSyncing(true);
    addHistory('เพิ่มโหนด', val);
    
    // Optimistic update
    setInputValue('');
    
    try {
      const res = await fetch('/api/tree/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: val })
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
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-200">
              <Binary size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Arboris Visualizer</h1>
          </div>
          <p className="text-slate-500 font-medium">เครื่องมือจำลองโครงสร้างข้อมูลแบบต้นไม้ (Tree Data Structure)</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            {copied ? "คัดลอกแล้ว!" : "แชร์ลิงก์"}
          </button>

          {/* Sync Status Badge */}
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-all duration-500",
            isSyncing 
              ? "bg-blue-50 text-blue-600 border-blue-100" 
              : dbStatus?.connected 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-amber-50 text-amber-700 border-amber-100"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSyncing ? "bg-blue-500 animate-spin" : dbStatus?.connected ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span>
              {isSyncing ? "กำลังบันทึก..." : dbStatus?.mode || "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          {/* Controls Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-5 space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">ประเภทของ Tree</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all border group",
                        treeType === t 
                          ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      )}
                    >
                      <span>{t.toUpperCase()}</span>
                      {treeType === t && <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">ป้อนข้อมูล</label>
                <form onSubmit={handleInsert} className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="ใส่ตัวเลข..."
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetTree}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all border border-rose-100"
                  >
                    <RotateCcw size={14} />
                    รีเซ็ตข้อมูลทั้งหมด
                  </button>
                </form>
              </div>
            </div>
          </Card>

          {/* History Card */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/30">
            <div className="p-5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">ประวัติการทำงาน</label>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">ยังไม่มีประวัติ...</div>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          h.action.includes('เพิ่ม') ? "bg-emerald-500" : h.action.includes('รีเซ็ต') ? "bg-rose-500" : "bg-blue-500"
                        )} />
                        <span className="text-slate-600">{h.action} {h.value !== undefined && `(${h.value})`}</span>
                      </div>
                      <span className="text-slate-400 font-mono">{h.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Main Visualization Card */}
          <Card className="p-0 overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50 min-h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">การแสดงผล</span>
                  <div className="h-4 w-px bg-slate-200" />
                  <div className="flex gap-1">
                    {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLayout(l)}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                          layout === l ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="flex gap-1">
                  {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                        theme === t ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 relative bg-white">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
              
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">กำลังโหลด...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>ประเภท: {treeType.toUpperCase()}</span>
                <div className="h-3 w-px bg-slate-200" />
                <span>โหมด: {layout.toUpperCase()}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Persistent MariaDB Storage
              </div>
            </div>
          </Card>

          {/* Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-brand-50/30 border-brand-100">
              <div className="p-5">
                <h3 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-brand-500 rounded-full" />
                  เกี่ยวกับโครงสร้างนี้
                </h3>
                <p className="text-xs text-brand-800 leading-relaxed opacity-80">
                  {treeType === 'bst' 
                    ? "Binary Search Tree (BST) เป็นโครงสร้างที่ช่วยให้การค้นหาข้อมูลทำได้รวดเร็ว โดยค่าที่น้อยกว่าจะถูกจัดไว้ทางซ้าย และค่าที่มากกว่าจะถูกจัดไว้ทางขวาเสมอ"
                    : `Heap เป็น Complete Binary Tree ที่รักษาคุณสมบัติความเป็นลำดับ โดยใน ${treeType === 'max-heap' ? 'Max Heap' : 'Min Heap'} โหนดพ่อจะมีค่า ${treeType === 'max-heap' ? 'มากกว่าหรือเท่ากับ' : 'น้อยกว่าหรือเท่ากับ'} ลูกเสมอ`}
                </p>
              </div>
            </Card>
            <Card className="bg-slate-900 text-white border-none">
              <div className="p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-brand-400 rounded-full" />
                  การบันทึกข้อมูล
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ข้อมูลของคุณถูกบันทึกแบบ Real-time ลงในฐานข้อมูล MariaDB ทุกครั้งที่มีการเปลี่ยนแปลง คุณสามารถเปิดแอปนี้จากเครื่องอื่นเพื่อดูข้อมูลเดิมได้ทันที
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
