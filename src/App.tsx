
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import Profile from "./pages/Profile";
import FundRequests from "./pages/parkstaff/FundRequests";
import Budget from "./pages/government/Budget";
import EmergencyRequests from "./pages/government/EmergencyRequests";
import Donations from "./pages/finance/Donations";
import BookedTours from "./pages/finance/BookedTours";
import Transactions from "./pages/auditor/Transactions";
import FinancialReports from "./pages/auditor/FinancialReports";
import Login from "./pages/Login";
import BudgetSuggestion from "./pages/finance/BudgetSuggestion";
import ExtraFunds from "./pages/government/ExtraFunds";
import InvoiceView from "./pages/auditor/InvoiceView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin routes */}
            <Route path="/admin/users" element={<UserManagement />} />
            
            {/* Park Staff routes */}
            <Route path="/park-staff/fund-requests" element={<FundRequests />} />
            
            {/* Government routes */}
            <Route path="/government/budget" element={<Budget />} />
            <Route path="/government/emergency-requests" element={<EmergencyRequests />} />
            <Route path="/government/extra-funds" element={<ExtraFunds />} />
            
            {/* Finance routes */}
            <Route path="/finance/budget-suggestion" element={<BudgetSuggestion />} />
            <Route path="/finance/donations" element={<Donations />} />
            <Route path="/finance/booked-tours" element={<BookedTours />} />
            
            {/* Auditor routes */}
            <Route path="/auditor/transactions" element={<Transactions />} />
            <Route path="/auditor/financial-reports" element={<FinancialReports />} />
            <Route path="/auditor/invoices" element={<InvoiceView />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
