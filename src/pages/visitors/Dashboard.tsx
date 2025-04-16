import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@/components/ui/sidebar';
import { LogOut, User, LayoutDashboard, DollarSign, Calendar, ClipboardCheck } from 'lucide-react';

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

const VisitorsDashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [visitorName, setVisitorName] = useState<string>('');
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

        // Fetch visitor profile for name
        const profileResponse = await axios.get('http://localhost:5000/api/visitor/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisitorName(`${profileResponse.data.user.firstName} ${profileResponse.data.user.lastName}`);
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-conservation-600">Park Pro</div>
        <div className="text-lg text-gray-700">{visitorName || 'Loading...'}</div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-1000"
        >
          <LogOut className="w-5 h-5 mr-2 text-red-600" />
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Donations Table */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Donations</h2>
            {donations.length === 0 ? (
              <p className="text-gray-600">No donations found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.parkName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donationType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${donation.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.message || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tours Table */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Booked Tours</h2>
            {tours.length === 0 ? (
              <p className="text-gray-600">No tours booked.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.parkName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.tourName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.guests}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tour.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Service Applications</h2>
            {services.length === 0 ? (
              <p className="text-gray-600">No service applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.companyType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.providedService || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.taxId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.status || 'Pending'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsDashboard;