import React, { useState } from 'react';
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
  createdAt: Date;
  items: BudgetItem[];
}

// Sample data
const sampleBudgets: BudgetData[] = [
  {
    id: '1',
    title: 'Annual Park Budget 2023',
    fiscalYear: '2023-2024',
    totalAmount: 1250000,
    status: 'approved',
    createdAt: new Date('2023-03-15'),
    items: [
      { id: '1-1', category: 'Staff Salaries', description: 'Annual salaries for 25 staff members', amount: 750000 },
      { id: '1-2', category: 'Maintenance', description: 'Park facilities maintenance', amount: 200000 },
      { id: '1-3', category: 'Conservation', description: 'Wildlife conservation programs', amount: 150000 },
      { id: '1-4', category: 'Equipment', description: 'New equipment purchases', amount: 100000 },
      { id: '1-5', category: 'Miscellaneous', description: 'Unforeseen expenses', amount: 50000 },
    ],
  },
  {
    id: '2',
    title: 'Emergency Flood Recovery',
    fiscalYear: '2023-2024',
    totalAmount: 350000,
    status: 'approved',
    createdAt: new Date('2023-08-10'),
    items: [
      { id: '2-1', category: 'Infrastructure Repair', description: 'Repair of damaged paths and bridges', amount: 200000 },
      { id: '2-2', category: 'Habitat Restoration', description: 'Restoration of damaged wildlife habitats', amount: 150000 },
    ],
  },
  {
    id: '3',
    title: 'Annual Park Budget 2024 (Draft)',
    fiscalYear: '2024-2025',
    totalAmount: 1350000,
    status: 'draft',
    createdAt: new Date('2024-02-20'),
    items: [
      { id: '3-1', category: 'Staff Salaries', description: 'Annual salaries for 27 staff members', amount: 810000 },
      { id: '3-2', category: 'Maintenance', description: 'Park facilities maintenance', amount: 220000 },
      { id: '3-3', category: 'Conservation', description: 'Wildlife conservation programs', amount: 170000 },
      { id: '3-4', category: 'Equipment', description: 'New equipment purchases', amount: 100000 },
      { id: '3-5', category: 'Miscellaneous', description: 'Unforeseen expenses', amount: 50000 },
    ],
  },
];

const BudgetCreation = () => {
  const [activeTab, setActiveTab] = useState('existing');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', category: '', description: '', amount: 0 },
  ]);

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

  const handleSaveDraft = () => {
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

    // Here you would save to a database
    toast({
      title: 'Budget Saved',
      description: `Draft budget "${budgetTitle}" saved successfully`,
    });
  };

  const handleSubmitBudget = () => {
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

    // Here you would submit to a database
    toast({
      title: 'Budget Submitted',
      description: `Budget "${budgetTitle}" submitted for approval`,
    });
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
                  <TabsTrigger value="new">Create New Budget</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="existing">
                <div className="grid gap-6">
                  {sampleBudgets.map((budget) => (
                    <Card key={budget.id}>
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                          <CardTitle className="text-xl">{budget.title}</CardTitle>
                          <CardDescription>Fiscal Year: {budget.fiscalYear}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(budget.status)}>
                          {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Created on</span>
                            <span>{budget.createdAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total Amount</span>
                            <span>${budget.totalAmount.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="space-y-2 pt-2">
                            <h4 className="font-medium text-sm">Budget Items</h4>
                            {budget.items.map((item) => (
                              <div key={item.id} className="grid grid-cols-4 text-sm py-1">
                                <div className="font-medium">{item.category}</div>
                                <div className="col-span-2 text-gray-600">{item.description}</div>
                                <div className="text-right">${item.amount.toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('new')}>
                          Create Similar
                        </Button>
                        {budget.status === 'draft' && (
                          <Button size="sm">
                            Continue Editing
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
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
                        {budgetItems.map((item, index) => (
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
