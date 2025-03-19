
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowUpRight, ArrowDownRight, DollarSign, Landmark, FileText, BadgePercent, PieChart as PieChartIcon, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for charts
const yearlyBudgetData = [
  { name: 'Jan', allocated: 125000, spent: 95000 },
  { name: 'Feb', allocated: 125000, spent: 110000 },
  { name: 'Mar', allocated: 125000, spent: 108000 },
  { name: 'Apr', allocated: 125000, spent: 118000 },
  { name: 'May', allocated: 125000, spent: 122000 },
  { name: 'Jun', allocated: 125000, spent: 124000 },
  { name: 'Jul', allocated: 125000, spent: 116000 },
  { name: 'Aug', allocated: 125000, spent: 119000 },
  { name: 'Sep', allocated: 125000, spent: 123000 },
  { name: 'Oct', allocated: 125000, spent: 90000 },
  { name: 'Nov', allocated: 125000, spent: 0 },
  { name: 'Dec', allocated: 125000, spent: 0 },
];

const parkAllocationData = [
  { name: 'Yellowstone', budget: 450000, used: 380000 },
  { name: 'Yosemite', budget: 380000, used: 290000 },
  { name: 'Grand Canyon', budget: 420000, used: 350000 },
  { name: 'Zion', budget: 320000, used: 240000 },
  { name: 'Acadia', budget: 280000, used: 190000 },
  { name: 'Rocky Mountain', budget: 310000, used: 250000 },
];

const categoryAllocationData = [
  { name: 'Staff Salaries', value: 35 },
  { name: 'Maintenance', value: 25 },
  { name: 'Conservation', value: 20 },
  { name: 'Visitor Services', value: 12 },
  { name: 'Education', value: 8 },
];

const upcomingPayments = [
  { id: 1, park: 'Yellowstone', amount: 75000, date: '2023-11-15', category: 'Quarterly Funding' },
  { id: 2, park: 'Yosemite', amount: 65000, date: '2023-11-18', category: 'Quarterly Funding' },
  { id: 3, park: 'Grand Canyon', amount: 70000, date: '2023-11-20', category: 'Quarterly Funding' },
  { id: 4, park: 'All Parks', amount: 120000, date: '2023-11-25', category: 'Conservation Initiative' },
];

const Budget = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const totalBudget = 1500000;
  const spentBudget = 1005000;
  const remainingBudget = totalBudget - spentBudget;
  const budgetProgress = (spentBudget / totalBudget) * 100;
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Budget Management"
            subtitle="Overview and management of conservation budgets"
          />
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-sm">Total Budget</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">${totalBudget.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Fiscal Year 2023</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">Spent</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">${spentBudget.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">67% of total budget</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Remaining</span>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">${remainingBudget.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">33% of total budget</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Landmark className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-sm">Parks Funded</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">6</div>
                  <p className="text-sm text-gray-500">National Parks</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="overview" className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="parks">Parks Allocation</TabsTrigger>
                <TabsTrigger value="payments">Upcoming Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0 space-y-6">
                <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Yearly Budget Overview</CardTitle>
                        <CardDescription>Monthly budget allocation and spending</CardDescription>
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
                        <AreaChart
                          data={yearlyBudgetData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Area type="monotone" dataKey="allocated" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name="Allocated" />
                          <Area type="monotone" dataKey="spent" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} name="Spent" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <CardHeader>
                      <CardTitle>Budget Utilization</CardTitle>
                      <CardDescription>Current fiscal year progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Overall Budget</span>
                            <span className="text-sm text-gray-500">{budgetProgress.toFixed(0)}% Used</span>
                          </div>
                          <Progress value={budgetProgress} className="h-3" />
                        </div>
                        
                        {categoryAllocationData.map((category, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">{category.name}</span>
                              <span className="text-sm text-gray-500">{category.value}%</span>
                            </div>
                            <Progress value={category.value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <CardHeader>
                      <CardTitle>Recent Budget Updates</CardTitle>
                      <CardDescription>Latest budget adjustments and allocations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-100 p-2 rounded-full">
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Budget Increase Approved</h4>
                            <p className="text-sm text-gray-500 mb-2">Additional $200,000 approved for wildlife conservation initiatives across all parks.</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <FileText className="h-3 w-3" />
                              <span>Oct 28, 2023</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BadgePercent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Quarterly Allocation Complete</h4>
                            <p className="text-sm text-gray-500 mb-2">Q4 budget allocations have been processed for all national parks.</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <FileText className="h-3 w-3" />
                              <span>Oct 15, 2023</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <PieChartIcon className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Budget Reallocation</h4>
                            <p className="text-sm text-gray-500 mb-2">$75,000 reallocated from administrative to conservation projects due to cost savings.</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <FileText className="h-3 w-3" />
                              <span>Oct 5, 2023</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="parks" className="mt-0">
                <Card className="shadow-sm animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Parks Budget Allocation</CardTitle>
                        <CardDescription>Budget allocation and usage by national park</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={parkAllocationData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="budget" stackId="a" fill="#8884d8" name="Total Budget" />
                          <Bar dataKey="used" stackId="a" fill="#82ca9d" name="Used" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      {parkAllocationData.map((park, index) => (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{park.name} National Park</span>
                            <span className="text-sm text-gray-500">${park.used.toLocaleString()} of ${park.budget.toLocaleString()}</span>
                          </div>
                          <Progress value={(park.used / park.budget) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payments" className="mt-0">
                <Card className="shadow-sm animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Upcoming Budget Payments</CardTitle>
                        <CardDescription>Scheduled fund transfers to parks</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        Process Payment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Landmark className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{payment.park}</h4>
                              <p className="text-sm text-gray-500">{payment.category}</p>
                              <p className="text-xs text-gray-400">Scheduled for {payment.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold">${payment.amount.toLocaleString()}</span>
                            <Button variant="ghost" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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

export default Budget;
