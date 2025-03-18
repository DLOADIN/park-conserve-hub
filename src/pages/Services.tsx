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
    taxID: '',
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

    // Validate required fields
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !companyInfo.companyType || !companyInfo.companyName || !companyInfo.taxID || !files.companyRegistration) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: 'Application submitted!', description: 'You will receive an update soon.' });
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Partners & Services Form</h1>
            <p className="mt-3 text-gray-700">Fill in the details below to collaborate with us.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>Provide accurate details for your partnership request.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Personal Information */}
                <div className="sm:col-span-2 border-b pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
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
                  <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                </div>

                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select onValueChange={(value) => handleCompanyChange('companyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
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
                      <SelectValue placeholder="Choose Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Hardware Support">Hardware Support</SelectItem>
                      <SelectItem value="Software Support">Software Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyInfo.companyName} onChange={(e) => handleCompanyChange('companyName', e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="companyRegistration">Company Registration Documents</Label>
                  <Input id="companyRegistration" type="file" onChange={handleFileChange} required />
                </div>

                <div>
                  <Label htmlFor="applicationLetter">Application Letter</Label>
                  <Input id="applicationLetter" type="file" onChange={handleFileChange} required />
                </div>

                <div>
                  <Label htmlFor="taxID">Tax Identification Number</Label>
                  <Input id="taxID" value={companyInfo.taxID} onChange={(e) => handleCompanyChange('taxID', e.target.value)} required />
                </div>

                {/* Terms */}
                <div className="sm:col-span-2 flex items-start space-x-2 mt-6 text-sm text-gray-700">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <p>
                    By submitting, you agree to our <a href="#" className="text-blue-600 underline">terms and conditions</a>.
                  </p>
                </div>
              </form>
            </CardContent>

            <CardFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} 
                className="w-full bg-conservation-600 hover:bg-conservation-700">
                {isSubmitting ? 'Processing...' : 'Submit Application'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
