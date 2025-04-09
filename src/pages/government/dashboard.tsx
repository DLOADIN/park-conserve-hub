import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, PiggyBank, LogIn, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const GovernmentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tourBookings, setTourBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [loginMetrics, setLoginMetrics] = useState([]);
  const [stats, setStats] = useState([]);

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
        const [toursResponse, donationsResponse, loginsResponse, metricsResponse, statsResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/tour-bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/donations`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/recent-logins`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/login-metrics`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        setTourBookings(toursResponse.data.tour_bookings);
        setDonations(donationsResponse.data.donations);
        setRecentLogins(loginsResponse.data.recent_logins.slice(0, 5));
        setLoginMetrics(metricsResponse.data.login_metrics);
        setStats(statsResponse.data.stats);
      } catch (error) {
        if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const role = user.role;
  const roleName = role.replace('-', ' ');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title={`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Dashboard`}
            subtitle="Park management and admin activity overview"
          />
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon === 'Calendar' ? Calendar : stat.icon === 'PiggyBank' ? PiggyBank : stat.icon === 'LogIn' ? LogIn : Users}
                  trend={stat.trend}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            {/* Charts and Logins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Tour Bookings */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>Park Tour Bookings</CardTitle>
                  <CardDescription>Monthly tour bookings</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tourBookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Donations */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle>Park Donations</CardTitle>
                  <CardDescription>Monthly donation amounts</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" name="Donation Amount ($)" fill="#22c55e" />
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