"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { ORDER_STATUS_WORKFLOW, TERMINAL_STATUSES, getWorkflowIndex } from "@/lib/config";

const ease = [0.16, 1, 0.3, 1] as const;

type OrderStatusWorkflowProps = {
  orderStatus: string;
  updating: boolean;
  onUpdateStatus: (status: string) => void;
};

function StatusIcon({ status, className }: { status: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    processing: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4.5A2.5 2.5 0 0113 4.5V2M20 12v4.5A2.5 2.5 0 0117.5 19H6.5A2.5 2.5 0 014 16.5V7.5A2.5 2.5 0 016.5 5H10" />
        <path d="M12 12v4M12 8h.01" />
      </svg>
    ),
    shipped: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    out_for_delivery: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    delivered: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    completed: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    cancelled: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    refunded: (
      <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  };
  return <>{icons[status] || null}</>;
}

export function OrderStatusWorkflow({ orderStatus, updating, onUpdateStatus }: OrderStatusWorkflowProps) {
  const { t } = useTranslation("admin");
  const activeIdx = getWorkflowIndex(orderStatus);
  const terminal = TERMINAL_STATUSES[orderStatus];
  const showTerminal = !!terminal && activeIdx < 0;

  const handleStepClick = useCallback(
    (status: string) => {
      if (updating || orderStatus === status) return;
      onUpdateStatus(status);
    },
    [updating, orderStatus, onUpdateStatus],
  );

  return (
    <div className="space-y-2">
      <p className="luxury-label text-[10px] text-white/50 uppercase tracking-[0.2em]">{t("order_status_workflow")}</p>
      <div className="relative">
        <div className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-white/[0.06]" />

        {ORDER_STATUS_WORKFLOW.map((step, idx) => {
          const done = idx <= activeIdx && !showTerminal;
          const current = idx === activeIdx && !showTerminal;
          const canGoForward = idx > activeIdx;

          return (
            <motion.button
              key={step.status}
              type="button"
              disabled={updating}
              onClick={() => handleStepClick(step.status)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease, delay: idx * 0.05 }}
              className="relative flex w-full gap-4 pb-5 last:pb-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
            >
              <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                <motion.div
                  whileHover={current || canGoForward ? { scale: 1.1 } : {}}
                  whileTap={current || canGoForward ? { scale: 0.95 } : {}}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                    done
                      ? `${step.iconBg} border-transparent ${step.dotColor.replace("bg-", "text-")} cursor-pointer hover:brightness-125`
                      : current
                        ? `${step.iconBg} ${step.dotColor.replace("bg-", "ring-2 ring-")}/40 border-transparent cursor-pointer hover:brightness-125`
                        : canGoForward
                          ? "bg-white/[0.03] border-white/[0.08] text-white/20 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12]"
                          : "bg-white/[0.02] border-white/[0.04] text-white/10 cursor-not-allowed"
                  }`}
                >
                  {done ? (
                    <svg aria-hidden="true" width={24} height={24} viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : current ? (
                    <motion.span
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`h-3 w-3 rounded-full ${step.dotColor}`}
                    />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                  )}
                </motion.div>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                      done || current ? "text-white" : canGoForward ? "text-white/40 hover:text-white/60" : "text-white/20"
                    }`}
                  >
                    {step.label}
                  </span>
                  {current && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease }}
                      className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] ${step.badgeColor}`}
                    >
                      {t("active_badge")}
                    </motion.span>
                  )}
                  {done && !current && (
                    <span className="rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] bg-white/[0.06] text-white/40">
                      {t("done_badge")}
                    </span>
                  )}
                  {canGoForward && !current && (
                    <span className="rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] bg-white/[0.03] text-white/20">
                      {t("set_badge")}
                    </span>
                  )}
                </div>
                <p className={`mt-0.5 text-xs leading-relaxed ${done || current ? "text-white/50" : "text-white/20"}`}>
                  {step.description}
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Terminal status actions */}
        <div className="relative flex gap-4 pt-3 pb-5">
          <div className="relative z-10 flex shrink-0 items-start pt-0.5">
            <div className="h-9 w-9 flex items-center justify-center">
              <div className="h-px w-6 bg-white/[0.06]" />
            </div>
          </div>
          <div className="min-w-0 flex-1 pt-2">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/20">{t("terminal_states")}</p>
          </div>
        </div>

        {Object.values(TERMINAL_STATUSES).map((term) => {
          const isActive = orderStatus === term.status;
          return (
            <motion.button
              key={term.status}
              type="button"
              disabled={updating || isActive}
              onClick={() => handleStepClick(term.status)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease }}
              className="relative flex w-full gap-4 pb-5 last:pb-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
            >
              <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={isActive ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? `${term.iconBg} ring-2 ${term.dotColor.replace("bg-", "ring-")}/40`
                      : "bg-white/[0.03] border border-white/[0.08] text-white/20 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <StatusIcon status={term.status} className="h-4 w-4" />
                </motion.div>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                      isActive
                        ? term.status === "cancelled" ? "text-burgundy" : "text-gold"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {term.label}
                  </span>
                  {isActive && (
                    <span className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] ${term.badgeColor}`}>
                      {t("active_badge")}
                    </span>
                  )}
                </div>
                <p className={`mt-0.5 text-xs leading-relaxed ${isActive ? "text-white/50" : "text-white/20"}`}>
                  {term.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
