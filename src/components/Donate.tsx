
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Heart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const parks = [
  { id: 1, name: 'Akanda National Park', tours: ['Wildlife Safari', 'Forest Hike', 'Bird Watching'] },
  { id: 2, name: 'Moukalaba-Doudou National Park', tours: ['Kayaking Adventure', 'Fishing Tour', 'Lake Cruise'] },
  { id: 3, name: 'Ivindo National Park', tours: ['Rock Climbing', 'Mountain Trail', 'Scenic Drive'] },
  { id: 4, name: 'All parks', tours: ['Rock Climbing', 'Mountain Trail', 'Scenic Drive'] }
];

const donationAmounts = [25, 50, 100, 250, 500];

const Donate = () => {
  const [donationType, setDonationType] = useState('oneTime');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [parkName, setParkName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCustomAmount(value);
      setAmount('custom');
    }
  };

  const getDonationAmount = () => {
    if (amount === 'custom' && customAmount) {
      return parseFloat(customAmount);
    }
    return amount ? parseInt(amount) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const donationAmount = getDonationAmount();

    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: "Invalid donation amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (!firstName || !lastName || !email || !parkName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationType,
          amount: donationAmount,
          parkName,
          firstName,
          lastName,
          email,
          message,
          isAnonymous,
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you for your donation!",
          description: "You'll receive an email confirmation shortly.",
        });
        navigate('/payment', {
          state: {
            type: 'donation',
            amount: donationAmount,
            details: {
              donationType,
              parkName,
              name: isAnonymous ? 'Anonymous' : `${firstName} ${lastName}`,
              email,
              message,
            },
          },
        });
      } else {
        throw new Error('Failed to submit donation');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit donation. Please try again.",
        variant: "destructive",
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
            <h1 className="text-3xl font-bold text-conservation-900">Support Our Conservation Efforts</h1>
            <p className="mt-3 text-conservation-700">Your donation helps us protect natural habitats for future generations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>Choose how you'd like to support our parks</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>Donation Type</Label>
                    <RadioGroup
                      defaultValue="oneTime"
                      value={donationType}
                      onValueChange={setDonationType}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oneTime" id="oneTime" />
                        <Label htmlFor="oneTime" className="cursor-pointer">One-time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly" className="cursor-pointer">Yearly</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Donation Amount</Label>
                    <RadioGroup
                      value={amount}
                      onValueChange={handleAmountChange}
                      className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2"
                    >
                      {[25, 50, 100, 250, 500].map((amt) => (
                        <div key={amt} className="flex items-center space-x-2">
                          <RadioGroupItem value={amt.toString()} id={`amount-${amt}`} />
                          <Label htmlFor={`amount-${amt}`} className="cursor-pointer">${amt}</Label>
                        </div>
                      ))}
                      <div className="flex items-center col-span-3 sm:col-span-5 mt-2">
                        <RadioGroupItem
                          value="custom"
                          id="amount-custom"
                          className="hidden"
                        />
                        <div className="items-center w-full border rounded-md overflow-hidden">
                          <Input
                            type="number"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            onClick={() => setAmount('custom')}
                            placeholder="Enter amount"
                            className="border-0 flex-1"
                          />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="parkName">Park Name</Label>
                    <Input
                      id="parkName"
                      value={parkName}
                      onChange={(e) => setParkName(e.target.value)}
                      placeholder="Enter park name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={!isAnonymous}
                        disabled={isAnonymous}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={!isAnonymous}
                        disabled={isAnonymous}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us why you're making this donation"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-start space-x-2 mt-6 rounded-lg bg-conservation-100 p-4 text-sm text-conservation-800">
                    <HelpCircle className="h-5 w-5 flex-shrink-0 text-conservation-600" />
                    <div>
                      <p className="font-medium">Tax Deductible Donation</p>
                      <p className="mt-1">Your donation is tax-deductible to the extent allowed by law. You will receive a receipt for your records.</p>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-conservation-600 hover:bg-conservation-700"
              >
                <Heart className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Processing...' : 'Complete Donation'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Donate;