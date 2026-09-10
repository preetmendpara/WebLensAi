import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/analyze", label: "Analyzer" },
  { to: "/history", label: "History" },
  { to: "/about", label: "How it works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Border appears only once content is behind the bar (§13: motion with a reason).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-canvas/85 backdrop-blur-sm transition-[border-color] duration-300",
        scrolled ? "border-b border-line" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-baseline gap-2" aria-label="WebLens AI home">
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            WebLens
          </span>
          <span className="font-mono text-meta uppercase text-ink-faint">AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive ? "text-ink" : "text-ink-muted hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/analyze"
            className="ml-3 inline-flex h-8 items-center rounded-md bg-accent px-3 text-sm font-medium text-canvas transition-colors hover:bg-accent-hover active:translate-y-px"
          >
            Analyze a website
          </Link>
        </nav>

        <button
          className="-mr-2 rounded-md p-2 text-ink-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line md:hidden"
            aria-label="Main"
          >
            <div className="space-y-1 px-6 py-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="block rounded-md py-2 text-sm text-ink-muted"
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/analyze"
                className="mt-3 flex h-10 items-center justify-center rounded-md bg-accent text-sm font-medium text-canvas"
              >
                Analyze a website
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
