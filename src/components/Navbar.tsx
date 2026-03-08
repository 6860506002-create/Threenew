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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vibrant-gradient text-white shadow-lg shadow-blue-200">
            <TreeDeciduous size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Arboris</span>
        </div>
        
        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg",
                  isActive 
                    ? "bg-brand-50 text-brand-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu (simplified for this demo) */}
        <div className="flex md:hidden">
           <div className="flex items-center gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "p-2 rounded-lg transition-all",
                      isActive ? "text-brand-600 bg-brand-50" : "text-slate-500"
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
