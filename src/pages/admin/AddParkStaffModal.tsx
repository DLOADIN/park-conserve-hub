import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  park?: string;
}

interface AddParkStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
}

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  park: z.string().min(1, {
    message: "Please select a park.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AddParkStaffModal: React.FC<AddParkStaffModalProps> = ({ isOpen, onClose, userToEdit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      park: '',
    },
  });

  // When editing a user, populate the form with their information
  useEffect(() => {
    if (userToEdit) {
      const nameParts = userToEdit.name.split(' ');
      form.reset({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userToEdit.email,
        park: userToEdit.park || '',
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        park: '',
      });
    }
  }, [userToEdit, form]);

  const onSubmit = (values: FormValues) => {
    // In a real app, this would send a request to the server
    // For now, we'll just show a toast message
    const action = userToEdit ? 'updated' : 'added';
    toast.success(`Park staff ${action} successfully!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Edit Park Staff' : 'Add New Park Staff'}</DialogTitle>
          <DialogDescription>
            {userToEdit 
              ? 'Update the information for this park staff member.' 
              : 'Fill in the details to add a new park staff member.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used for login and communication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="park"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Park</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a park" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Akanda National Park">Akanda National Park</SelectItem>
                      <SelectItem value="Batéké Plateau National Park">Batéké Plateau National Park</SelectItem>
                      <SelectItem value="Birougou National Park">Birougou National Park</SelectItem>
                      <SelectItem value="Crystal Mountains National Park">Crystal Mountains National Park</SelectItem>
                      <SelectItem value="Ivindo National Park">Ivindo National Park</SelectItem>
                      <SelectItem value="Loango National Park">Loango National Park</SelectItem>
                      <SelectItem value="Lope National Park">Lope National Park</SelectItem>
                      <SelectItem value="Mayumba National Park">Mayumba National Park</SelectItem>
                      <SelectItem value="Minkébé National Park">Minkébé National Park</SelectItem>
                      <SelectItem value="Moukalaba-Doudou National Park">Moukalaba-Doudou National Park</SelectItem>
                      <SelectItem value="Mvembé National Park">Mvembé National Park</SelectItem>
                      <SelectItem value="Mwagna National Park">Mwagna National Park</SelectItem>
                      <SelectItem value="Waka National Park">Waka National Park</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {userToEdit ? 'Update Staff' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddParkStaffModal;