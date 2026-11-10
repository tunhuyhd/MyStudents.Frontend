"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ArrowUpRight } from "@/components/ui/icons";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getAvatarUrl } from "@/lib/api";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const links = [
    ...(user?.role === "Admin"
      ? [
        { href: "/admin", label: t("admin.panel") },
        { href: "/me", label: t("campus.profileNav") },
      ]
      : user
        ? [
          { href: "/teacher/overview", label: t("overview.nav") },
          { href: "/teacher", label: t("club.classesNav") },
          { href: "/teacher/students", label: t("teacher.students.label") },
          { href: "/me", label: t("club.profileNav") },
        ]
        : [
          { href: "/#features", label: t("campus.homeExplore") },
          { href: "/auth/login", label: t("auth.login") },
        ]),
    { href: "/handbook", label: t("common.handbook") },
  ];
  const initials = (user?.fullName || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(-2)
    .join("");
  return (
    <header className="club-nav-wrap">
      <nav aria-label={t("common.navigation")} className="club-nav">
        <Link href="/" className="club-brand">
          <BrandLogo />
        </Link>
        <div className="club-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                pathname === link.href ||
                  (link.href === "/teacher" &&
                    pathname.startsWith("/teacher/class/"))
                  ? "page"
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="club-nav-account">
          {!loading && user && (
            <details className="club-account-menu">
              <summary
                aria-label={user.fullName}
                className="club-profile-control"
              >
                {user.imageUrl ? (
                  <img
                    src={getAvatarUrl(user.imageUrl) || ""}
                    alt=""
                    className="club-user-image"
                  />
                ) : (
                  <span className="club-user-initials">{initials}</span>
                )}
                <span className="club-user-name">{user.fullName}</span>
              </summary>
              <div className="club-popover">
                <Link href="/me">
                  {t("campus.profileNav")}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button type="button" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </button>
              </div>
            </details>
          )}
          <LanguageSwitcher />
          {!user && !loading && (
            <Link href="/auth/register" className="club-nav-signup">
              {t("common.getStarted")}
            </Link>
          )}
          <button
            type="button"
            className="club-mobile-toggle"
            aria-label={
              open ? t("common.closeNavigation") : t("common.openNavigation")
            }
            aria-expanded={open}
            aria-controls="club-mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div id="club-mobile-navigation" className="club-mobile-menu">
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button type="button" onClick={() => void logout()}>
                {t("auth.logout")}
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
