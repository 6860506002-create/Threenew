import React from 'react';
import { NavLink } from 'react-router-dom';
import { TreeDeciduous, Home, BookOpen, Gamepad2, Binary } from 'lucide-react';
import { cn } from '../utils';

const navItems = [
  { name: 'หน้าแรก', path: '/', icon: Home },
  { name: 'เรียนรู้', path: '/learn', icon: BookOpen },
  { name: 'เกมควิซ', path: '/game', icon: Gamepad2 },
  { name: 'เครื่องมือจำลอง', path: '/visualizer', icon: Binary },
];

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-pink-50 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-200 -rotate-3">
            <TreeDeciduous size={28} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">Arboris</span>
        </div>
        
        <div className="hidden md:flex md:items-center md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-5 py-2.5 text-sm font-black transition-all rounded-2xl",
                  isActive 
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200" 
                    : "text-slate-500 hover:bg-pink-50 hover:text-pink-500"
                )
              }
            >
              <item.icon size={18} strokeWidth={2.5} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
           <div className="flex items-center gap-2 bg-pink-50 p-1.5 rounded-2xl border border-pink-100">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "p-2.5 rounded-xl transition-all",
                      isActive ? "text-white bg-pink-500 shadow-md" : "text-pink-300"
                    )
                  }
                >
                  <item.icon size={18} strokeWidth={2.5} />
                </NavLink>
              ))}
           </div>
        </div>
      </div>
    </nav>
  );
};
