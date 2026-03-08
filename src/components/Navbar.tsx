import React from 'react';
import { NavLink } from 'react-router-dom';
import { TreeDeciduous, Home, BookHeart, Gamepad2, Layout } from 'lucide-react';
import { cn } from '../utils';

const navItems = [
  { name: 'หน้าแรก', path: '/', icon: Home },
  { name: 'เรียนรู้', path: '/learn', icon: BookHeart },
  { name: 'ท้าทาย', path: '/game', icon: Gamepad2 },
  { name: 'จำลอง', path: '/visualizer', icon: Layout },
];

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border-4 border-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cute-pink text-white shadow-lg shadow-cute-pink/30 animate-bounce-slow">
            <TreeDeciduous size={24} />
          </div>
          <span className="text-xl font-display font-black text-slate-800">Arboris ✨</span>
        </div>
        
        <div className="hidden md:flex md:items-center md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-5 py-2 text-sm font-bold transition-all rounded-2xl",
                  isActive 
                    ? "bg-cute-pink text-white shadow-lg shadow-cute-pink/20" 
                    : "text-slate-400 hover:bg-cute-pink/5 hover:text-cute-pink"
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
           <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border-2 border-white shadow-inner">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "p-2 rounded-xl transition-all",
                      isActive ? "text-white bg-cute-pink shadow-sm" : "text-slate-300"
                    )
                  }
                >
                  <item.icon size={20} />
                </NavLink>
              ))}
           </div>
        </div>
      </div>
    </nav>
  );
};
