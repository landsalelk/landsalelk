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
import { Skeleton } from "@/components/ui/Skeleton";
import { useComparison } from "@/context/ComparisonContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(undefined);
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { account } = await import("@/appwrite");
        const session = await account.get();
        setUser(session);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const navLinks = [
    { name: "Lands", href: "/properties?type=land" },
    { name: "Houses", href: "/properties?type=sale" },
    { name: "Rent", href: "/properties?type=rent" },
    { name: "Agents", href: "/agents" },
    { name: "Submit Lead", href: "/submit-lead" },
    { name: "Legal", href: "/legal" },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        suppressHydrationWarning
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`glass-panel rounded-2xl px-6 transition-all duration-300 ${scrolled ? "py-3 shadow-lg" : "py-4"}`}
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
              <div className="nav-pills hidden md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`nav-pill hover:bg-white/50 ${
                      isActive(link.href)
                        ? "active bg-white text-[#10b981] shadow-sm"
                        : ""
                    }`}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="hidden items-center gap-3 md:flex">
                {user === undefined ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                  </div>
                ) : user ? (
                  <>
                    <NotificationBell user={user} />
                    <Link
                      href="/dashboard"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Dashboard"
                      aria-label="Go to Dashboard"
                    >
                      <Home className="h-5 w-5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/agent/dashboard"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Agent Dashboard"
                      aria-label="Go to Agent Dashboard"
                    >
                      <User className="h-5 w-5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/agent/my-id"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="My Agent ID"
                      aria-label="View My Agent ID"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/vault"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Legal Vault"
                      aria-label="Open Legal Vault"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/messages"
                      className="relative rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Messages"
                      aria-label="View Messages"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/profile?tab=saved"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-[#d1fae5] hover:text-[#10b981]"
                      title="Saved Properties"
                      aria-label="View Saved Properties"
                    >
                      <Heart className="h-5 w-5" aria-hidden="true" />
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
                  className="btn-primary animate-jelly flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Ad</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-3 md:hidden">
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
        <div className="glass-panel animate-slide-up fixed top-20 right-4 left-4 z-40 overflow-hidden rounded-2xl shadow-xl md:hidden">
          <div className="space-y-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-base font-bold transition-colors ${
                  isActive(link.href)
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
              {user === undefined ? (
                <Skeleton className="h-12 w-full rounded-xl" />
              ) : user ? (
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
        className="mobile-bottom-nav safe-area-bottom md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className={`mobile-nav-btn touch-target ${
              pathname === "/" ? "active text-[#10b981]" : ""
            }`}
            onClick={() => setIsOpen(false)}
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Home className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            href="/properties"
            className={`mobile-nav-btn touch-target ${
              pathname.startsWith("/properties") &&
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
            className={`mobile-nav-btn touch-target -mt-6 rounded-full border-4 border-[#ecfdf5] bg-white p-2 shadow-lg ${
              pathname === "/properties/create"
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
            className={`mobile-nav-btn touch-target ${
              pathname === "/profile" && pathname.includes("saved")
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
            className={`mobile-nav-btn touch-target ${
              pathname === "/profile" ? "active text-[#10b981]" : ""
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
