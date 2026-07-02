import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { VegetablesProvider } from "./context/VegetablesContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import VeggieDetailPage from "./pages/VeggieDetailPage";
import ContactPage from "./pages/ContactPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import SellerLogin from "./components/Seller/SellerLogin";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import { Toaster } from "react-hot-toast";

// Scroll to top on route change
const ScrollReset = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

// Renders the site Navbar everywhere except the admin dashboard
const ConditionalNavbar = () => {
  const { pathname } = useLocation();
  const isAdminDashboard = matchPath("/seller", pathname);
  if (isAdminDashboard) return null;
  return <Navbar />;
};

const App = () => (
  <Router>
    <CartProvider>
     <VegetablesProvider>
     <WishlistProvider>
      <ScrollReset />
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen">
        <ConditionalNavbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/vegetable/:slug" element={<VeggieDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            {/* Admin — 2 lines added, everything else above is unchanged */}
            <Route path="/seller-login" element={<SellerLogin />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
     </WishlistProvider>
     </VegetablesProvider>
    </CartProvider>
  </Router>
);

export default App;
