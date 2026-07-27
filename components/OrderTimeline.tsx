"use client";

import { ORDER_STATUS_WORKFLOW, TERMINAL_STATUSES, getWorkflowIndex, isTerminalStatus } from "@/lib/config";

type OrderTimelineProps = {
  orderStatus: string;
  updatedAt: string;
  createdAt: string;
  actualDeliveryDate?: string | null;
};

function formatStepDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusStepDate(
  idx: number,
  activeIdx: number,
  orderStatus: string,
  createdAt: string,
  updatedAt: string,
  actualDelivery?: string | null,
): string {
  if (isTerminalStatus(orderStatus)) {
    if (idx === 0 && activeIdx === 0) return formatStepDate(createdAt);
    if (idx === activeIdx) return formatStepDate(updatedAt);
    return "";
  }
  if (idx === 0) return formatStepDate(createdAt);
  if ((orderStatus === "delivered" || orderStatus === "completed") && actualDelivery) {
    if (idx === activeIdx) return formatStepDate(actualDelivery);
  }
  if (idx < activeIdx) return formatStepDate(updatedAt);
  if (idx === activeIdx) return formatStepDate(updatedAt);
  return "";
}

export function OrderTimeline({ orderStatus, updatedAt, createdAt, actualDeliveryDate }: OrderTimelineProps) {
  const activeIdx = getWorkflowIndex(orderStatus);
  const terminal = TERMINAL_STATUSES[orderStatus];
  const showTerminal = terminal && activeIdx < 0;

  return (
    <div className="space-y-2">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-gold/70 text-ivory/50">Order Timeline</p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-ivory/[0.06]" />

        {/* Forward workflow steps */}
        {ORDER_STATUS_WORKFLOW.map((step, idx) => {
          const done = idx <= activeIdx && !isTerminalStatus(orderStatus) && !showTerminal;
          const current = idx === activeIdx && !isTerminalStatus(orderStatus) && !showTerminal;

          return (
            <div
              key={step.status}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/* Step dot */}
              <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500 ${
                    done
                      ? `${step.iconBg} border-transparent ${step.dotColor.replace("bg-", "text-")}`
                      : current
                        ? `${step.iconBg} ${step.dotColor.replace("bg-", "ring-2 ring-")}/30 border-transparent`
                        : "bg-ivory/[0.03] border-ivory/[0.06] text-ivory/20"
                  }`}
                >
                  {done ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : current ? (
                    <span className={`h-3 w-3 rounded-full ${step.dotColor}`} />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-ivory/[0.08]" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold tracking-wide ${
                      done ? "text-ivory" : current ? "text-ivory" : "text-ivory/30"
                    }`}
                  >
                    {step.label}
                  </p>
                  {current && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] ${step.badgeColor}`}
                    >
                      Current
                    </span>
                  )}
                </div>
                <p className={`mt-0.5 text-xs leading-relaxed ${done || current ? "text-ivory/50" : "text-ivory/20"}`}>
                  {current && !done ? `${step.description}` : done ? `${step.description}` : step.description}
                </p>
                {(() => {
                  const date = statusStepDate(idx, activeIdx, orderStatus, createdAt, updatedAt, actualDeliveryDate);
                  if (!date) return null;
                  return (
                    <p
                      className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-ivory/30"
                    >
                      {date}
                    </p>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {/* Terminal status (cancelled / refunded) */}
        {showTerminal && terminal ? (
          <div
            className="relative flex gap-4 pt-2"
          >
            <div className="relative z-10 flex shrink-0 items-start pt-0.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${terminal.iconBg} text-sm font-bold`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {terminal.status === "cancelled" ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </>
                  ) : (
                    <>
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path d="M9 12l2 2 4-4" />
                    </>
                  )}
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold tracking-wide ${terminal.status === "cancelled" ? "text-red-400" : "text-orange-400"}`}>
                  {terminal.label}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] ${terminal.badgeColor}`}>
                  {terminal.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ivory/50">{terminal.description}</p>
              <p
                className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-ivory/30"
              >
                {formatStepDate(updatedAt)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
