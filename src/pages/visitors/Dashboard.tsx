import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  SidebarTrigger,

} from '@/components/ui/sidebar';
import { LogOut, User, LayoutDashboard, Users, Settings, FileText, DollarSign, PiggyBank, Calendar, Clock, CreditCard, Landmark, AlertTriangle, FileBarChart, Activity, ClipboardCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';


interface Donation {
  id: number;
  donationType: string;
  amount: number;
  parkName: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface Tour {
  id: number;
  parkName: string;
  tourName: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  specialRequests: string;
  createdAt: string;
}

interface Service {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyType: string;
  providedService: string;
  companyName: string;
  taxId: string;
  status: string | null;
  createdAt: string;
}

const Visitorsdashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/visitor/login');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/visitor/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDonations(response.data.donations);
        setTours(response.data.tours);
        setServices(response.data.services);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/visitor/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/Visitors');
  };

  return (
    <>  
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Visitor Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Donations Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Donations</h2>
          {donations.length === 0 ? (
            <p>No donations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Park</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b">
                      <td className="p-3">{donation.parkName}</td>
                      <td className="p-3">{donation.donationType}</td>
                      <td className="p-3">${donation.amount.toFixed(2)}</td>
                      <td className="p-3">{donation.createdAt}</td>
                      <td className="p-3">{donation.message || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tours Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Booked Tours</h2>
          {tours.length === 0 ? (
            <p>No tours booked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Park</th>
                    <th className="p-3 text-left">Tour</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Guests</th>
                    <th className="p-3 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour) => (
                    <tr key={tour.id} className="border-b">
                      <td className="p-3">{tour.parkName}</td>
                      <td className="p-3">{tour.tourName}</td>
                      <td className="p-3">{tour.date}</td>
                      <td className="p-3">{tour.time}</td>
                      <td className="p-3">{tour.guests}</td>
                      <td className="p-3">${tour.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Services Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Service Applications</h2>
          {services.length === 0 ? (
            <p>No service applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Company Name</th>
                    <th className="p-3 text-left">Company Type</th>
                    <th className="p-3 text-left">Service</th>
                    <th className="p-3 text-left">Tax ID</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="p-3">{service.companyName}</td>
                      <td className="p-3">{service.companyType}</td>
                      <td className="p-3">{service.providedService || 'N/A'}</td>
                      <td className="p-3">{service.taxId}</td>
                      <td className="p-3">{service.status || 'Pending'}</td>
                      <td className="p-3">{service.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Visitorsdashboard;