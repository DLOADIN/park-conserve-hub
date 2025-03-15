
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const users = [
  { email: 'admin@parkconservation.org', password: 'admin123', role: 'admin' },
  { email: 'parkstaff@parkconservation.org', password: 'staff123', role: 'parkstaff' },
  { email: 'government@parkconservation.org', password: 'gov123', role: 'government' },
  { email: 'finance@parkconservation.org', password: 'finance123', role: 'finance' },
  { email: 'auditor@parkconservation.org', password: 'audit123', role: 'auditor' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Find user in our mock user database
    const user = users.find(u => u.email === email && u.password === password);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.role} user!`,
        });
        
        // Store user information in localStorage
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          role: user.role,
        }));
        
        // Redirect to the appropriate dashboard based on role
        navigate(`/dashboard/${user.role}`);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const handleQuickLogin = (selectedRole: string) => {
    const user = users.find(u => u.role === selectedRole);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-conservation-50">
        <div className="max-w-md mx-auto">
          <Card className="border-conservation-100 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-conservation-900">Sign In</CardTitle>
              <CardDescription>
                Access your Park Conservation Hub dashboard
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="regular" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="regular">Regular Login</TabsTrigger>
                <TabsTrigger value="demo">Demo Users</TabsTrigger>
              </TabsList>
              <TabsContent value="regular">
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-conservation-500" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-conservation-500" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-conservation-500 hover:text-conservation-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 rounded border-conservation-300 text-conservation-600 focus:ring-conservation-500"
                        />
                        <Label htmlFor="remember-me" className="ml-2 text-sm text-conservation-700">
                          Remember me
                        </Label>
                      </div>
                      <div className="text-sm">
                        <a href="#" className="text-conservation-600 hover:text-conservation-500">
                          Forgot your password?
                        </a>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-conservation-600 hover:bg-conservation-700"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              <TabsContent value="demo">
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role">Select User Role</Label>
                      <Select value={role} onValueChange={(value) => {
                        setRole(value);
                        handleQuickLogin(value);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="parkstaff">Park Staff</SelectItem>
                          <SelectItem value="government">Government Agent</SelectItem>
                          <SelectItem value="finance">Finance Officer</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {role && (
                      <div className="p-4 bg-conservation-100 rounded-lg">
                        <p className="text-sm text-conservation-700 mb-2">Demo Credentials:</p>
                        <p className="text-sm"><strong>Email:</strong> {email}</p>
                        <p className="text-sm"><strong>Password:</strong> {password}</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading || !role}
                      className="w-full bg-conservation-600 hover:bg-conservation-700"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing in...' : 'Sign in as Demo User'}
                    </Button>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-sm text-conservation-700">
                Don't have an account? Contact your administrator
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
