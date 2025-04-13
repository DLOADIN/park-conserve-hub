import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, PiggyBank, CheckCircle, DollarSign, LucideIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Stat {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down';
}

interface ChartData {
  month?: string;
  status?: string;
  bookings?: number;
  amount?: number;
  count?: number;
}

const GovernmentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<ChartData[]>([]);
  const [tours, setTours] = useState<ChartData[]>([]);
  const [services, setServices] = useState<ChartData[]>([]);
  const [budgets, setBudgets] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [
          donationsResponse,
          toursResponse,
          servicesResponse,
          budgetsResponse,
          approvedBudgetsResponse,
          fundRequestsResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/finance/donations`, { headers }),
          axios.get(`${API_URL}/finance/tours`, { headers }),
          axios.get(`${API_URL}/finance/services`, { headers }),
          axios.get(`${API_URL}/finance/budgets`, { headers }),
          axios.get(`${API_URL}/finance/budgets/approved`, { headers }),
          axios.get(`${API_URL}/finance/fund-requests`, { headers }),
        ]);

        // Process Donations
        const donationsData = donationsResponse.data.reduce((acc: any, curr: any) => {
          const date = new Date(curr.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const existing = acc.find((d: any) => d.month === month);
          if (existing) {
            existing.amount += Number(curr.amount);
          } else {
            acc.push({ month, amount: Number(curr.amount) });
          }
          return acc;
        }, []);
        setDonations(donationsData);

        // Process Tours
        const toursData = toursResponse.data.reduce((acc: any, curr: any) => {
          const date = new Date(curr.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const existing = acc.find((d: any) => d.month === month);
          if (existing) {
            existing.bookings += 1;
            existing.amount += Number(curr.amount);
          } else {
            acc.push({ month, bookings: 1, amount: Number(curr.amount) });
          }
          return acc;
        }, []);
        setTours(toursData);

        // Process Services
        const servicesData = [
          { status: 'Pending', count: servicesResponse.data.filter((s: any) => s.pending).length },
          { status: 'Approved', count: servicesResponse.data.filter((s: any) => s.status === 'approved').length },
          { status: 'Denied', count: servicesResponse.data.filter((s: any) => s.status === 'denied').length },
        ];
        setServices(servicesData);

        // Process Budgets
        const budgetsData = [
          { status: 'Draft', amount: budgetsResponse.data.filter((b: any) => b.status === 'draft').reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0) },
          { status: 'Submitted', amount: budgetsResponse.data.filter((b: any) => b.status === 'submitted').reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0) },
          { status: 'Approved', amount: budgetsResponse.data.filter((b: any) => b.status === 'approved').reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0) },
          { status: 'Rejected', amount: budgetsResponse.data.filter((b: any) => b.status === 'rejected').reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0) },
        ];
        setBudgets(budgetsData);

        // Calculate Stats
        const totalDonations = donationsResponse.data.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
        const totalToursRevenue = toursResponse.data.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const acceptedFundRequests = fundRequestsResponse.data.filter((fr: any) => fr.status === 'approved').reduce((sum: number, fr: any) => sum + Number(fr.amount), 0);
        const approvedBudgets = Array.isArray(approvedBudgetsResponse.data)
        ? approvedBudgetsResponse.data.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0)
        : 0;


        setStats([
          { title: 'Total Donations', value: `$${totalDonations.toLocaleString()}`, icon: PiggyBank, trend: 'up' },
          { title: 'Tours Revenue', value: `$${totalToursRevenue.toLocaleString()}`, icon: Calendar, trend: 'up' },
          { title: 'Accepted Fund ParkStaff Requests', value: `$${acceptedFundRequests.toLocaleString()}`, icon: CheckCircle, trend: 'up' },
          { title: 'Approved Budgets', value: `$${approvedBudgets.toLocaleString()}`, icon: DollarSign, trend: 'up' },
        ]);
      } catch (error: any) {
        if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
          console.error('Error fetching dashboard data:', error);
        }
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Finance Officer Dashboard"
            subtitle="Overview of financial activities and budgets"
          />
          
          <main className="p-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon as LucideIcon}
                  trend={stat.trend}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Donations Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>Donations</CardTitle>
                  <CardDescription>Monthly donation amounts</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="amount" name="Donation Amount ($)" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tours Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle>Booked Tours</CardTitle>
                  <CardDescription>Monthly tour bookings</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Services Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle>Service Applications</CardTitle>
                  <CardDescription>Applications by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={services}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Applications" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Budgets Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle>Budgets Overview</CardTitle>
                  <CardDescription>Total budget amounts by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="amount" name="Budget Amount ($)" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default GovernmentDashboard;