import { lazy, Suspense } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";

import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import PlatformPage from "./pages/PlatformPage";

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="StreamHub home">
        <span className="brand-mark">S</span>
        <span>StreamHub</span>
      </Link>
      <nav>
        <NavLink to="/">Discover</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/analytics">Analytics</NavLink>
        <a href="/admin/">Admin</a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <Link className="brand footer-brand" to="/"><span className="brand-mark">S</span> StreamHub</Link>
      <p>Your guide to what is worth opening next.</p>
      <span>Destinations are managed independently by site administrators.</span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/platform/:slug" element={<PlatformPage />} />
          <Route path="/analytics" element={<Suspense fallback={<div className="state-page"><div className="loading">Loading analytics...</div></div>}><AnalyticsPage /></Suspense>} />
          <Route path="*" element={<div className="state-page"><h1>Page not found</h1><Link className="button" to="/">Back home</Link></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
