
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, FileText, Filter, Search } from 'lucide-react';

// Sample invoice data
const SAMPLE_INVOICES = [
  {
    id: 'INV-2023-001',
    date: '2023-12-15',
    vendor: 'EcoPark Maintenance Services',
    amount: 12500.00,
    status: 'Paid',
    category: 'Maintenance'
  },
  {
    id: 'INV-2023-002',
    date: '2023-12-18',
    vendor: 'GreenTech Solutions',
    amount: 8750.50,
    status: 'Pending',
    category: 'Equipment'
  },
  {
    id: 'INV-2024-001',
    date: '2024-01-05',
    vendor: 'Sustainable Supplies Co.',
    amount: 3275.25,
    status: 'Paid',
    category: 'Supplies'
  },
  {
    id: 'INV-2024-002',
    date: '2024-01-12',
    vendor: 'Wildlife Conservation Partners',
    amount: 15000.00,
    status: 'Overdue',
    category: 'Services'
  },
  {
    id: 'INV-2024-003',
    date: '2024-01-20',
    vendor: 'Nature Education Group',
    amount: 6500.00,
    status: 'Paid',
    category: 'Education'
  },
  {
    id: 'INV-2024-004',
    date: '2024-02-02',
    vendor: 'EcoPark Maintenance Services',
    amount: 12500.00,
    status: 'Pending',
    category: 'Maintenance'
  },
  {
    id: 'INV-2024-005',
    date: '2024-02-10',
    vendor: 'Renewable Energy Systems',
    amount: 22750.75,
    status: 'Pending',
    category: 'Infrastructure'
  }
];

const InvoiceView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter invoices based on search term and filters
  const filteredInvoices = SAMPLE_INVOICES.filter(invoice => {
    // Search term filter
    const searchMatch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Category filter
    const categoryMatch = categoryFilter === 'all' || invoice.category.toLowerCase() === categoryFilter.toLowerCase();

    return searchMatch && statusMatch && categoryMatch;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(SAMPLE_INVOICES.map(invoice => invoice.category.toLowerCase()))];
  
  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Invoices"
            subtitle="View and manage invoices"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select 
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categories
                          .filter(cat => cat !== 'all')
                          .map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.vendor}</TableCell>
                            <TableCell>{invoice.category}</TableCell>
                            <TableCell>${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                            No invoices found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <div>Showing {filteredInvoices.length} of {SAMPLE_INVOICES.length} invoices</div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InvoiceView;