import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import BookTour from "@/components/BookTour";
import Services from "@/components/Services";
import Donate from "@/components/Donate";
import Payment from "@/components/Payment";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminProfile from "./pages/admin/Profile";
import AdminDashboard from "./pages/admin/dashboard";

import ParkDashboard from "./pages/parkstaff/dashboard";
// import ParkStaffProfile from "./pages/parkstaff/Profile";
import FundRequests from "./pages/parkstaff/FundRequests";

import FinanceDashboard from "./pages/finance/dashboard";
import Donations from "./pages/finance/Donations";
import BookedTours from "./pages/finance/BookedTours";
import RequestManagement from "./pages/finance/RequestManagement";
import FinanceEmergencyRequests from "./pages/finance/EmergencyRequests";
import EmergencyRequestForm from "./pages/finance/EmergencyRequestForm";
import FinanceExtraFunds from "./pages/finance/ExtraFunds";
import ExtraFundsForm from "./pages/finance/ExtraFundsForm";
import ServiceProviders from "./pages/finance/ServiceProviders";
import BudgetCreation from "./pages/finance/BudgetCreation";

import AuditorDashboard from "./pages/auditor/dashboard";
import InvoiceView from "./pages/auditor/InvoiceView";
import Transactions from "./pages/auditor/Transactions";
import FinancialReports from "./pages/auditor/FinancialReports";

import GovernmentDashboard from "./pages/government/dashboard";
import ExtraFunds from "./pages/government/ExtraFunds";
import Budget from "./pages/government/Budget";
import EmergencyRequests from "./pages/government/EmergencyRequests";


import Visitors from "@/pages/Visitors";
import Visitorregister from "@/pages/visitors/Register";
import Visitorsdashboard from "@/pages/visitors/Dashboard"

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
            <Route path="/services" element={<Services />} />
            <Route path="/book-tour" element={<BookTour />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />{/* Admin routes */}

            <Route path="/admin/dashboard" element={<AdminDashboard />} />{/* Admin routes */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/Profile" element={<AdminProfile />} />
            
            {/* Park Staff routes */}
            <Route path="/parkstaff/dashboard" element={<ParkDashboard />} />
            <Route path="/parkstaff/fund-requests" element={<FundRequests />} />
            
            {/* Government routes */}
            <Route path="/government/dashboard" element={<GovernmentDashboard />} />
            <Route path="/government/budget" element={<Budget />} />
            <Route path="/government/emergency-requests" element={<EmergencyRequests />} />
            <Route path="/government/extra-funds" element={<ExtraFunds />} />
            
            {/* Finance routes */}
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
            <Route path="/finance/donations" element={<Donations />} />
            <Route path="/finance/booked-tours" element={<BookedTours />} />
            <Route path="/finance/request-management" element={<RequestManagement />} />
            <Route path="/finance/emergency-requests" element={<FinanceEmergencyRequests />} />
            <Route path="/finance/emergency-requests/new" element={<EmergencyRequestForm />} />
            <Route path="/finance/extra-funds" element={<FinanceExtraFunds />} />
            <Route path="/finance/extra-funds/new" element={<ExtraFundsForm />} />
            <Route path="/finance/service-providers" element={<ServiceProviders />} />
            <Route path="/finance/budget-creation" element={<BudgetCreation />} />
            
            {/* Auditor routes */}
            <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
            <Route path="/auditor/transactions" element={<Transactions />} />
            <Route path="/auditor/financial-reports" element={<FinancialReports />} />
            <Route path="/auditor/invoices" element={<InvoiceView />} />
            

            {/* Visitors routes */}
            <Route path="/visitors/login" element={<Visitors />} />
            <Route path="/visitors/Register" element={<Visitorregister />} />
            <Route path="/visitors/dashboard" element={<Visitorsdashboard />} />
          </Routes>

        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
