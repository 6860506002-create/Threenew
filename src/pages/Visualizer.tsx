import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, RotateCcw, Binary } from 'lucide-react';
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

  // Fetch tree data on mount
  useEffect(() => {
    fetchTree();
    checkStatus();
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

    setIsLoading(true);
    try {
      const res = await fetch('/api/tree/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: val })
      });
      const data = await res.json();
      setTreeData(data.tree);
      setInputValue('');
    } catch (err) {
      console.error("Failed to insert:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = async (type: 'bst' | 'max-heap' | 'min-heap') => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const resetTree = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/tree', { method: 'DELETE' });
      setTreeData(null);
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <Binary size={32} />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">เครื่องมือจำลองโครงสร้าง Tree</h1>
        <p className="text-lg text-slate-600">เลือกประเภทและรูปแบบที่คุณต้องการเพื่อสร้างภาพจำลอง</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card title="การตั้งค่า">
            <div className="space-y-6">
              {/* Connection Status */}
              <div className={cn(
                "rounded-xl p-3 text-[10px] font-bold border flex items-center gap-2 uppercase tracking-wider",
                dbStatus?.connected 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-amber-50 text-amber-700 border-amber-100"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  dbStatus?.connected ? "bg-emerald-500" : "bg-amber-500"
                )} />
                <span>
                  {dbStatus?.mode || "กำลังตรวจสอบ..."}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">ประเภทของ Tree</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                    <button
                      key={t}
                      disabled={isLoading}
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        treeType === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">รูปแบบการแสดงผล</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['vertical', 'horizontal', 'radial'] as const).map((l) => (
                    <button
                      key={l}
                      disabled={isLoading}
                      onClick={() => setLayout(l)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        layout === l ? "bg-vibrant-blue text-white border-vibrant-blue" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">สภาพแวดล้อม (Environment)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['classic', 'cyberpunk', 'nature'] as const).map((t) => (
                    <button
                      key={t}
                      disabled={isLoading}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        theme === t 
                          ? (t === 'cyberpunk' ? "bg-vibrant-purple text-white border-vibrant-purple" : t === 'nature' ? "bg-brand-600 text-white border-brand-600" : "bg-slate-800 text-white border-slate-800")
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleInsert} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-2">ใส่ค่าตัวเลข</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputValue}
                        disabled={isLoading}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="กรอกตัวเลข..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center rounded-xl bg-vibrant-gradient h-10 w-12 text-white shadow-lg shadow-blue-100 hover:scale-110 transition-all disabled:opacity-50"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetTree}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={18} />
                    ล้างข้อมูล Tree
                  </button>
                </form>
              </div>
            </div>
          </Card>

          <Card title="คำแนะนำ">
            <ul className="space-y-3 text-sm">
              {treeType === 'bst' ? (
                <>
                  <li className="flex gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span><b>BST:</b> ค่าที่น้อยกว่าไปซ้าย ค่าที่มากกว่าไปขวา</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span><b>Heap:</b> เป็น Binary Tree แบบสมบูรณ์ (Complete)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span><b>{treeType === 'max-heap' ? 'Max' : 'Min'} Heap:</b> พ่อต้อง {treeType === 'max-heap' ? 'มากกว่า' : 'น้อยกว่า'} ลูกเสมอ</span>
                  </li>
                </>
              )}
              <li className="flex gap-2">
                <span className="text-vibrant-blue font-bold">•</span>
                <span>ลองเปลี่ยน <b>Layout</b> เพื่อดูมุมมองที่แตกต่างกัน!</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <span className="font-semibold text-slate-900">การแสดงผล: {treeType.toUpperCase()} ({layout})</span>
               <span className="text-xs font-mono text-slate-400">D3.js Rendering</span>
            </div>
            <div className="p-6">
              <TreeDiagram data={treeData} layoutType={layout} theme={theme} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
