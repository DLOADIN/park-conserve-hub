
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { LogOut, User, LayoutDashboard, Users, FileText, DollarSign, PiggyBank, Calendar, Clock, CreditCard, Landmark, AlertTriangle, FileBarChart, Activity } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children, active }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className={active ? 'bg-sidebar-accent text-primary' : ''}>
        <Link to={to} className="flex items-center gap-2">
          <Icon size={18} />
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const role = user.role;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex flex-col items-center p-4 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">EP</span>
          </div>
          <span className="text-xl font-bold text-primary">EcoPark</span>
        </Link>
        <div className="mt-4 w-full">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarLink to="/dashboard" icon={LayoutDashboard} active={isActive('/dashboard')}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/profile" icon={User} active={isActive('/profile')}>
                Profile
              </SidebarLink>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/admin/users" icon={Users} active={isActive('/admin/users')}>
                  User Management
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'park-staff' && (
          <SidebarGroup>
            <SidebarGroupLabel>Park Staff</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/park-staff/fund-requests" icon={FileText} active={isActive('/park-staff/fund-requests')}>
                  Fund Requests
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'government' && (
          <SidebarGroup>
            <SidebarGroupLabel>Government</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/government/budget" icon={DollarSign} active={isActive('/government/budget')}>
                  Budget
                </SidebarLink>
                <SidebarLink to="/government/emergency-requests" icon={AlertTriangle} active={isActive('/government/emergency-requests')}>
                  Emergency Requests
                </SidebarLink>
                <SidebarLink to="/government/extra-funds" icon={PiggyBank} active={isActive('/government/extra-funds')}>
                  Extra Funds
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'finance' && (
          <SidebarGroup>
            <SidebarGroupLabel>Finance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/finance/budget-suggestion" icon={Landmark} active={isActive('/finance/budget-suggestion')}>
                  Budget Suggestion
                </SidebarLink>
                <SidebarLink to="/finance/donations" icon={PiggyBank} active={isActive('/finance/donations')}>
                  Donations
                </SidebarLink>
                <SidebarLink to="/finance/booked-tours" icon={Calendar} active={isActive('/finance/booked-tours')}>
                  Booked Tours
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'auditor' && (
          <SidebarGroup>
            <SidebarGroupLabel>Auditor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/auditor/transactions" icon={Activity} active={isActive('/auditor/transactions')}>
                  Transactions
                </SidebarLink>
                <SidebarLink to="/auditor/financial-reports" icon={FileBarChart} active={isActive('/auditor/financial-reports')}>
                  Financial Reports
                </SidebarLink>
                <SidebarLink to="/auditor/invoices" icon={FileText} active={isActive('/auditor/invoices')}>
                  Invoices
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 hover:bg-gray-100 transition-colors text-danger-500"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <div className="mt-4 text-center text-xs text-gray-500">
          {user?.firstName} {user?.lastName}
          <div className="text-primary capitalize mt-1">{user?.role.replace('-', ' ')}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
