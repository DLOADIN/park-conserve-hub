import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface BudgetData {
  id: string;
  title: string;
  fiscalYear: string;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date | string;
  items: BudgetItem[];
}

const BudgetCreation = () => {
  const [activeTab, setActiveTab] = useState('existing');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', category: '', description: '', amount: 0 },
  ]);
  const [existingBudgets, setExistingBudgets] = useState<BudgetData[]>([]);
  const [pendingBudgets, setPendingBudgets] = useState<BudgetData[]>([]);
  const [approvedBudgets, setApprovedBudgets] = useState<BudgetData[]>([]);
  const [rejectedBudgets, setRejectedBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState({ existing: true, pending: true, approved: true, rejected: true });

  // Fetch budgets for each tab
  useEffect(() => {
    const fetchBudgets = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<BudgetData[]>>, key: keyof typeof loading) => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${key} budgets`);
        }
        const data = await response.json();
        const budgets = data.map((budget: BudgetData) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
        }));
        setter(budgets);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to load ${key} budgets`,
          variant: 'destructive',
        });
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    };

    fetchBudgets('http://localhost:5000/api/finance/budgets', setExistingBudgets, 'existing');
    fetchBudgets('http://localhost:5000/api/finance/budgets/pending', setPendingBudgets, 'pending');
    fetchBudgets('http://localhost:5000/api/finance/budgets/approved', setApprovedBudgets, 'approved');
    fetchBudgets('http://localhost:5000/api/finance/budgets/rejected', setRejectedBudgets, 'rejected');
  }, []);

  const addNewBudgetItem = () => {
    setBudgetItems([
      ...budgetItems,
      { id: `${budgetItems.length + 1}`, category: '', description: '', amount: 0 },
    ]);
  };

  const removeBudgetItem = (idToRemove: string) => {
    if (budgetItems.length === 1) {
      toast({
        title: 'Cannot remove item',
        description: 'A budget must have at least one item',
        variant: 'destructive',
      });
      return;
    }
    setBudgetItems(budgetItems.filter(item => item.id !== idToRemove));
  };

  const updateBudgetItem = (id: string, field: string, value: string | number) => {
    setBudgetItems(
      budgetItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getTotalAmount = () => {
    return budgetItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const handleSaveDraft = async () => {
    if (!budgetTitle || !fiscalYear) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the budget title and fiscal year',
        variant: 'destructive',
      });
      return;
    }

    const emptyItems = budgetItems.filter(item => !item.category || !item.description || item.amount <= 0);
    if (emptyItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all budget items with valid amounts',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: budgetTitle,
          fiscalYear,
          items: budgetItems,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save draft');
      }

      toast({
        title: 'Budget Saved',
        description: `Draft budget "${budgetTitle}" saved successfully`,
      });
      setBudgetTitle('');
      setFiscalYear('');
      setBudgetItems([{ id: '1', category: '', description: '', amount: 0 }]);
      setActiveTab('existing');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save budget draft',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitBudget = async () => {
    if (!budgetTitle || !fiscalYear) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the budget title and fiscal year',
        variant: 'destructive',
      });
      return;
    }

    const emptyItems = budgetItems.filter(item => !item.category || !item.description || item.amount <= 0);
    if (emptyItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all budget items with valid amounts',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: budgetTitle,
          fiscalYear,
          items: budgetItems,
          status: 'submitted',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit budget');
      }

      toast({
        title: 'Budget Submitted',
        description: `Budget "${budgetTitle}" submitted for approval`,
      });
      setBudgetTitle('');
      setFiscalYear('');
      setBudgetItems([{ id: '1', category: '', description: '', amount: 0 }]);
      setActiveTab('pending'); // Switch to pending tab after submission
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit budget',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: BudgetData['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100';
    }
  };

  const renderBudgetList = (budgets: BudgetData[], tabName: string) => (
    <div className="grid gap-6">
      {loading[tabName as keyof typeof loading] ? (
        <p>Loading {tabName} budgets...</p>
      ) : budgets.length === 0 ? (
        <p>No {tabName} budgets found.</p>
      ) : (
        <div id="budgets-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.title}</TableCell>
                  <TableCell>{budget.fiscalYear}</TableCell>
                  <TableCell>${budget.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(budget.status)}>
                      {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {budget.createdAt instanceof Date 
                      ? budget.createdAt.toLocaleDateString() 
                      : new Date(budget.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="no-print">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('new')}>
                        Create Similar
                      </Button>
                      {budget.status === 'draft' && (
                        <Button size="sm">
                          Continue Editing
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Budget Creation"
            subtitle="Create and manage park budgets"
          />
          
          <main className="p-6">
            <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="existing">Existing Budgets</TabsTrigger>
                  <TabsTrigger value="pending">Pending Budgets</TabsTrigger>
                  <TabsTrigger value="approved">Approved Budgets</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected Budgets</TabsTrigger>
                  <TabsTrigger value="new">Create New Budget</TabsTrigger>
                </TabsList>
                <PrintDownloadTable
                  tableId="budgets-table"
                  title="Budgets Report"
                  filename="budgets_report"
                />
              </div>
              
              <TabsContent value="existing">
                {renderBudgetList(existingBudgets, 'existing')}
              </TabsContent>
              
              <TabsContent value="pending">
                {renderBudgetList(pendingBudgets, 'pending')}
              </TabsContent>
              
              <TabsContent value="approved">
                {renderBudgetList(approvedBudgets, 'approved')}
              </TabsContent>
              
              <TabsContent value="rejected">
                {renderBudgetList(rejectedBudgets, 'rejected')}
              </TabsContent>
              
              <TabsContent value="new">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Budget</CardTitle>
                    <CardDescription>
                      Define the details and line items for a new park budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget-title">Budget Title</Label>
                        <Input 
                          id="budget-title" 
                          placeholder="e.g. Annual Park Budget 2024"
                          value={budgetTitle}
                          onChange={(e) => setBudgetTitle(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fiscal-year">Fiscal Year</Label>
                        <Input 
                          id="fiscal-year" 
                          placeholder="e.g. 2024-2025" 
                          value={fiscalYear}
                          onChange={(e) => setFiscalYear(e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Budget Items</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={addNewBudgetItem}
                          className="flex items-center gap-1"
                        >
                          <PlusCircle size={16} />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {budgetItems.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-md">
                            <div className="col-span-12 md:col-span-3 space-y-2">
                              <Label htmlFor={`category-${item.id}`}>Category</Label>
                              <Input 
                                id={`category-${item.id}`} 
                                placeholder="e.g. Staff Salaries"
                                value={item.category}
                                onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                              />
                            </div>
                            <div className="col-span-12 md:col-span-5 space-y-2">
                              <Label htmlFor={`description-${item.id}`}>Description</Label>
                              <Input 
                                id={`description-${item.id}`} 
                                placeholder="Brief description of this budget item"
                                value={item.description}
                                onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-span-10 md:col-span-3 space-y-2">
                              <Label htmlFor={`amount-${item.id}`}>Amount ($)</Label>
                              <Input 
                                id={`amount-${item.id}`} 
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={item.amount || ''}
                                onChange={(e) => updateBudgetItem(item.id, 'amount', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2 md:col-span-1 flex items-end justify-end h-full pb-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeBudgetItem(item.id)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-6">
                        <div className="bg-gray-100 px-6 py-3 rounded-md">
                          <span className="text-gray-700">Total: </span>
                          <span className="font-bold text-lg">${getTotalAmount().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save as Draft
                    </Button>
                    <Button onClick={handleSubmitBudget}>Submit Budget</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BudgetCreation;