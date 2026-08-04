"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type KpiCardData = {
 title: string;
 value: string;
 trend: string;
 trendDir: "up" | "down" | "neutral";
 icon: string;
};

type Props = {
 cards: KpiCardData[];
};

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
 const [display, setDisplay] = useState(0);
 useEffect(() => {
   let start: number | null = null;
   let raf: number;
   const animate = (timestamp: number) => {
     if (!start) start = timestamp;
     const progress = Math.min((timestamp - start) / duration, 1);
     setDisplay(Math.round(value * (1 - Math.pow(2, -10 * progress))));
     if (progress < 1) raf = requestAnimationFrame(animate);
   };
   raf = requestAnimationFrame(animate);
   return () => cancelAnimationFrame(raf);
 }, [value, duration]);
 return <>{display}</>;
}

function parseNumericValue(val: string): number {
 const cleaned = val.replace(/[^0-9.]/g, "");
 return parseFloat(cleaned) || 0;
}

function TrendIndicator({ trend, trendDir }: { trend: string; trendDir: "up" | "down" | "neutral" }) {
 const isUp = trendDir === "up";
 const isDown = trendDir === "down";
 const color = isUp ? "text-emerald" : isDown ? "text-burgundy" : "text-white/50";
 const rotate = isDown ? "rotate-180" : "";
 return (
   <span className={`flex items-center gap-0.5 text-[0.6rem] font-medium ${color}`}>
     <svg
       width="10"
       height="10"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2.5"
       strokeLinecap="round"
       strokeLinejoin="round"
       className={rotate}
     >
       <polyline points="18 15 12 9 6 15" />
     </svg>
     {trend}
   </span>
 );
}

export function KpiCards({ cards }: Props) {
 return (
   <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
     {cards.map((card, i) => {
       const numericValue = parseNumericValue(card.value);
       const isNumeric = !isNaN(numericValue) && card.value.replace(/[^0-9.]/g, "").length > 0;
       const suffix = card.value.includes("DH") ? " DH" : "";

       return (
         <motion.div
           key={card.title}
           initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(3px)" }}
           whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
           viewport={{ once: true, margin: "-40px" }}
           transition={{
             duration: 0.55,
             delay: Math.min(i * 0.07, 0.7),
             ease: [0.22, 1, 0.36, 1],
           }}
           className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5"
         >
           <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
           <div className="relative z-10">
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/60">{card.icon}</span>
               {card.trend && <TrendIndicator trend={card.trend} trendDir={card.trendDir} />}
             </div>
             <p className="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/50">
               {card.title}
             </p>
             <p className="mt-1 font-display text-xl font-semibold tracking-tight text-white">
               {isNumeric ? (
                 <>
                   <AnimatedNumber value={numericValue} />
                   {suffix}
                 </>
               ) : (
                 card.value
               )}
             </p>
           </div>
           <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/[0.04] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
         </motion.div>
       );
     })}
   </div>
 );
}

export function KpiCardsSkeleton() {
 return (
   <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
     {Array.from({ length: 10 }).map((_, i) => (
       <motion.div
         key={i}
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.4, delay: i * 0.07 }}
         className="animate-pulse rounded-xl border border-white/[0.06] bg-surface p-5"
       >
         <div className="mb-3 h-3 w-8 rounded bg-white/5" />
         <div className="mb-2 h-2 w-16 rounded bg-white/5" />
         <div className="h-6 w-24 rounded bg-white/5" />
       </motion.div>
     ))}
   </div>
 );
}
