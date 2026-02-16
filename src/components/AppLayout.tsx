import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { LayoutDashboard, ClipboardList, BarChart3, LogOut, Settings, Building2, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/logs", label: "Logs", icon: ClipboardList },
  { to: "/charts", label: "Evolução", icon: BarChart3 },
];

const adminItems = [
  { to: "/branches", label: "Filiais", icon: Building2 },
  { to: "/settings", label: "Config", icon: Settings },
  { to: "/users", label: "Usuários", icon: Users },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, isAdmin, user } = useAuth();
  const location = useLocation();

  const allMobileItems = [...navItems, ...(isAdmin ? adminItems : [])];
  const topRow = allMobileItems.slice(0, 3);
  const bottomRow = allMobileItems.slice(3);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <img src={logo} alt="Troppo Buono" className="h-10 object-contain" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin &&
            adminItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-2 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <div className="mb-3 text-xs font-medium">
            {isAdmin ? "Administrador" : "Funcionário"}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-3 w-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-3 lg:hidden">
          <img src={logo} alt="Troppo Buono" className="h-7 object-contain" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{isAdmin ? "Admin" : "Func."}</span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={signOut}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </header>

        {/* Mobile nav - 2 rows, no horizontal scroll */}
        <nav className="flex flex-col border-b lg:hidden">
          <div className="flex">
            {topRow.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {bottomRow.length > 0 && (
            <div className="flex border-t">
              {bottomRow.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
