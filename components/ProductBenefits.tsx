import type { JSX } from "react";

export type BenefitIcon = "ingredients" | "delivery" | "payment" | "quality";

export type ProductBenefitsItem = {
  icon: BenefitIcon;
  title: string;
  description: string;
};

type ProductBenefitsProps = {
  label: string;
  items: ProductBenefitsItem[];
};

const ICONS: Record<BenefitIcon, JSX.Element> = {
  ingredients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M12 22c-4.97 0-8-3.13-8-8.02C4 8.5 7 4.5 12 2c0 0 2 4.5 2 8.5 0 3.4-1.3 5.5-4 6.5 2.5-1 3.4-2.4 3.4-5" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17" cy="18.5" r="1.8" />
    </svg>
  ),
  payment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </svg>
  ),
  quality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M12 2l2.4 5.2 5.6.8-4 4 1 5.8-5-2.7-5 2.7 1-5.8-4-4 5.6-.8z" />
      <path d="M9.3 12.2l1.8 1.8 3.6-3.8" />
    </svg>
  ),
};

export function ProductBenefits({ label, items }: ProductBenefitsProps) {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-8 md:py-24 lg:px-12">
        <div className="mb-12 flex items-center gap-4 md:mb-14">
          <span className="h-px w-10 bg-gold/50" />
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-gold">{label}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.icon}
              className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors duration-300 hover:border-gold/25"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.06] text-gold transition-colors duration-300 group-hover:bg-gold/10">
                {ICONS[item.icon]}
              </span>
              <h3 className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white/90">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-white/40">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
