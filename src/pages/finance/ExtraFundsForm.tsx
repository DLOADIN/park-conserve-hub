
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PiggyBank, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  parkName: z.string().min(1, {
    message: "Please select a park.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  justification: z.string().min(20, {
    message: "Justification must be at least 20 characters.",
  }),
  expectedDuration: z.string().min(1, {
    message: "Please select an expected duration.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ExtraFundsForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: undefined,
      parkName: '',
      category: '',
      justification: '',
      expectedDuration: '',
    },
  });
  
  const handleSubmit = (values: FormValues) => {
    console.log('Extra funds request submitted:', values);
    
    // In a real app, this would send the data to a backend API
    // For demo purposes, we'll just show a success message
    toast.success('Extra funds request submitted successfully!');
    
    // Reset form
    form.reset();
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      navigate('/finance/extra-funds');
    }, 1500);
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Request Extra Funds"
            subtitle="Submit a request for additional funding for a park"
          />
          
          <main className="p-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3 text-green-500 mb-2">
                  <PiggyBank className="h-5 w-5" />
                  <span className="text-sm font-medium">Extra Funds Request</span>
                </div>
                <CardTitle>New Extra Funds Request</CardTitle>
                <CardDescription>
                  Use this form to request additional funds for park projects or initiatives beyond the regular budget. 
                  These requests will be reviewed by government officials.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Visitor Center Expansion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? undefined : Number(value));
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the total amount of additional funding needed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="parkName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Park</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select park" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Yellowstone">Yellowstone</SelectItem>
                                <SelectItem value="Yosemite">Yosemite</SelectItem>
                                <SelectItem value="Grand Canyon">Grand Canyon</SelectItem>
                                <SelectItem value="Zion">Zion</SelectItem>
                                <SelectItem value="Acadia">Acadia</SelectItem>
                                <SelectItem value="Rocky Mountain">Rocky Mountain</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                <SelectItem value="Conservation">Conservation</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Research">Research</SelectItem>
                                <SelectItem value="Visitor Services">Visitor Services</SelectItem>
                                <SelectItem value="Staffing">Staffing</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expectedDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Duration</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="One-time">One-time Expense</SelectItem>
                                <SelectItem value="Quarter">One Quarter (3 months)</SelectItem>
                                <SelectItem value="Half-year">Half Year (6 months)</SelectItem>
                                <SelectItem value="Annual">Full Year</SelectItem>
                                <SelectItem value="Multi-year">Multi-year</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How long will the requested funds be needed?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what the additional funds will be used for..." 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of how the funds will be used
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justification for Extra Funds</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why these additional funds are necessary beyond the regular budget..." 
                              {...field} 
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Explain why these funds cannot be accommodated within the existing budget
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Submit Extra Funds Request
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ExtraFundsForm;