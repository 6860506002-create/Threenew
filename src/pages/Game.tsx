import React from 'react';
import { Quiz } from '../components/Quiz';
import { Gamepad2 } from 'lucide-react';

export const Game = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <Gamepad2 size={32} />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">ควิซความรู้เรื่อง Tree</h1>
        <p className="text-lg text-slate-600">ท้าทายตัวเองและดูว่าคุณได้เรียนรู้เกี่ยวกับ Tree มากแค่ไหน</p>
      </div>

      <Quiz />
    </div>
  );
};
