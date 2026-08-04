"use client";

import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

export function AdminDashboardSkeleton() {
 return (
   <div className="space-y-6 p-6">
     <div className="flex items-center justify-between">
       <Skeleton className="h-8 w-48" rounded="lg" />
       <Skeleton className="h-4 w-32" rounded="full" />
     </div>
     <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
       {Array.from({ length: 10 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4, delay: i * 0.05 }}
           className="rounded-xl border border-white/[0.06] bg-surface p-5"
         >
           <div className="mb-3 h-3 w-8 rounded-full bg-white/5 skeleton-shimmer-wave" />
           <div className="mb-2 h-2 w-16 rounded-full bg-white/5 skeleton-shimmer-wave" />
           <div className="h-6 w-20 rounded-md bg-white/5 skeleton-shimmer-wave" />
         </motion.div>
       ))}
     </div>
     <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
       {Array.from({ length: 2 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
           className="rounded-xl border border-white/[0.06] bg-surface p-6"
         >
           <Skeleton className="mb-4 h-4 w-32" rounded="md" />
           <Skeleton className="h-48 w-full rounded-lg skeleton-shimmer-wave" />
         </motion.div>
       ))}
     </div>
     <div>
       <Skeleton className="mb-4 h-4 w-24" rounded="md" />
       <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
         {Array.from({ length: 6 }).map((_, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, scale: 0.92 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
             className="rounded-xl border border-white/[0.06] bg-surface p-4"
           >
             <Skeleton className="mx-auto h-6 w-6 rounded-full skeleton-shimmer-wave" />
             <Skeleton className="mx-auto mt-2 h-3 w-16 rounded-full skeleton-shimmer-wave" />
           </motion.div>
         ))}
       </div>
     </div>
     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
       {Array.from({ length: 4 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
           className="rounded-2xl border border-white/[0.06] bg-surface p-6"
         >
           <Skeleton className="h-3 w-20 rounded-full skeleton-shimmer-wave" />
           <Skeleton className="mt-3 h-7 w-28 rounded-md skeleton-shimmer-wave" />
           <Skeleton className="mt-2 h-3 w-16 rounded-full skeleton-shimmer-wave" />
         </motion.div>
       ))}
     </div>
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, delay: 0.6 }}
       className="rounded-2xl border border-white/[0.06] bg-surface p-6"
     >
       <Skeleton className="mb-4 h-5 w-36 rounded-md skeleton-shimmer-wave" />
       <div className="space-y-3">
         {Array.from({ length: 5 }).map((_, i) => (
           <Skeleton
             key={i}
             className="h-12 w-full rounded-lg skeleton-shimmer-wave"
           />
         ))}
       </div>
     </motion.div>
   </div>
 );
}
