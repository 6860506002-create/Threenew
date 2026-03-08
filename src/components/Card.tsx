import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export const Card = ({ children, className, title, icon, delay = 0 }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "cute-card p-8",
        className
      )}
    >
      {title && (
        <div className="mb-6 flex items-center gap-4">
          {icon && (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cute-pink/10 text-cute-pink transition-all group-hover:scale-110 group-hover:bg-cute-pink group-hover:text-white group-hover:shadow-lg group-hover:shadow-cute-pink/30">
              {icon}
            </div>
          )}
          <h3 className="text-xl font-display font-black text-slate-800">{title}</h3>
        </div>
      )}
      <div className="text-slate-500 font-medium leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
};
