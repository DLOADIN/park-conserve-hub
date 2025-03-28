
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Save, Send, FileText, CheckCircle, Trash2, Edit } from 'lucide-react';

// Mock data for budget suggestions
const initialSuggestions = [
  {
    id: '1',
    title: 'Increase Wildlife Conservation Budget',
    department: 'Conservation',
    amount: 250000,
    description: 'Additional funds needed for expanding the wildlife conservation program in the north sector.',
    status: 'pending',
    createdAt: '2023-11-15',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Trail Maintenance Equipment',
    department: 'Facilities',
    amount: 75000,
    description: 'Purchase of new equipment for trail maintenance across all park regions.',
    status: 'approved',
    createdAt: '2023-10-27',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Visitor Center Renovation',
    department: 'Operations',
    amount: 180000,
    description: 'Renovations needed for the main visitor center to accommodate increased traffic.',
    status: 'rejected',
    createdAt: '2023-09-18',
    priority: 'low'
  }
];

const BudgetSuggestion = () => {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    amount: '',
    description: '',
    priority: 'medium'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSuggestion = () => {
    if (!formData.title || !formData.department || !formData.amount || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    const newSuggestion = {
      id: Date.now().toString(),
      title: formData.title,
      department: formData.department,
      amount: parseFloat(formData.amount),
      description: formData.description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      priority: formData.priority
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setFormData({
      title: '',
      department: '',
      amount: '',
      description: '',
      priority: 'medium'
    });
    setIsCreating(false);
    toast.success('Budget suggestion created successfully');
  };

  const handleEditSuggestion = () => {
    if (!formData.title || !formData.department || !formData.amount || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setSuggestions(suggestions.map(suggestion => 
      suggestion.id === editId 
        ? {
            ...suggestion,
            title: formData.title,
            department: formData.department,
            amount: parseFloat(formData.amount),
            description: formData.description,
            priority: formData.priority
          }
        : suggestion
    ));

    setFormData({
      title: '',
      department: '',
      amount: '',
      description: '',
      priority: 'medium'
    });
    setIsEditing(false);
    setEditId(null);
    toast.success('Budget suggestion updated successfully');
  };

  const startEdit = (suggestion: any) => {
    setFormData({
      title: suggestion.title,
      department: suggestion.department,
      amount: suggestion.amount.toString(),
      description: suggestion.description,
      priority: suggestion.priority
    });
    setEditId(suggestion.id);
    setIsEditing(true);
    setIsCreating(false);
  };

  const deleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(suggestion => suggestion.id !== id));
    toast.success('Budget suggestion deleted successfully');
  };

  const changeStatus = (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setSuggestions(suggestions.map(suggestion => 
      suggestion.id === id ? { ...suggestion, status: newStatus } : suggestion
    ));
    
    const statusMessage = newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'marked as pending';
    toast.success(`Budget suggestion ${statusMessage}`);
  };

  const filteredSuggestions = activeTab === 'all' 
    ? suggestions 
    : suggestions.filter(suggestion => suggestion.status === activeTab);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Budget Suggestions"
            subtitle="Create and manage budget proposals"
          />
          
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Budget Suggestions</h2>
              {!isCreating && !isEditing && (
                <Button onClick={() => setIsCreating(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Suggestion
                </Button>
              )}
            </div>

            {(isCreating || isEditing) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{isEditing ? 'Edit Budget Suggestion' : 'Create Budget Suggestion'}</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? 'Update the details of your budget suggestion' 
                      : 'Fill in the details to create a new budget suggestion'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g. Increase Maintenance Budget"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="e.g. Facilities, Conservation, etc."
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="e.g. 50000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide details about this budget suggestion..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreating(false);
                          setIsEditing(false);
                          setEditId(null);
                          setFormData({
                            title: '',
                            department: '',
                            amount: '',
                            description: '',
                            priority: 'medium'
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={isEditing ? handleEditSuggestion : handleCreateSuggestion}>
                        {isEditing ? (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Suggestion
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Suggestion
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Suggestions</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-600">No budget suggestions found</p>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'all' 
                        ? 'Create a new budget suggestion to get started'
                        : `No ${activeTab} budget suggestions available`}
                    </p>
                    {activeTab !== 'all' && (
                      <Button variant="outline" onClick={() => setActiveTab('all')}>
                        View all suggestions
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Title</th>
                          <th className="py-3 px-4 text-left">Department</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4 text-center">Priority</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Created</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSuggestions.map((suggestion) => (
                          <tr key={suggestion.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{suggestion.title}</td>
                            <td className="py-3 px-4">{suggestion.department}</td>
                            <td className="py-3 px-4 text-right">
                              ${suggestion.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  suggestion.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : suggestion.priority === 'medium' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  suggestion.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : suggestion.status === 'rejected' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {suggestion.createdAt}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center space-x-2">
                                {suggestion.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                                      onClick={() => changeStatus(suggestion.id, 'approved')}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                                      onClick={() => changeStatus(suggestion.id, 'rejected')}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => startEdit(suggestion)}
                                  disabled={suggestion.status !== 'pending'}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BudgetSuggestion;
