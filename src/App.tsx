import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import SellCar from "./pages/SellCar";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ListingsManagement from "./pages/admin/ListingsManagement";
import UsersKYC from "./pages/admin/UsersKYC";
import MediaModeration from "./pages/admin/MediaModeration";
import Finances from "./pages/admin/Finances";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/sell" element={<SellCar />} />
          <Route path="/sell/:id" element={<SellCar />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="listings" element={<ListingsManagement />} />
          <Route path="users" element={<UsersKYC />} />
          <Route path="media" element={<MediaModeration />} />
          <Route path="finances" element={<Finances />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
