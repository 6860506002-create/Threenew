import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Game } from './pages/Game';
import { Visualizer } from './pages/Visualizer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/game" element={<Game />} />
            <Route path="/visualizer" element={<Visualizer />} />
          </Routes>
        </main>
        
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Arboris Learning App. สร้างขึ้นเพื่อนักศึกษาวิทยาการคอมพิวเตอร์
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
