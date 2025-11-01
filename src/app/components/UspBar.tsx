function IconDelivery(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 15.5V7.8c0-.9.7-1.6 1.6-1.6h8.9c.8 0 1.5.6 1.6 1.4l.3 2.4h3.1c.7 0 1.2.4 1.4 1l1 2.7v3.8"/>
      <circle cx="7.5" cy="17.5" r="1.8"/>
      <circle cx="17" cy="17.5" r="1.8"/>
      <path d="M3 15.5h2.3m13.8 0h3"/>
    </svg>
  );
}

function IconFresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 4s-5.2.3-9.3 4.4C6.6 12.6 6.2 18 6.2 18s5.4.4 9.6-4.5C19.9 9.4 20 4 20 4z"/>
      <path d="M9.6 10.2c1.1.3 2.5 1.1 3.6 2.2 1.1 1.1 1.9 2.4 2.2 3.6"/>
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.8 18.5 3.8 21l2.7-.8A8.7 8.7 0 1 0 4.8 18.5z"/>
      <path d="M9.2 8.8c0 3 3 5.1 5 5.8.4.1.8 0 1.1-.3l.8-.7c.2-.2.2-.5 0-.7l-1.4-1.2c-.2-.1-.4-.1-.6 0l-.6.4c-.2.1-.4.1-.6 0-1-.5-2.2-1.6-2.7-2.6-.1-.2-.1-.4 0-.6l.4-.6c.1-.2.1-.4 0-.6L9.9 7c-.2-.2-.5-.2-.7 0l-.7.8c-.2.3-.3.7-.3 1z"/>
    </svg>
  );
}

function IconCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 4v3m12-3v3M4.5 8h15A1.5 1.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-8C3 8.7 3.7 8 4.5 8z"/>
      <path d="M7.2 12.2h3m3.6 0H18M7.2 15.6h3m3.6 0H18"/>
    </svg>
  );
}

export default function UspBar() {
  const items = [
    { icon: IconFresh, title: "Freshly baked", text: "Made to order, never shelf‑worn." },
    { icon: IconDelivery, title: "Delivery only", text: "Straight to your door." },
    { icon: IconWhatsApp, title: "1‑tap confirm", text: "Order via WhatsApp." },
    { icon: IconCalendar, title: "Pre‑order window", text: "Choose your date (14 days)." },
  ];

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-screen-md px-4 py-4 sm:py-5">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="h-6 w-6 text-brand" />
              <div className="leading-tight">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-neutral-600">{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
