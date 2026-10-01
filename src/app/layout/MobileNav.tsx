import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, FileText, Users, Building2, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { to: "/", labelKey: "pages.dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", labelKey: "pages.invoices", icon: FileText, end: false },
  { to: "/clients", labelKey: "pages.clients", icon: Users, end: false },
  { to: "/company", labelKey: "pages.company", icon: Building2, end: false },
  { to: "/settings", labelKey: "pages.settings", icon: Settings, end: false }
];

/** Bottom tab bar — primary navigation on a mobile-first, one-hand layout. */
export function MobileNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch border-t border-line bg-surface-nav safe-bottom">
      {items.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
              isActive ? "text-accent" : "text-navInactive"
            )
          }
        >
          <Icon size={22} strokeWidth={1.75} />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
