import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, Users } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  park: string;
}

const Emails = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YOUR_PUBLIC_KEY"); 
  }, []);

  // Fetch staff members
  useEffect(() => {
    const fetchStaffMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/staff', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch staff members');
        const data = await response.json();
        setStaffMembers(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load staff members',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  // Get unique parks from staff members
  const uniqueParks = Array.from(new Set(staffMembers.map(staff => staff.park))).filter(Boolean);

  // Filter staff members based on selected role and park
  const filteredStaff = staffMembers.filter(staff => {
    const roleMatch = selectedRole === 'all' || staff.role === selectedRole;
    const parkMatch = selectedPark === 'all' || staff.park === selectedPark;
    return roleMatch && parkMatch;
  });

  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSelectAll = () => {
    const allEmails = filteredStaff.map(staff => staff.email);
    if (selectedRecipients.length === allEmails.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(allEmails);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedRecipients.length) {
      toast({
        title: 'Error',
        description: 'Please select at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    if (!emailForm.subject || !emailForm.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Send email to each recipient
      await Promise.all(selectedRecipients.map(async (recipientEmail) => {
        const recipient = staffMembers.find(staff => staff.email === recipientEmail);
        if (!recipient) return;

        const templateParams = {
          to_name: `${recipient.firstName} ${recipient.lastName}`,
          to_email: recipientEmail,
          subject: emailForm.subject,
          message: emailForm.message,
          from_name: 'Park Conservation Admin',
        };

        await emailjs.send(
          'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
          'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
          templateParams
        );
      }));

      toast({
        title: 'Success',
        description: 'Emails sent successfully',
      });

      // Reset form
      setEmailForm({
        to: '',
        subject: '',
        message: '',
      });
      setSelectedRecipients([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send emails',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Email Dashboard"
            subtitle="Send emails to staff members"
          />
          <main className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>Select recipients for your email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-48">
                      <Label htmlFor="role-filter">Filter by Role</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger id="role-filter">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="park-staff">Park Staff</SelectItem>
                          <SelectItem value="finance">Finance Officer</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                          <SelectItem value="government">Government Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <Label htmlFor="park-filter">Filter by Park</Label>
                      <Select value={selectedPark} onValueChange={setSelectedPark}>
                        <SelectTrigger id="park-filter">
                          <SelectValue placeholder="Select park" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Parks</SelectItem>
                          {uniqueParks.map((park) => (
                            <SelectItem key={park} value={park}>
                              {park}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedRecipients.length === filteredStaff.length && filteredStaff.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Park</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              Loading staff members...
                            </TableCell>
                          </TableRow>
                        ) : filteredStaff.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No staff members found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStaff.map((staff) => (
                            <TableRow key={staff.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedRecipients.includes(staff.email)}
                                  onChange={() => handleRecipientToggle(staff.email)}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>
                              <TableCell>
                                {staff.firstName} {staff.lastName}
                                <div className="text-sm text-gray-500">{staff.email}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {staff.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{staff.park}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>Write your message</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Write your message here"
                      rows={8}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendEmail}
                    disabled={sending || !selectedRecipients.length}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {sending ? 'Sending...' : 'Send Email'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Emails;
