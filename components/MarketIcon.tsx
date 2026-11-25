export function MarketIcon({ name }: { name: "truck" | "box" | "shield" | "headset" | "arrow" | "person" | "search" | "shop" }) {
  const paths = {
    truck: "M2 5h12v12H2z M14 9h4l4 4v4h-8 M5 17a2 2 0 1 0 4 0 M16 17a2 2 0 1 0 4 0",
    box: "M3 8l9-5 9 5v9l-9 5-9-5z M3 8l9 5 9-5 M12 13v9 M8 5l9 5",
    shield: "M12 2c3 2 6 3 9 3v6c0 5-3 9-9 11-6-2-9-6-9-11V5c3 0 6-1 9-3z M8 12l3 3 5-6",
    headset: "M3 13v-2a9 9 0 0 1 18 0v2 M3 12H2v6h4v-6z M21 12h1v6h-4v-6z M19 18v2l-6 2",
    arrow: "M4 12h15 M13 6l6 6-6 6",
    person: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M3 22v-2a9 9 0 0 1 18 0v2z",
    search: "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z M16 16l5 5",
    shop: "M3 10l2-6h14l2 6 M3 10v11h18V10 M3 10h18 M9 21v-7h6v7",
  };
  return (
    <svg className={name === "arrow" ? "rtl:rotate-180" : undefined} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
