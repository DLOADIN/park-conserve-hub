
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, UserPlus, Shield, ShieldAlert, ShieldCheck, UserCog, Trash, Edit, Mail } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  park?: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@ecopark.com', role: 'admin', status: 'active', lastLogin: '2023-10-15', park: 'Yellowstone' },
  { id: '2', name: 'Jane Smith', email: 'jane@ecopark.com', role: 'park-staff', status: 'active', lastLogin: '2023-10-14', park: 'Yosemite' },
  { id: '3', name: 'Mike Johnson', email: 'mike@ecopark.com', role: 'government', status: 'active', lastLogin: '2023-10-10' },
  { id: '4', name: 'Sara Wilson', email: 'sara@ecopark.com', role: 'finance', status: 'inactive', lastLogin: '2023-09-28', park: 'Grand Canyon' },
  { id: '5', name: 'Tom Brown', email: 'tom@ecopark.com', role: 'auditor', status: 'active', lastLogin: '2023-10-13' },
  { id: '6', name: 'Lisa Davis', email: 'lisa@ecopark.com', role: 'park-staff', status: 'pending', lastLogin: '2023-10-01', park: 'Acadia' },
  { id: '7', name: 'Robert Miller', email: 'robert@ecopark.com', role: 'government', status: 'active', lastLogin: '2023-10-08' },
  { id: '8', name: 'Emily White', email: 'emily@ecopark.com', role: 'finance', status: 'active', lastLogin: '2023-10-12', park: 'Zion' },
];

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'park-staff': return 'bg-green-100 text-green-800';
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-amber-100 text-amber-800';
      case 'auditor': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'park-staff': return <ShieldCheck className="h-4 w-4" />;
      case 'government': return <ShieldAlert className="h-4 w-4" />;
      case 'finance': return <UserCog className="h-4 w-4" />;
      case 'auditor': return <UserCog className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="User Management"
            subtitle="Manage users and their access levels"
          />
          
          <main className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="whitespace-nowrap">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </div>
            
            <Card className="shadow-sm animate-fade-in">
              <CardHeader className="pb-0">
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage all EcoPark system users across different roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Park</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatars.dicebear.com/api/initials/${user.name.charAt(0)}${user.name.split(' ')[1]?.charAt(0) || ''}.svg`} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 font-normal`}>
                              {getRoleIcon(user.role)}
                              <span className="capitalize">{user.role.replace('-', ' ')}</span>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.park || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                              <span className="capitalize">{user.status}</span>
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500">Showing {filteredUsers.length} of {mockUsers.length} users</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserManagement;
