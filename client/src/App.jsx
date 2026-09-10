import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Home from "@/pages/Home";

// The report pulls in the heaviest components; load them on demand (§30).
const Analyzer = lazy(() => import("@/pages/Analyzer"));
const Report = lazy(() => import("@/pages/Report"));
const History = lazy(() => import("@/pages/History"));
const About = lazy(() => import("@/pages/About"));

/** Route changes start at the top, and move focus for keyboard users. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-10 w-80 max-w-full" />
      <Skeleton className="mt-10 h-48 w-full" />
    </div>
  );
}

function Shell() {
  useSmoothScroll();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>

      <Navbar />
      <ScrollToTop />

      <div id="main" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<Analyzer />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
