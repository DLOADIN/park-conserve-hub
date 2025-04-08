import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, UserPlus, Shield, ShieldAlert, ShieldCheck, UserCog, Trash, Edit, Mail, Clock } from 'lucide-react';
import AddParkStaffModal from './AddParkStaffModal';
import UserActivityTable from './UserActivityTable';
import axios from 'axios';
import { toast } from 'sonner';

type UserStatus = 'active' | 'inactive' | 'pending';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastLogin: string;
  park?: string;
}

const UserManagement = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/park-staff');
        
        const userData: User[] = response.data.map((staff: any) => ({
          id: staff.id.toString(),
          name: `${staff.first_name} ${staff.last_name}`,
          email: staff.email,
          role: staff.role || 'park-staff',
          status: staff.last_login ? 'active' : 'pending',
          lastLogin: staff.last_login ? new Date(staff.last_login).toLocaleDateString() : 'Never',
          park: staff.park_name
        }));

        setUsers(userData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, navigate, isAddModalOpen]);

  const filteredUsers = users.filter(u => 
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

  const getStatusBadgeColor = (status: UserStatus) => {
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

  const handleAddUser = () => {
    setUserToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsAddModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/park-staff/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const handleSuccess = () => {
    setIsAddModalOpen(false);
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
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList className="mb-4 sm:mb-0">
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {activeTab === 'users' && (
                    <>
                      <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="whitespace-nowrap" 
                        onClick={handleAddUser}
                        disabled={loading}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Park Staff
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <TabsContent value="users" className="mt-0">
                <Card className="shadow-sm animate-fade-in">
                  <CardHeader className="pb-0">
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>Manage all EcoPark system users across different roles.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error ? (
                      <div className="text-center py-8 text-red-500">
                        {error}
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
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
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user, index) => (
                                <tr 
                                  key={user.id} 
                                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage 
                                          src={`https://avatars.dicebear.com/api/initials/${user.name.charAt(0)}${user.name.split(' ')[1]?.charAt(0) || ''}.svg`} 
                                          alt={user.name} 
                                        />
                                        <AvatarFallback>
                                          {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      variant="outline" 
                                      className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 font-normal`}
                                    >
                                      {getRoleIcon(user.role)}
                                      <span className="capitalize">{user.role.replace('-', ' ')}</span>
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    {user.park || '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      variant="outline" 
                                      className={getStatusBadgeColor(user.status)}
                                    >
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
                                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Mail className="mr-2 h-4 w-4" />
                                          Send Email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Clock className="mr-2 h-4 w-4" />
                                          View Activity
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600"
                                          onClick={() => handleDeleteUser(user.id)}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                  No users found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                  {!loading && !error && (
                    <CardFooter className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="text-sm text-gray-500">
                        Showing {filteredUsers.length} of {users.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      
      <AddParkStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        userToEdit={userToEdit}
        onSuccess={handleSuccess}
      />
    </SidebarProvider>
  );
};

export default UserManagement;