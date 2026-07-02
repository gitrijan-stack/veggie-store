# 🔐 Auth Components — Login & Seller Login

Two components that connect your frontend to the backend auth routes you
already built (`userController.js` and `sellerController.js`).

---

## 📁 What's included

| File | Replaces / Goes in | Connects to |
|---|---|---|
| `Login.jsx` | `frontend/src/components/Login.jsx` | `POST /api/user/register`, `POST /api/user/login` |
| `SellerLogin.jsx` | `frontend/src/components/Seller/SellerLogin.jsx` | `POST /api/seller/login` |
| `CartContext.jsx` | **Replaces** `frontend/src/context/CartContext.jsx` | Adds `user`, `logout`, `showLogin` state + auto session check |

---

## 🛠️ Setup Steps

### 1. Copy the files in

```bash
# From this folder into your project
cp Login.jsx        frontend/src/components/Login.jsx
cp SellerLogin.jsx   frontend/src/components/Seller/SellerLogin.jsx   # create Seller/ folder if missing
cp CartContext.jsx   frontend/src/context/CartContext.jsx             # overwrites existing one
```

### 2. Install `react-hot-toast` (used for success/error messages)

```bash
cd frontend
npm install react-hot-toast
```

### 3. Add the `<Toaster />` once in `App.jsx`

```jsx
import { Toaster } from "react-hot-toast";

// inside your App component's JSX, anywhere near the top:
<Toaster position="top-center" />
```

### 4. Add the Seller Login route in `App.jsx`

```jsx
import SellerLogin from "./components/Seller/SellerLogin";

// inside <Routes>:
<Route path="/seller-login" element={<SellerLogin />} />
```

### 5. Wire up the Login modal in your `Navbar.jsx`

```jsx
import { useCart } from "../context/CartContext";
import Login from "./Login";

const Navbar = () => {
  const { user, setUser, logout, showLogin, setShowLogin } = useCart();

  return (
    <>
      {/* ...existing navbar JSX... */}

      {user ? (
        <button onClick={logout} className="text-sm font-body text-bark/70 hover:text-leaf-700">
          Hi, {user.name.split(" ")[0]} · Logout
        </button>
      ) : (
        <button
          onClick={() => setShowLogin(true)}
          className="text-sm font-body font-semibold text-leaf-700 hover:text-leaf-800"
        >
          Login
        </button>
      )}

      {/* Render the modal conditionally */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSuccess={(user) => setUser(user)}
        />
      )}
    </>
  );
};
```

---

## ✅ How it works

- **User Login/Register** — `Login.jsx` is a modal with a toggle between "Log In" and "Sign Up" modes. It posts to `/api/user/login` or `/api/user/register`, and on success calls `onSuccess(user)` so you can update global state.

- **Seller/Admin Login** — `SellerLogin.jsx` is a full page (not a modal) at whatever route you mount it on (suggested: `/seller-login`). On success it redirects to `/seller` — **you'll need to build that admin dashboard page separately**, protected by checking `axios.get('/api/seller/is-auth')`.

- **Session persistence** — The updated `CartContext.jsx` calls `/api/user/is-auth` once when the app loads, so if the user already has a valid cookie, they stay logged in across page refreshes.

- **Cookies** — Both logins rely on `httpOnly` cookies set by your backend (`token` for users, `sellerToken` for sellers). Make sure `axios.defaults.withCredentials = true` is set (already included in the new `CartContext.jsx`) and your backend CORS config allows credentials (already true in your `server.js`).

---

## ⚠️ Common issues

| Problem | Fix |
|---|---|
| Login succeeds but user gets logged out on refresh | Make sure `VITE_BACKEND_URL` matches your backend's actual URL exactly (including port) |
| CORS error on login | Backend's `FRONTEND_URL` in `.env` must match your frontend's dev URL exactly |
| "Cannot find module react-hot-toast" | Run `npm install react-hot-toast` in the `frontend` folder |
| Seller login redirects to blank `/seller` page | You need to build a `SellerDashboard.jsx` page and mount it at that route — it isn't included here |
