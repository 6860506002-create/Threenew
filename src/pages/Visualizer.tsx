import React, { useState } from 'react';
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

  const insertBST = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) return { value };
    if (value < root.value) {
      root.left = insertBST(root.left || null, value);
    } else if (value > root.value) {
      root.right = insertBST(root.right || null, value);
    }
    return root;
  };

  const getHeapArray = (root: TreeNode | null): number[] => {
    if (!root) return [];
    const result: number[] = [];
    const queue: (TreeNode | undefined)[] = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node) {
        result.push(node.value);
        queue.push(node.left);
        queue.push(node.right);
      }
    }
    return result;
  };

  const buildTreeFromArray = (arr: number[], index: number): TreeNode | undefined => {
    if (index >= arr.length) return undefined;
    const node: TreeNode = { value: arr[index] };
    node.left = buildTreeFromArray(arr, 2 * index + 1);
    node.right = buildTreeFromArray(arr, 2 * index + 2);
    return node;
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    if (treeType === 'bst') {
      setTreeData(prev => insertBST(prev ? { ...prev } : null, val));
    } else {
      // Heap logic
      const currentArr = getHeapArray(treeData);
      currentArr.push(val);
      
      // Sift up
      let idx = currentArr.length - 1;
      while (idx > 0) {
        const parentIdx = Math.floor((idx - 1) / 2);
        const shouldSwap = treeType === 'max-heap' 
          ? currentArr[idx] > currentArr[parentIdx]
          : currentArr[idx] < currentArr[parentIdx];
        
        if (shouldSwap) {
          [currentArr[idx], currentArr[parentIdx]] = [currentArr[parentIdx], currentArr[idx]];
          idx = parentIdx;
        } else {
          break;
        }
      }
      
      const newTree = buildTreeFromArray(currentArr, 0);
      setTreeData(newTree || null);
    }
    setInputValue('');
  };

  const resetTree = () => {
    setTreeData(null);
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">ประเภทของ Tree</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bst', 'max-heap', 'min-heap'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTreeType(t); resetTree(); }}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        treeType === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                      onClick={() => setLayout(l)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        layout === l ? "bg-vibrant-blue text-white border-vibrant-blue" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                      onClick={() => setTheme(t)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-bold transition-all border",
                        theme === t 
                          ? (t === 'cyberpunk' ? "bg-vibrant-purple text-white border-vibrant-purple" : t === 'nature' ? "bg-brand-600 text-white border-brand-600" : "bg-slate-800 text-white border-slate-800")
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="กรอกตัวเลข..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <button
                        type="submit"
                        className="flex items-center justify-center rounded-xl bg-vibrant-gradient h-10 w-12 text-white shadow-lg shadow-blue-100 hover:scale-110 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetTree}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
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
