import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewTicket from "./pages/NewTicket";
import CreateTicket from "./pages/CreateTicket";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import MyTickets from "./pages/MyTickets";
import PendingTickets from "./pages/PendingTickets";
import ResolutionHistory from "./pages/ResolutionHistory";
import ActiveTickets from "./pages/ActiveTickets";
import SLARisks from "./pages/SLARisks";
import AllTickets from "./pages/AllTickets";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import HeatMap from "./pages/HeatMap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="new-ticket" element={<NewTicket />} />
              <Route path="create-ticket" element={<CreateTicket />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="my-tickets" element={<MyTickets />} />
              <Route path="pending-tickets" element={<PendingTickets />} />
              <Route path="resolution-history" element={<ResolutionHistory />} />
              <Route path="active-tickets" element={<ActiveTickets />} />
              <Route path="sla-risks" element={<SLARisks />} />
              <Route path="all-tickets" element={<AllTickets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="heat-map" element={<HeatMap />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
