import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Binary } from 'lucide-react';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Game } from './pages/Game';
import { Visualizer } from './pages/Visualizer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/game" element={<Game />} />
            <Route path="/visualizer" element={<Visualizer />} />
          </Routes>
        </main>
        
        <footer className="border-t border-slate-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Binary size={12} />
              </div>
              <span className="text-sm font-black tracking-tighter uppercase">Arboris<span className="text-indigo-600">Pro</span></span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Arboris Simulation Lab • Professional Edition
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
