import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VeggieCard from "../components/VeggieCard";
import { useVegetables } from "../context/VegetablesContext";
import { useWishlist } from "../context/WishlistContext";
import { sortWishlistedFirst } from "../utils/sortWishlisted";
import BroccoliHeroImage from "../images/Broccoli.jpg";


/* ── Hero ── */
const Hero = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  // The hero card mirrors whichever vegetable the admin has marked
  // "Feature on homepage" in the Seller Dashboard — so its name, price,
  // image and organic badge always match the live listing instead of a
  // hardcoded Broccoli/Rs 40 card that could drift out of sync.
  const { featured } = useVegetables();
  const heroName = featured?.name || "Broccoli";
  const heroImage = featured?.image || BroccoliHeroImage;
  const heroPrice = featured ? featured.price.toFixed(2) : "40.00";
  const heroUnit = featured?.unit || "head";
  const heroOrganic = featured ? featured.organic : true;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-16">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-leaf-100 rounded-full opacity-60" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-soil-100 rounded-full opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-leaf-200 rounded-full opacity-50" />
        {/* Floating vegetables */}
        <div className="absolute top-24 right-[12%] text-6xl animate-float" style={{animationDelay:"0.3s"}}>🍅</div>
        <div className="absolute top-40 right-[28%] text-4xl animate-float" style={{animationDelay:"0.9s"}}>🥦</div>
        <div className="absolute bottom-32 right-[8%] text-5xl animate-float" style={{animationDelay:"0.6s"}}>🥕</div>
        <div className="absolute bottom-48 left-[8%] text-3xl animate-float" style={{animationDelay:"1.2s"}}>🧅</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        {/* Text */}
        <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 bg-leaf-100 text-leaf-700 text-xs font-body font-semibold px-4 py-2 rounded-full mb-6 border border-leaf-200">
            <span className="w-2 h-2 bg-leaf-500 rounded-full animate-pulse" />
            Harvested Fresh Today
          </div>

          <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-bark leading-none mb-6">
            Pure<br />
            <span className="text-leaf-600">Vegetables,</span><br />
            <span className="text-soil-500">Zero Compromise.</span>
          </h1>

          <p className="font-body text-bark/60 text-lg leading-relaxed mb-8 max-w-md">
            We grow and deliver the finest organic vegetables from our partner farms. No pesticides. No middlemen. Just honest, fresh produce on your doorstep.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary text-base px-8 py-3.5">
              Shop Vegetables →
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-leaf-100">
            {[["1 ", "Farm Partners"], ["12", "Veggie Varieties"], ["5+", "Happy Families"]].map(([num, label]) => (
              <div key={label}>
                <p className="font-display font-bold text-2xl text-bark">{num}</p>
                <p className="font-body text-xs text-bark/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual card cluster */}
        <div className={`relative transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Main card */}
            <Link
              to={featured?.slug ? `/vegetable/${featured.slug}` : "/shop"}
              className="absolute inset-4 bg-white rounded-3xl shadow-xl overflow-hidden border border-leaf-100 block"
            >
              <div className="h-3/5 bg-gradient-to-br from-leaf-100 to-leaf-200 flex items-center justify-center">
                <img
                  src={heroImage}
                  alt={`Fresh ${heroName}`}
                  className="w-48 h-48 object-cover rounded-2xl shadow-lg"
                />
              </div>
              <div className="p-5">
                <p className="font-display font-bold text-bark text-lg">{heroName}</p>
                <p className="font-body text-bark/50 text-sm mb-3">Freshly harvested this morning</p>
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-leaf-700 text-xl">Rs {heroPrice} <span className="text-sm font-body text-bark/40">/ {heroUnit}</span></span>
                  {heroOrganic && (
                    <span className="bg-leaf-100 text-leaf-700 text-xs font-body font-semibold px-3 py-1 rounded-full">🌿 Organic</span>
                  )}
                </div>
              </div>
            </Link>

            {/* Floating chips */}
            <div className="absolute -top-2 left-0 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-leaf-100">
              <span className="text-xl">🚚</span>
              <div>
                <p className="font-display font-bold text-xs text-bark">Free Delivery</p>
                <p className="font-body text-[10px] text-bark/40">Orders over Rs 25</p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 bg-leaf-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <p className="font-display font-bold text-xs">Farm to Door</p>
                <p className="font-body text-[10px] text-leaf-200">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Category Strip ── */
const CategoryStrip = () => {
  const { categories } = useVegetables();
  return (
  <section className="py-12 bg-white border-y border-leaf-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-bark">Shop by Category</h2>
        <Link to="/shop" className="text-sm font-body text-leaf-600 hover:text-leaf-800 transition font-medium">View all →</Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.name === "All" ? "/shop" : `/shop?cat=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-leaf-100 hover:border-leaf-300 hover:bg-leaf-50 transition-all duration-200 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
            <p className="font-body font-semibold text-xs text-bark text-center leading-tight">{cat.name}</p>
            <p className="font-body text-[10px] text-bark/30">{cat.count} items</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
  );
};

/* ── Featured Products ── */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const FeaturedProducts = () => {
  const { vegetables, loading } = useVegetables();
  const { isWishlisted } = useWishlist();

  // "Today's Harvest" means literally that — vegetables an admin either
  // added, or restocked with a new batch, within the last 24 hours.
  const recentlyAdded = vegetables.filter((v) => {
    const freshest = v.restockedAt || v.createdAt;
    return freshest && Date.now() - new Date(freshest).getTime() <= ONE_DAY_MS;
  });
  const featured = sortWishlistedFirst(recentlyAdded, isWishlisted).slice(0, 8);

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-body text-xs font-semibold text-leaf-600 uppercase tracking-widest mb-1">Freshly In</p>
            <h2 className="font-display font-bold text-3xl text-bark">Today's Harvest</h2>
          </div>
          <Link to="/shop" className="btn-outline text-sm px-5 py-2.5">See All Vegetables</Link>
        </div>
        {loading ? (
          <p className="font-body text-bark/40 text-sm py-8 text-center">Loading today's harvest…</p>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-3">🌱</span>
            <p className="font-body text-bark/50 text-sm">No new vegetables added in the last 24 hours.</p>
            <Link to="/shop" className="btn-outline text-sm px-5 py-2.5 mt-5">See All Vegetables</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((veg) => (
              <VeggieCard key={veg.id} veg={veg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Why Us ── */
const WhyUs = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="font-body text-xs font-semibold text-leaf-600 uppercase tracking-widest mb-2">Why Vegetable Store</p>
        <h2 className="font-display font-bold text-3xl text-bark">Grown with intention,<br />delivered with care.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🌱", title: "Farm-Direct Sourcing", desc: "We cut out every middleman. Vegetables go from the farm to your door within 24 hours of harvest." },
          { icon: "🔬", title: "Lab Tested Quality", desc: "Every batch is tested for pesticides, heavy metals, and freshness before it ever reaches your door." },
          { icon: "📦", title: "Eco Packaging", desc: "Our packaging is 100% compostable. We plant one tree for every 10 orders placed on our platform." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="group p-6 rounded-2xl border border-leaf-100 hover:border-leaf-300 hover:bg-leaf-50/50 transition-all duration-300">
            <div className="w-14 h-14 bg-leaf-100 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <h3 className="font-display font-bold text-bark text-lg mb-2">{title}</h3>
            <p className="font-body text-bark/60 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── PAGE ── */
const HomePage = () => {
  const { refetch } = useVegetables();

  // The vegetable list (and the featured/hero pick) is fetched once when
  // the app loads. If an admin features a different vegetable or edits one
  // in the dashboard and then navigates here via client-side routing (no
  // full page reload), that stale list would still be showing — so
  // refresh it every time this page is visited, same as ShopPage does.
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedProducts />
      <WhyUs />
    </>
  );
};

export default HomePage;
