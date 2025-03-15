
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  ChevronLeft, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  User,
  DollarSign,
  FileText,
  BarChart,
  Users,
  Clock,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'admin' | 'parkstaff' | 'government' | 'finance' | 'auditor';
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { 
    title: 'Dashboard', 
    icon: Home, 
    href: '/dashboard', 
    roles: ['admin', 'parkstaff', 'government', 'finance', 'auditor'] 
  },
  { 
    title: 'User Management', 
    icon: Users, 
    href: '/dashboard/users', 
    roles: ['admin'] 
  },
  { 
    title: 'Fund Requests', 
    icon: DollarSign, 
    href: '/dashboard/fund-requests', 
    roles: ['parkstaff', 'government', 'finance'] 
  },
  { 
    title: 'Budgets', 
    icon: BarChart, 
    href: '/dashboard/budgets', 
    roles: ['government', 'finance', 'auditor'] 
  },
  { 
    title: 'Bookings', 
    icon: Calendar, 
    href: '/dashboard/bookings', 
    roles: ['admin', 'parkstaff', 'finance', 'auditor'] 
  },
  { 
    title: 'Donations', 
    icon: DollarSign, 
    href: '/dashboard/donations', 
    roles: ['admin', 'finance', 'auditor'] 
  },
  { 
    title: 'Expenses', 
    icon: FileText, 
    href: '/dashboard/expenses', 
    roles: ['finance', 'auditor'] 
  },
  { 
    title: 'Transaction History', 
    icon: Clock, 
    href: '/dashboard/transactions', 
    roles: ['finance', 'auditor'] 
  },
  { 
    title: 'Settings', 
    icon: Settings, 
    href: '/dashboard/settings', 
    roles: ['admin', 'parkstaff', 'government', 'finance', 'auditor'] 
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // Redirect if user role doesn't match the required role
      if (user.role !== role) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this dashboard.",
          variant: "destructive",
        });
        navigate(`/dashboard/${user.role}`);
      }
    } else {
      // Redirect to login if not logged in
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [role, navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-conservation-50">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-conservation-100 transition-all duration-300 z-20 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-conservation-100">
          {isSidebarOpen ? (
            <div className="flex items-center">
              <img
                src="/lovable-uploads/24180fbb-b0a4-45f4-8f3b-9e59d0deb0de.png"
                alt="Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 font-semibold text-conservation-900">Park Hub</span>
            </div>
          ) : (
            <img
              src="/lovable-uploads/24180fbb-b0a4-45f4-8f3b-9e59d0deb0de.png"
              alt="Logo"
              className="h-8 w-8 mx-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-conservation-700 hover:text-conservation-900"
          >
            {isSidebarOpen ? <ChevronLeft /> : <Menu />}
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems
            .filter(item => item.roles.includes(role))
            .map(item => (
              <Button
                key={item.title}
                variant="ghost"
                className={`w-full justify-start text-conservation-700 hover:text-conservation-900 hover:bg-conservation-50 ${
                  location.pathname === item.href ? 'bg-conservation-50 text-conservation-900' : ''
                }`}
                onClick={() => navigate(item.href)}
              >
                <item.icon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                {isSidebarOpen && <span>{item.title}</span>}
              </Button>
            ))}
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-conservation-100 h-16 fixed right-0 left-auto w-full z-10 flex items-center px-6">
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-conservation-900">{title}</h1>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-conservation-700 hover:text-conservation-900"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-conservation-700 hover:text-conservation-900"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {currentUser?.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/dashboard/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="pt-24 px-6 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
