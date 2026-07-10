const faqs = [
  { q: "What time do you harvest?", a: "Our farm partners harvest early morning between 4 AM and 7 AM. Your order is packed and dispatched by midday for same-day delivery." },
  { q: "Can I change or cancel my order?", a: "You can modify or cancel orders." },
  { q: "Do you offer subscription ?", a: "Currently, we don't offer subscription boxes." },
  { q: "Is all produce organic?", a: "The majority is certified organic. Where it isn't, we clearly label it." },
  { q: "Is refund available?", a: "Currently we havent added that feature." },
];

const ContactPage = () => {
  return (
    <div className="bg-cream min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-700 to-leaf-600 py-14 px-6 text-center">
        <p className="font-body text-leaf-200 text-xs font-semibold uppercase tracking-widest mb-2">We're Human</p>
        <h1 className="font-display font-bold text-white text-4xl mb-2">Say Hello 👋</h1>
        <p className="font-body text-leaf-200 text-sm">We typically reply within 2 hours during business hours.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Get in Touch */}
        <div className="bg-white rounded-2xl p-6 border border-leaf-100 shadow-sm">
          <h2 className="font-display font-bold text-bark text-lg mb-5">Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: "📍", label: "Address", detail: "Kirtipur, Kathmandu" },
              { icon: "📞", label: "Phone", detail: "9849028554" },
              { icon: "✉️", label: "Email", detail: "vegetablestore@gmail.com" },
              { icon: "🕐", label: "Hours", detail: "Mon–Fri 7 AM – 7 PM, Sat 8 AM – 4 PM" },
            ].map(({ icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xl w-7 flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-body font-semibold text-xs text-bark/40 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="font-body text-bark/70 text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-7">
          <h2 className="font-display font-bold text-bark text-xl mb-5">Frequently Asked</h2>
          <div className="space-y-2">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border border-leaf-100 rounded-xl overflow-hidden">
                <summary className="px-5 py-4 font-body font-semibold text-sm text-bark cursor-pointer select-none flex justify-between items-center hover:bg-leaf-50 transition list-none">
                  {q}
                  <span className="text-leaf-500 text-lg font-bold group-open:rotate-45 transition-transform duration-200 flex-shrink-0 ml-4">+</span>
                </summary>
                <p className="px-5 pb-4 font-body text-sm text-bark/60 leading-relaxed border-t border-leaf-50 pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
