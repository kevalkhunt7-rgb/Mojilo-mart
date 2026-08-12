import React from 'react';
import { motion } from 'framer-motion';

const Line = () => {
  const textItem = "EASY TO CREATE & CUSTOMIZE \u00A0\u00A0★\u00A0\u00A0 DESIGN YOUR OWN \u00A0\u00A0★\u00A0\u00A0 ";

  return (
    <div className="w-full bg-slate-950 py-5 border-y border-amber-500/20 overflow-hidden select-none relative flex">
      {/* Subtle edge-fade mask overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      {/* Animated continuous track */}
      <motion.div
        className="flex whitespace-nowrap text-lg md:text-2xl font-bold tracking-widest text-amber-500 uppercase cursor-pointer"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 20,
        }}
        whileHover={{ scale: 1.01 }}
      >
        <span className="pr-2">{textItem.repeat(4)}</span>
        <span className="pr-2">{textItem.repeat(4)}</span>
      </motion.div>
    </div>
  );
};

export default Line;