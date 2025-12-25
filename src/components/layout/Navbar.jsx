"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  Search,
  MapPin,
  PlusCircle,
  Heart,
  Home,
  Scale,
} from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";
import { useComparison } from "@/context/ComparisonContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Prevent auth flicker
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { compareList } = useComparison() || {};
  const pathname = usePathname();

  // Check if a nav link is active
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  useEffect(() => {
    setMounted(true);

    // Throttled scroll handler for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { account } = await import("@/appwrite");
        const session = await account.get();
        setUser(session);
      } catch (e) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, []);

  const navLinks = [
    { name: "Properties", href: "/properties" },
    { name: "Map Search", href: "/map" },
    { name: "Agents", href: "/agents" },
    { name: "Submit Lead", href: "/submit-lead" },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        suppressHydrationWarning
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "py-1" : "py-2"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`glass-panel rounded-2xl px-6 transition-all duration-300 ${scrolled ? "py-2 shadow-lg" : "py-3"}`}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10b981] shadow-lg transition-transform group-hover:scale-110">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-800">
                  LandSale<span className="text-[#10b981]">.lk</span>
                </span>
              </Link>

              {/* Desktop Nav Pills */}
              <div className="nav-pills hidden lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`nav-pill hover:bg-white/50 ${isActive(link.href)
                      ? "active bg-white text-[#10b981] shadow-sm"
                      : ""
                      }`}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/auth/register/agent"
                  className="nav-pill border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  Become an Agent
                </Link>
              </div>

              {/* Right Side Actions */}
              <div className="hidden items-center gap-3 lg:flex">
                {authLoading ? (
                  /* Auth Loading Skeleton */
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="h-9 w-9 rounded-xl bg-slate-200" />
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                  </div>
                ) : user ? (
                  <>
                    <NotificationBell />
                    <Link
                      href="/dashboard"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Dashboard"
                      aria-label="Go to Dashboard"
                    >
                      <Home className="h-5 w-5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/profile"
                      className="group flex items-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#d1fae5] to-[#cffafe] p-0.5 transition-transform group-hover:scale-110">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#10b981] font-bold text-white">
                          {user.name?.charAt(0) || "U"}
                        </div>
                      </div>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm font-bold text-slate-600 transition-colors hover:text-[#10b981]"
                  >
                    Sign In
                  </Link>
                )}

                {compareList?.length > 0 && (
                  <Link
                    href="/compare"
                    className="relative rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                    title="Compare Properties"
                    aria-label={`Compare ${compareList.length} Properties`}
                  >
                    <Scale className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {compareList.length}
                    </span>
                  </Link>
                )}

                <Link
                  href="/properties/create"
                  className="btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Ad</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-3 lg:hidden">
                <Link
                  href="/properties/create"
                  className="rounded-xl bg-[#10b981] p-2 text-white shadow-lg"
                  aria-label="Post a new property"
                >
                  <PlusCircle className="h-5 w-5" aria-hidden="true" />
                </Link>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-xl bg-white/50 p-2 text-slate-700"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="glass-panel animate-slide-up fixed top-20 right-4 left-4 z-40 overflow-hidden rounded-2xl shadow-xl lg:hidden">
          <div className="space-y-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-base font-bold transition-colors ${isActive(link.href)
                  ? "bg-[#ecfdf5] text-[#10b981]"
                  : "text-slate-700 hover:bg-[#ecfdf5] hover:text-[#10b981]"
                  }`}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
              {user ? (
                <Link
                  href="/profile"
                  className="w-full rounded-xl bg-[#10b981] py-3 text-center font-bold text-white"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="w-full rounded-xl bg-slate-100 py-3 text-center font-bold text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full rounded-xl bg-[#10b981] py-3 text-center font-bold text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav
        className="mobile-bottom-nav safe-area-bottom lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className={`mobile-nav-btn touch-target ${pathname === "/" ? "active text-[#10b981]" : ""
              }`}
            onClick={() => setIsOpen(false)}
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Home className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            href="/properties"
            className={`mobile-nav-btn touch-target ${pathname.startsWith("/properties") &&
              !pathname.includes("/create")
              ? "active text-[#10b981]"
              : ""
              }`}
            onClick={() => setIsOpen(false)}
            aria-label="Search properties"
            aria-current={
              pathname.startsWith("/properties") &&
                !pathname.includes("/create")
                ? "page"
                : undefined
            }
          >
            <Search className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            href="/properties/create"
            className={`mobile-nav-btn touch-target -mt-6 rounded-full border-4 border-[#ecfdf5] bg-white p-2 shadow-lg ${pathname === "/properties/create"
              ? "text-[#059669]"
              : "text-[#10b981]"
              }`}
            onClick={() => setIsOpen(false)}
            aria-label="Post new property"
            aria-current={
              pathname === "/properties/create" ? "page" : undefined
            }
          >
            <PlusCircle
              className="h-8 w-8"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/profile?tab=saved"
            className={`mobile-nav-btn touch-target ${pathname === "/profile" && pathname.includes("saved")
              ? "active text-[#10b981]"
              : ""
              }`}
            onClick={() => setIsOpen(false)}
            aria-label="Saved properties"
          >
            <Heart className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            className={`mobile-nav-btn touch-target ${pathname === "/profile" ? "active text-[#10b981]" : ""
              }`}
            onClick={() => setIsOpen(false)}
            aria-label="My profile"
            aria-current={pathname === "/profile" ? "page" : undefined}
          >
            <User className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </>
  );
}
