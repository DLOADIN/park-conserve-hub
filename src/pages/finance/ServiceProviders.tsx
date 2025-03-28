
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  companyName: string;
  description: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'sp-001',
    name: 'John Smith',
    email: 'john@ecotours.com',
    phone: '555-123-4567',
    serviceType: 'Tour Guide',
    companyName: 'EcoTours Adventures',
    description: 'Offering guided hiking tours with a focus on local ecology and conservation.',
    submittedDate: '2023-11-10',
    status: 'pending'
  },
  {
    id: 'sp-002',
    name: 'Sarah Johnson',
    email: 'sarah@wildlifephotos.com',
    phone: '555-987-6543',
    serviceType: 'Photography',
    companyName: 'Wildlife Photography Inc.',
    description: 'Professional wildlife photography services and workshops for park visitors.',
    submittedDate: '2023-11-05',
    status: 'approved',
    notes: 'Excellent portfolio and experience.'
  },
  {
    id: 'sp-003',
    name: 'Michael Brown',
    email: 'mike@greenfoods.com',
    phone: '555-456-7890',
    serviceType: 'Food Vendor',
    companyName: 'Green Foods Catering',
    description: 'Sustainable food services using locally sourced ingredients.',
    submittedDate: '2023-10-28',
    status: 'rejected',
    notes: 'Did not meet sustainability requirements. Invited to reapply with updated sustainability plan.'
  },
  {
    id: 'sp-004',
    name: 'Lisa Chen',
    email: 'lisa@ecocraft.com',
    phone: '555-789-0123',
    serviceType: 'Gift Shop',
    companyName: 'EcoCraft Souvenirs',
    description: 'Handmade souvenirs created by local artisans using sustainable materials.',
    submittedDate: '2023-10-20',
    status: 'pending'
  },
  {
    id: 'sp-005',
    name: 'Robert Martinez',
    email: 'robert@wildadventures.com',
    phone: '555-234-5678',
    serviceType: 'Camping Equipment',
    companyName: 'Wild Adventures Gear',
    description: 'Eco-friendly camping equipment rentals for park visitors.',
    submittedDate: '2023-10-15',
    status: 'approved',
    notes: 'High-quality equipment that meets our sustainability standards.'
  }
];

const ServiceProviders = () => {
  const { user } = useAuth();
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(mockServiceProviders);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const handleApprove = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setApprovalNotes('');
    setIsApproveDialogOpen(true);
  };

  const handleReject = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setRejectionNotes('');
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedProvider) return;

    const updatedProviders = serviceProviders.map(provider => {
      if (provider.id === selectedProvider.id) {
        return {
          ...provider,
          status: 'approved',
          notes: approvalNotes || 'Approved by finance officer.'
        };
      }
      return provider;
    });

    setServiceProviders(updatedProviders as ServiceProvider[]);
    setIsApproveDialogOpen(false);
    toast.success(`${selectedProvider.name} from ${selectedProvider.companyName} has been approved as a service provider.`);
  };

  const confirmReject = () => {
    if (!selectedProvider || !rejectionNotes.trim()) return;

    const updatedProviders = serviceProviders.map(provider => {
      if (provider.id === selectedProvider.id) {
        return {
          ...provider,
          status: 'rejected',
          notes: rejectionNotes
        };
      }
      return provider;
    });

    setServiceProviders(updatedProviders as ServiceProvider[]);
    setIsRejectDialogOpen(false);
    toast.error(`${selectedProvider.name} from ${selectedProvider.companyName} has been rejected.`);
  };

  const filteredProviders = serviceProviders.filter(provider => {
    // Filter by search term
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by service type
    const matchesServiceType = serviceTypeFilter === 'all' || provider.serviceType === serviceTypeFilter;

    // Filter by tab status
    const matchesTab = 
      currentTab === 'all' || 
      (currentTab === 'pending' && provider.status === 'pending') ||
      (currentTab === 'approved' && provider.status === 'approved') ||
      (currentTab === 'rejected' && provider.status === 'rejected');

    return matchesSearch && matchesServiceType && matchesTab;
  });

  const uniqueServiceTypes = Array.from(new Set(serviceProviders.map(p => p.serviceType)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Service Provider Management"
            subtitle="Review and manage service provider applications"
          />
          
          <main className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Applications</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search providers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {uniqueServiceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Service Providers</CardTitle>
                <CardDescription>
                  Showing {filteredProviders.length} of {serviceProviders.length} applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredProviders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProviders.map(provider => (
                      <Card key={provider.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-lg">{provider.companyName}</CardTitle>
                              <CardDescription>{provider.serviceType}</CardDescription>
                            </div>
                            {getStatusBadge(provider.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-gray-500">{provider.email}</p>
                              <p className="text-sm text-gray-500">{provider.phone}</p>
                            </div>
                            <p className="text-sm">{provider.description}</p>
                            {provider.notes && (
                              <div className="bg-gray-50 p-2 rounded-md">
                                <p className="text-xs font-medium">Notes:</p>
                                <p className="text-xs text-gray-600">{provider.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          {provider.status === 'pending' ? (
                            <div className="flex gap-2 w-full justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(provider)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleReject(provider)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 w-full text-right">
                              Submitted: {provider.submittedDate}
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-lg font-medium">No service providers found</p>
                    <p className="text-gray-500">Try adjusting your filters or search term</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Service Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this service provider application?
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div>
              <div className="mb-4 bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{selectedProvider.companyName}</p>
                <p className="text-sm text-gray-600">{selectedProvider.serviceType}</p>
                <p className="text-sm text-gray-600">Contact: {selectedProvider.name}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="approval-notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="approval-notes"
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
              Approve Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Service Provider</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this service provider application.
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div>
              <div className="mb-4 bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{selectedProvider.companyName}</p>
                <p className="text-sm text-gray-600">{selectedProvider.serviceType}</p>
                <p className="text-sm text-gray-600">Contact: {selectedProvider.name}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="rejection-notes" className="text-sm font-medium">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="rejection-notes"
                    placeholder="Please provide a detailed reason for rejection..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectionNotes.trim()}
              variant="destructive"
            >
              Reject Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ServiceProviders;