import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText, end: false },
  { to: "/clients", label: "Clients", icon: Users, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false }
];

/** Bottom tab bar — primary navigation on a mobile-first, one-hand layout. */
export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch border-t border-line bg-surface-nav safe-bottom">
      {items.map(({ to, label, icon: Icon, end }) => (
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
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
