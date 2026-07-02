const Footer = () => {
  return (
  <footer className="bg-bark text-white/70">
    {/* Top strip */}
    <div className="bg-leaf-700">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🚚", title: "Free Delivery", desc: "On all orders over Rs 25" },
          { icon: "🌿", title: "Certified Organic", desc: "Sourced from trusted farms" },
          { icon: "🔄", title: "Freshness Guarantee", desc: "Full refund if not satisfied" },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-display font-bold text-white text-sm">{title}</p>
              <p className="text-leaf-200 text-xs font-body">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main footer */}
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-leaf-600 rounded-lg flex items-center justify-center text-base">🥕</div>
        <span className="font-display font-bold text-white text-lg">Vegetable Store</span>
      </div>
      <p className="text-sm font-body leading-relaxed mb-4 max-w-xs">
        We grow and deliver the freshest organic vegetables directly from our partner farms to your kitchen table — every single day.
      </p>
      <div className="flex gap-3">
        {["🐦", "📸", "👥", "▶️"].map((icon, i) => (
          <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-leaf-600 transition text-xs">
            {icon}
          </a>
        ))}
      </div>
    </div>

    <div className="border-t border-white/10 py-4 px-6">
      <p className="text-center text-xs font-body text-white/30">
        © 2026 Vegetable Store. All rights reserved. Made with 💚 for vegetable lovers.
      </p>
    </div>
  </footer>
  );
};

export default Footer;
