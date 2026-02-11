import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { LayoutDashboard, ClipboardList, BarChart3, LogOut, Settings, Building2 } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inspections", label: "Inspeções", icon: ClipboardList },
  { to: "/logs", label: "Logs", icon: ClipboardList },
  { to: "/charts", label: "Gráficos", icon: BarChart3 },
];

const adminItems = [
  { to: "/branches", label: "Filiais", icon: Building2 },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, isAdmin, user } = useAuth();
  const location = useLocation();

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
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
          <img src={logo} alt="Troppo Buono" className="h-8 object-contain" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "Func."}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b p-2 lg:hidden">
          {[...navItems, ...(isAdmin ? adminItems : [])].map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
