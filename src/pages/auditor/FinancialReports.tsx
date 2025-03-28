
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CircleX, CircleCheckBig } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  FileBarChart,
  BarChart2,
  Activity,
  Landmark,
  PiggyBank,
  AlertTriangle
} from 'lucide-react';

// Sample data for charts
const revenueData = [
  { month: 'Jan', donations: 125000, tourBookings: 85000, grants: 200000, total: 410000 },
  { month: 'Feb', donations: 115000, tourBookings: 92000, grants: 200000, total: 407000 },
  { month: 'Mar', donations: 140000, tourBookings: 105000, grants: 200000, total: 445000 },
  { month: 'Apr', donations: 130000, tourBookings: 110000, grants: 200000, total: 440000 },
  { month: 'May', donations: 145000, tourBookings: 125000, grants: 200000, total: 470000 },
  { month: 'Jun', donations: 160000, tourBookings: 140000, grants: 200000, total: 500000 },
  { month: 'Jul', donations: 175000, tourBookings: 160000, grants: 200000, total: 535000 },
  { month: 'Aug', donations: 185000, tourBookings: 170000, grants: 200000, total: 555000 },
  { month: 'Sep', donations: 165000, tourBookings: 150000, grants: 200000, total: 515000 },
  { month: 'Oct', donations: 155000, tourBookings: 130000, grants: 200000, total: 485000 },
  { month: 'Nov', donations: 0, tourBookings: 0, grants: 0, total: 0 },
  { month: 'Dec', donations: 0, tourBookings: 0, grants: 0, total: 0 },
];

const expenseData = [
  { month: 'Jan', operations: 200000, staff: 150000, maintenance: 50000, total: 400000 },
  { month: 'Feb', operations: 210000, staff: 150000, maintenance: 45000, total: 405000 },
  { month: 'Mar', operations: 205000, staff: 150000, maintenance: 55000, total: 410000 },
  { month: 'Apr', operations: 195000, staff: 150000, maintenance: 60000, total: 405000 },
  { month: 'May', operations: 200000, staff: 150000, maintenance: 65000, total: 415000 },
  { month: 'Jun', operations: 215000, staff: 150000, maintenance: 70000, total: 435000 },
  { month: 'Jul', operations: 220000, staff: 155000, maintenance: 75000, total: 450000 },
  { month: 'Aug', operations: 225000, staff: 155000, maintenance: 80000, total: 460000 },
  { month: 'Sep', operations: 215000, staff: 155000, maintenance: 70000, total: 440000 },
  { month: 'Oct', operations: 205000, staff: 155000, maintenance: 60000, total: 420000 },
  { month: 'Nov', operations: 0, staff: 0, maintenance: 0, total: 0 },
  { month: 'Dec', operations: 0, staff: 0, maintenance: 0, total: 0 },
];

const parkBudgetData = [
  { name: 'Yellowstone', budget: 1200000, spent: 980000 },
  { name: 'Grand Canyon', budget: 950000, spent: 850000 },
  { name: 'Yosemite', budget: 1050000, spent: 920000 },
  { name: 'Zion', budget: 750000, spent: 680000 },
  { name: 'Acadia', budget: 650000, spent: 590000 },
];

const emergencyFundsData = [
  { month: 'Jan', approved: 25000, rejected: 15000 },
  { month: 'Feb', approved: 30000, rejected: 10000 },
  { month: 'Mar', approved: 45000, rejected: 20000 },
  { month: 'Apr', approved: 35000, rejected: 15000 },
  { month: 'May', approved: 40000, rejected: 25000 },
  { month: 'Jun', approved: 55000, rejected: 20000 },
  { month: 'Jul', approved: 60000, rejected: 30000 },
  { month: 'Aug', approved: 50000, rejected: 25000 },
  { month: 'Sep', approved: 45000, rejected: 20000 },
  { month: 'Oct', approved: 35000, rejected: 15000 },
];

const extraFundsData = [
  { month: 'Jan', approved: 50000, rejected: 25000 },
  { month: 'Feb', approved: 60000, rejected: 30000 },
  { month: 'Mar', approved: 75000, rejected: 40000 },
  { month: 'Apr', approved: 65000, rejected: 35000 },
  { month: 'May', approved: 70000, rejected: 45000 },
  { month: 'Jun', approved: 85000, rejected: 40000 },
  { month: 'Jul', approved: 95000, rejected: 50000 },
  { month: 'Aug', approved: 80000, rejected: 45000 },
  { month: 'Sep', approved: 75000, rejected: 40000 },
  { month: 'Oct', approved: 65000, rejected: 35000 },
];

const parkRequestsData = [
  { name: 'Yellowstone', approved: 85000, denied: 35000 },
  { name: 'Grand Canyon', approved: 65000, denied: 25000 },
  { name: 'Yosemite', approved: 75000, denied: 30000 },
  { name: 'Zion', approved: 55000, denied: 20000 },
  { name: 'Acadia', approved: 45000, denied: 15000 },
];

const transactionTypesData = [
  { name: 'Tour Bookings', value: 1250000 },
  { name: 'Donations', value: 1500000 },
  { name: 'Grant Funds', value: 2000000 },
  { name: 'Emergency Funds', value: 450000 },
  { name: 'Extra Funds', value: 750000 },
];

// Monthly summary of financial metrics
const monthlyMetricsData = [
  { month: 'Jan', revenue: 410000, expenses: 400000, netIncome: 10000 },
  { month: 'Feb', revenue: 407000, expenses: 405000, netIncome: 2000 },
  { month: 'Mar', revenue: 445000, expenses: 410000, netIncome: 35000 },
  { month: 'Apr', revenue: 440000, expenses: 405000, netIncome: 35000 },
  { month: 'May', revenue: 470000, expenses: 415000, netIncome: 55000 },
  { month: 'Jun', revenue: 500000, expenses: 435000, netIncome: 65000 },
  { month: 'Jul', revenue: 535000, expenses: 450000, netIncome: 85000 },
  { month: 'Aug', revenue: 555000, expenses: 460000, netIncome: 95000 },
  { month: 'Sep', revenue: 515000, expenses: 440000, netIncome: 75000 },
  { month: 'Oct', revenue: 485000, expenses: 420000, netIncome: 65000 },
];

// Sample transaction data for recent records
const recentTransactions = [
  { id: 'T1001', date: '2023-10-28', description: 'Staff Salary Payment', amount: -150000, type: 'Expense', category: 'Staff', park: 'All Parks' },
  { id: 'T1002', date: '2023-10-27', description: 'Donation - Corporate', amount: 50000, type: 'Income', category: 'Donation', park: 'Yellowstone' },
  { id: 'T1003', date: '2023-10-26', description: 'Emergency Repair Funding', amount: 35000, type: 'Expense', category: 'Emergency', park: 'Grand Canyon' },
  { id: 'T1004', date: '2023-10-25', description: 'Tour Booking Revenue', amount: 75000, type: 'Income', category: 'Tours', park: 'Yosemite' },
  { id: 'T1005', date: '2023-10-24', description: 'Equipment Purchase', amount: -45000, type: 'Expense', category: 'Operations', park: 'Zion' },
  { id: 'T1006', date: '2023-10-23', description: 'Government Grant', amount: 200000, type: 'Income', category: 'Grant', park: 'All Parks' },
  { id: 'T1007', date: '2023-10-22', description: 'Trail Maintenance', amount: -65000, type: 'Expense', category: 'Maintenance', park: 'Acadia' },
  { id: 'T1008', date: '2023-10-21', description: 'Visitor Center Renovation', amount: -95000, type: 'Expense', category: 'Infrastructure', park: 'Yellowstone' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinancialReports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Financial Reports"
            subtitle="Comprehensive financial reporting and analytics"
          />
          
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <div>
                  <Select defaultValue={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-6">
                <TabsTrigger value="dashboard">Overview</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
                <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
                <TabsTrigger value="requests">Funding Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Revenue</p>
                          <p className="text-2xl font-bold">$4,762,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Expenses</p>
                          <p className="text-2xl font-bold">$4,240,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Net Income</p>
                          <p className="text-2xl font-bold">$522,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue vs. Expenses</CardTitle>
                      <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={monthlyMetricsData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              name="Revenue" 
                              stackId="1"
                              stroke="#8884d8" 
                              fill="#8884d8"
                              fillOpacity={0.6}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="expenses" 
                              name="Expenses" 
                              stackId="2"
                              stroke="#82ca9d" 
                              fill="#82ca9d"
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Balance</CardTitle>
                      <CardDescription>Net income trend over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={monthlyMetricsData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar 
                              dataKey="netIncome" 
                              name="Net Income" 
                              fill="#22c55e"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Park</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.park}</TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>
                              <Badge className={transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(transaction.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      <Button variant="outline" size="sm">Previous</Button>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Next</Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="revenue">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <PiggyBank className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Donations</p>
                          <p className="text-2xl font-bold">$1,500,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tour Bookings</p>
                          <p className="text-2xl font-bold">$1,250,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-teal-100 p-2 rounded-full">
                          <Landmark className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Government Grants</p>
                          <p className="text-2xl font-bold">$2,000,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Breakdown</CardTitle>
                      <CardDescription>Revenue sources by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={transactionTypesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {transactionTypesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Revenue Trend</CardTitle>
                      <CardDescription>Revenue by source per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={revenueData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="donations" name="Donations" stackId="a" fill="#8884d8" />
                            <Bar dataKey="tourBookings" name="Tour Bookings" stackId="a" fill="#82ca9d" />
                            <Bar dataKey="grants" name="Grants" stackId="a" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Park</CardTitle>
                    <CardDescription>Distribution of revenue across parks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={parkBudgetData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="budget" name="Budget Allocated" fill="#8884d8" />
                          <Bar dataKey="spent" name="Actual Revenue" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="expenses">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Operations</p>
                          <p className="text-2xl font-bold">$2,075,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Staff Salaries</p>
                          <p className="text-2xl font-bold">$1,515,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-cyan-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Maintenance</p>
                          <p className="text-2xl font-bold">$650,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Expense Breakdown</CardTitle>
                      <CardDescription>Distribution by expense category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={expenseData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="operations" 
                              stackId="1"
                              name="Operations" 
                              stroke="#8884d8" 
                              fill="#8884d8" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="staff" 
                              stackId="1"
                              name="Staff" 
                              stroke="#82ca9d" 
                              fill="#82ca9d" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="maintenance" 
                              stackId="1"
                              name="Maintenance" 
                              stroke="#ffc658" 
                              fill="#ffc658" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget vs. Actual Spending</CardTitle>
                      <CardDescription>Comparison by park</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={parkBudgetData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="budget" name="Budget Allocated" fill="#8884d8" />
                            <Bar dataKey="spent" name="Actual Spent" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency & Extra Funds</CardTitle>
                    <CardDescription>Special funding expenditure over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[...emergencyFundsData, ...extraFundsData.map(item => ({ month: item.month, emergencyApproved: item.approved, emergencyRejected: item.rejected, extraApproved: extraFundsData.find(x => x.month === item.month)?.approved || 0, extraRejected: extraFundsData.find(x => x.month === item.month)?.rejected || 0 }))]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Line type="monotone" dataKey="approved" name="Emergency Approved" stroke="#8884d8" />
                          <Line type="monotone" dataKey="rejected" name="Emergency Rejected" stroke="#ff7300" />
                          <Line type="monotone" dataKey="extraApproved" name="Extra Funds Approved" stroke="#0088fe" />
                          <Line type="monotone" dataKey="extraRejected" name="Extra Funds Rejected" stroke="#ff0000" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requests">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CircleCheckBig className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Approved Requests</p>
                          <p className="text-2xl font-bold">325</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <CircleX className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Declined Requests</p>
                          <p className="text-2xl font-bold">125</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Emergency Requests</p>
                          <p className="text-2xl font-bold">85</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Requests by Park</CardTitle>
                      <CardDescription>Distribution of approved and denied requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={parkRequestsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="approved" name="Approved" fill="#4ade80" />
                            <Bar dataKey="denied" name="Denied" fill="#f87171" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Emergency Fund Requests</CardTitle>
                      <CardDescription>Monthly emergency funding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={emergencyFundsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="approved" name="Approved" stroke="#4ade80" strokeWidth={2} />
                            <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#f87171" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Extra Funds Analysis</CardTitle>
                    <CardDescription>Trends in extra funding requests and approvals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={extraFundsData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="approved" 
                            name="Approved" 
                            stroke="#4ade80" 
                            fill="#4ade80"
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="rejected" 
                            name="Rejected" 
                            stroke="#f87171" 
                            fill="#f87171"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
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

export default FinancialReports;
