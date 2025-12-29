import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import * as React from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StockPage from "./pages/StockPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SalesReportsPage from "./pages/SalesReportsPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import { POSProvider } from "./hooks/use-pos-store";
import { LanguageProvider } from "./hooks/use-language";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <Navigate to="/login" />;

  return (
    <POSProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </POSProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><SalesReportsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;