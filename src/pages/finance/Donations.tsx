import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Search, Download, ArrowUpRight, PiggyBank, Calendar, Mail, Printer, FileText, ExternalLink, Heart, Users, Globe, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  campaign?: string;
  park?: string;
  type: 'individual' | 'corporate' | 'foundation' | 'anonymous';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const donationsData = [
  { name: 'Jan', value: 20000 },
  { name: 'Feb', value: 25000 },
  { name: 'Mar', value: 30000 },
  { name: 'Apr', value: 27000 },
  { name: 'May', value: 32000 },
  { name: 'Jun', value: 35000 },
  { name: 'Jul', value: 38000 },
  { name: 'Aug', value: 42000 },
  { name: 'Sep', value: 45000 },
  { name: 'Oct', value: 48000 },
  { name: 'Nov', value: 0 },
  { name: 'Dec', value: 0 },
];

const donationTypeData = [
  { name: 'Individual', value: 65 },
  { name: 'Corporate', value: 20 },
  { name: 'Foundation', value: 10 },
  { name: 'Anonymous', value: 5 },
];

const mockDonations: Donation[] = [
  { 
    id: '1', 
    donorName: 'John Smith', 
    donorEmail: 'john.smith@example.com', 
    amount: 1000, 
    date: '2023-10-25', 
    paymentMethod: 'Credit Card', 
    status: 'completed', 
    campaign: 'Wildlife Conservation',
    park: 'Yellowstone',
    type: 'individual'
  },
  { 
    id: '2', 
    donorName: 'EcoTech Corp', 
    donorEmail: 'donations@ecotech.com', 
    amount: 5000, 
    date: '2023-10-22', 
    paymentMethod: 'Bank Transfer', 
    status: 'completed', 
    campaign: 'Reforestation Project',
    park: 'Yosemite',
    type: 'corporate'
  },
  { 
    id: '3', 
    donorName: 'Sarah Johnson', 
    donorEmail: 'sarah.j@example.com', 
    amount: 250, 
    date: '2023-10-20', 
    paymentMethod: 'PayPal', 
    status: 'completed', 
    campaign: 'Educational Programs',
    park: 'Grand Canyon',
    type: 'individual'
  },
  { 
    id: '4', 
    donorName: 'GreenLife Foundation', 
    donorEmail: 'grants@greenlife.org', 
    amount: 10000, 
    date: '2023-10-18', 
    paymentMethod: 'Bank Transfer', 
    status: 'completed', 
    campaign: 'Wildlife Conservation',
    park: 'Zion',
    type: 'foundation'
  },
  { 
    id: '5', 
    donorName: 'Anonymous Donor', 
    donorEmail: 'anonymous@example.com', 
    amount: 750, 
    date: '2023-10-15', 
    paymentMethod: 'Credit Card', 
    status: 'completed', 
    campaign: 'Trail Maintenance',
    park: 'Acadia',
    type: 'anonymous'
  },
  { 
    id: '6', 
    donorName: 'Michael Thompson', 
    donorEmail: 'michael.t@example.com', 
    amount: 100, 
    date: '2023-10-12', 
    paymentMethod: 'PayPal', 
    status: 'pending', 
    campaign: 'Educational Programs',
    park: 'Yellowstone',
    type: 'individual'
  },
  { 
    id: '7', 
    donorName: 'Earth Solutions Inc', 
    donorEmail: 'community@earthsolutions.com', 
    amount: 7500, 
    date: '2023-10-10', 
    paymentMethod: 'Bank Transfer', 
    status: 'completed', 
    campaign: 'Reforestation Project',
    park: 'Rocky Mountain',
    type: 'corporate'
  },
  { 
    id: '8', 
    donorName: 'Emily Wilson', 
    donorEmail: 'emily.w@example.com', 
    amount: 500, 
    date: '2023-10-05', 
    paymentMethod: 'Credit Card', 
    status: 'failed', 
    campaign: 'Wildlife Conservation',
    park: 'Yellowstone',
    type: 'individual'
  },
];

const Donations = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredDonations = mockDonations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        donation.campaign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        donation.park?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && donation.status === statusFilter;
  });
  
  const totalDonations = mockDonations.reduce((total, donation) => total + donation.amount, 0);
  const donationCount = mockDonations.length;
  const averageDonation = totalDonations / donationCount;
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDonorTypeIcon = (type: string) => {
    switch(type) {
      case 'individual': return <Users className="h-4 w-4" />;
      case 'corporate': return <Landmark className="h-4 w-4" />;
      case 'foundation': return <Globe className="h-4 w-4" />;
      case 'anonymous': return <Heart className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const handleSendThankYou = (id: string) => {
    toast.success("Thank you email sent successfully!");
  };

  const handleGenerateReceipt = (id: string) => {
    toast.success("Receipt generated successfully!");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Donations Management"
            subtitle="Track and manage park donations"
          />
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-green-100">
                        <PiggyBank className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">Total Donations</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">${totalDonations.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Year-to-date</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Total Donors</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{donationCount}</div>
                  <p className="text-sm text-gray-500">From all sources</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Heart className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-sm">Average Donation</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">${averageDonation.toFixed(2)}</div>
                  <p className="text-sm text-gray-500">Per donor</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="donations" className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="donations">Donations List</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="donations" className="mt-0">
                <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Donations</CardTitle>
                        <CardDescription>Manage and track all donations</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative w-full sm:w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search donors..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Donor</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Park</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDonations.map((donation, index) => (
                            <tr 
                              key={donation.id} 
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded-full bg-primary/10">
                                    {getDonorTypeIcon(donation.type)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{donation.donorName}</div>
                                    <div className="text-xs text-gray-500">{donation.donorEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">${donation.amount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{donation.date}</td>
                              <td className="py-3 px-4 text-sm">
                                {donation.campaign || '-'}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {donation.park || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className={getStatusColor(donation.status)}>
                                  <span className="capitalize">{donation.status}</span>
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleSendThankYou(donation.id)}
                                    title="Send Thank You"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleGenerateReceipt(donation.id)}
                                    title="Generate Receipt"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredDonations.length === 0 && (
                        <div className="text-center py-12">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No donations found</h3>
                          <p className="text-gray-500">
                            {searchTerm 
                              ? "No donations match your search criteria" 
                              : "Once donations are received, they will appear here"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Showing {filteredDonations.length} of {mockDonations.length} donations
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Previous</Button>
                      <Button variant="outline" size="sm">Next</Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Monthly Donations</CardTitle>
                        <CardDescription>Donation trends over time</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={donationsData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Donations"
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Donation Sources</CardTitle>
                        <CardDescription>Breakdown by donor type</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donationTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {donationTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm animate-fade-in lg:col-span-2" style={{ animationDelay: '0.6s' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Key Donation Insights</CardTitle>
                        <CardDescription>Summary of donation performance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Most Active Month</h3>
                        </div>
                        <p className="text-2xl font-bold mb-1">September</p>
                        <p className="text-sm text-gray-500">$45,000 in donations</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Landmark className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Top Donor Type</h3>
                        </div>
                        <p className="text-2xl font-bold mb-1">Corporate</p>
                        <p className="text-sm text-gray-500">$22,500 contributed</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Globe className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Popular Campaign</h3>
                        </div>
                        <p className="text-2xl font-bold mb-1">Wildlife Conservation</p>
                        <p className="text-sm text-gray-500">42% of all donations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Donations;
