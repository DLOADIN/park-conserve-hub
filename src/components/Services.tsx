import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialParkId = searchParams.get('park') || '';

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Company Info
  const [companyInfo, setCompanyInfo] = useState({
    companyType: '',
    providedService: '',
    companyName: '',
  });

  // File Uploads
  const [files, setFiles] = useState({
    companyRegistration: null as File | null,
    applicationLetter: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleCompanyChange = (id: string, value: string) => {
    setCompanyInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = e.target;
    setFiles((prev) => ({ ...prev, [id]: files?.[0] || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('firstName', personalInfo.firstName);
    formData.append('lastName', personalInfo.lastName);
    formData.append('email', personalInfo.email);
    formData.append('phone', personalInfo.phone);
    formData.append('companyType', companyInfo.companyType);
    formData.append('providedService', companyInfo.providedService);
    formData.append('companyName', companyInfo.companyName);
    if (files.companyRegistration) {
      formData.append('companyRegistration', files.companyRegistration);
    }
    if (files.applicationLetter) {
      formData.append('applicationLetter', files.applicationLetter);
    }

    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({ title: 'Application submitted!', description: 'You will receive an update soon via email.' });
        navigate('/services');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-conservation-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-conservation-900">Partners & Services Form</h1>
            <p className="mt-3 text-conservation-700">Fill in the details below to collaborate with us.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>Provide accurate details for your partnership request.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 border-b pb-2">
                  <h3 className="text-lg font-medium text-conservation-700">Personal Information</h3>
                </div>

                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={personalInfo.firstName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={personalInfo.lastName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={personalInfo.email} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" value={personalInfo.phone} onChange={handleInputChange} />
                </div>

                {/* Company Information */}
                <div className="sm:col-span-2 border-b pb-2 pt-4">
                  <h3 className="text-lg font-medium text-conservation-700">Company Information</h3>
                </div>

                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select onValueChange={(value) => handleCompanyChange('companyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type">{companyInfo.companyType || 'Select Type'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="providedService">Service Offered</Label>
                  <Select onValueChange={(value) => handleCompanyChange('providedService', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Service">{companyInfo.providedService || 'Choose Service'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Tour Guiders">Tour Guiders</SelectItem>
                      <SelectItem value="Accountants">Accountants</SelectItem>
                      <SelectItem value="Waiter/Waitress">Waiter/Waitress</SelectItem>
                      <SelectItem value="Housekeeper">Housekeeper</SelectItem>
                      <SelectItem value="Boat Tour Guiders">Boat Tour Guiders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyInfo.companyName} onChange={(e) => handleCompanyChange('companyName', e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="companyRegistration">Company Registration Document</Label>
                  <Input id="companyRegistration" type="file" onChange={handleFileChange} required />
                </div>

                <div>
                  <Label htmlFor="applicationLetter">Application Letter</Label>
                  <Input id="applicationLetter" type="file" onChange={handleFileChange} />
                </div>

                {/* Terms */}
                <div className="sm:col-span-2 flex items-start space-x-2 mt-6 text-sm text-gray-700">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <p>
                    By submitting, you agree to our <a href="#" className="text-conservation-700 underline">terms and conditions</a>.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-conservation-600 hover:bg-conservation-700">
                    {isSubmitting ? 'Processing...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
