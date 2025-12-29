import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, ShoppingCart, History, BarChart3, Settings, Tag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { MadeWithDyad } from "./made-with-dyad";
import { useLanguage } from "@/hooks/use-language";
import { usePOS } from "@/hooks/use-pos-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive
          ? "bg-muted text-primary"
          : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { storeName, storeLogo } = usePOS();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return t("cashierInterface");
      case "/stock":
        return t("stockManagement");
      case "/history":
        return t("orderHistory");
      case "/reports":
        return t("salesReports");
      case "/categories":
        return t("manageCategories");
      case "/settings":
        return t("settings");
      default:
        return storeName;
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="h-6 w-6 object-contain" />
              ) : (
                <ShoppingCart className="h-6 w-6" />
              )}
              <span className="truncate">{storeName}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavItem
                to="/"
                icon={<ShoppingCart className="h-4 w-4" />}
                label={t("cashier")}
              />
              <NavItem
                to="/stock"
                icon={<Package className="h-4 w-4" />}
                label={t("stock")}
              />
              <NavItem
                to="/categories"
                icon={<Tag className="h-4 w-4" />}
                label={t("categories")}
              />
              <NavItem
                to="/history"
                icon={<History className="h-4 w-4" />}
                label={t("orderHistory")}
              />
              <NavItem
                to="/reports"
                icon={<BarChart3 className="h-4 w-4" />}
                label={t("salesReports")}
              />
              <NavItem
                to="/settings"
                icon={<Settings className="h-4 w-4" />}
                label={t("settings")}
              />
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
            <MadeWithDyad />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col min-h-0">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 shrink-0">
          <h1 className="text-xl font-semibold">
            {getTitle()}
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;