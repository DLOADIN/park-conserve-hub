import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Settings, Shield, Key, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '(555) 123-4567',
    jobTitle: user?.role.replace('-', ' ') || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully!');
    }, 1000);
  };

  if (!user) {
    return null;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader title="Profile" subtitle="Manage your account settings" />
          
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-sm animate-fade-in">
                <CardHeader className="border-b">
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your profile and account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                      <TabsTrigger 
                        value="profile" 
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="p-6">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex flex-col items-center lg:w-1/3">
                          <Avatar className="h-32 w-32 mb-4">
                            <AvatarImage src={`https://avatars.dicebear.com/api/initials/${initials}.svg`} alt={profileForm.firstName} />
                            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                          </Avatar>
                          <Button variant="outline" className="w-full">
                            Change Avatar
                          </Button>
                          <div className="mt-6 text-center w-full">
                            <h3 className="font-medium text-lg">
                              {profileForm.firstName} {profileForm.lastName}
                            </h3>
                            <p className="text-gray-500 mt-1 capitalize">
                              {user.role.replace('-', ' ')}
                            </p>
                            {user.park && (
                              <p className="text-primary text-sm mt-1">
                                {user.park} Park
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="lg:w-2/3 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <div className="mt-1 relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  className="pl-10"
                                  value={profileForm.firstName}
                                  onChange={handleProfileChange}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <div className="mt-1 relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  className="pl-10"
                                  value={profileForm.lastName}
                                  onChange={handleProfileChange}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="mt-1 relative rounded-md">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                              </div>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                className="pl-10"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <div className="mt-1 relative rounded-md">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                              </div>
                              <Input
                                id="phone"
                                name="phone"
                                className="pl-10"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <div className="mt-1 relative rounded-md">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                              </div>
                              <Input
                                id="jobTitle"
                                name="jobTitle"
                                className="pl-10"
                                value={profileForm.jobTitle}
                                onChange={handleProfileChange}
                                disabled
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Job title is managed by administrators</p>
                          </div>
                          
                          <Button onClick={handleSaveProfile} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="security" className="p-6">
                      <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <p className="text-sm text-gray-500">
                          Ensure your account is using a secure password
                        </p>
                        
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="mt-1 relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="mt-1 relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="mt-1 relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                        
                        <Button onClick={handleChangePassword} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Change Password'}
                        </Button>
                        
                        <div className="mt-8 pt-8 border-t">
                          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <Button variant="destructive" className="mt-4">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
