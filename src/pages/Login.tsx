
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, LogIn, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error is shown via toast in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    let demoEmail = '';
    
    switch (role) {
      case 'admin':
        demoEmail = 'admin@ecopark.com';
        break;
      case 'park-staff':
        demoEmail = 'parkstaff@ecopark.com';
        break;
      case 'government':
        demoEmail = 'government@ecopark.com';
        break;
      case 'finance':
        demoEmail = 'finance@ecopark.com';
        break;
      case 'auditor':
        demoEmail = 'auditor@ecopark.com';
        break;
      default:
        demoEmail = 'admin@ecopark.com';
    }
    
    setEmail(demoEmail);
    setPassword('password');
    
    setIsLoading(true);
    try {
      await login(demoEmail, 'password');
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <>
  
    <NavBar />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full">
        <div className="text-center">
          <div onClick={() => navigate('/')} className="cursor-pointer mx-auto flex items-center justify-center space-x-2 mb-5">
            <div className="w-10 h-10 rounded-full bg-conservation-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">PCH</span>
            </div>
            <span className="text-xl font-bold text-conservation-700">PARK CONSERVATION HUB</span>
          </div>
          <h2 className="text-3xl font-extrabold text-conservation-700">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to access your dashboard
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="login">Sign In</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <form className="space-y-6" onSubmit={handleSubmit}>

                  <div>
                    <Label htmlFor="Role">Enter Your Role</Label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="Respectively choose your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yosemite">Admin</SelectItem>
                        <SelectItem value="Acadia">Park Staff</SelectItem>
                        <SelectItem value="Yellowstone">Government</SelectItem>
                        <SelectItem value="Grand Canyon">Finance</SelectItem>
                        <SelectItem value="Zion">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="pl-10"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>

                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-conservation-500 flex justify-center py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <LogIn className="h-5 w-5 mr-2" />
                      )}
                      Sign in
                    </Button>
                  </div>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or use demo accounts
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex justify-center text-xs"
                      onClick={() => handleDemoLogin('admin')}
                    >
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex justify-center text-xs"
                      onClick={() => handleDemoLogin('park-staff')}
                    >
                      Park Staff
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex justify-center text-xs"
                      onClick={() => handleDemoLogin('government')}
                    >
                      Government
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex justify-center text-xs"
                      onClick={() => handleDemoLogin('finance')}
                    >
                      Finance
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex justify-center col-span-2 text-xs"
                      onClick={() => handleDemoLogin('auditor')}
                    >
                      Auditor
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Login;
