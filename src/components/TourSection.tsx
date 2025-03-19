
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Clock, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Tour {
  id: string;
  name: string;
  park: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: 'wildlife' | 'hiking' | 'cultural';
  maxParticipants: number;
}

const tours: Tour[] = [
  {
    id: '1',
    name: 'Wildlife Safari Adventure',
    park: 'Yellowstone',
    description: 'Experience the incredible wildlife of Yellowstone National Park with our expert guides.',
    price: 149.99,
    duration: '6 hours',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'wildlife',
    maxParticipants: 12
  },
  {
    id: '2',
    name: 'Grand Canyon Rim Trail',
    park: 'Grand Canyon',
    description: 'Hike along the spectacular rim of the Grand Canyon with breathtaking views.',
    price: 89.99,
    duration: '4 hours',
    image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'hiking',
    maxParticipants: 15
  },
  {
    id: '3',
    name: 'Cultural Heritage Tour',
    park: 'Mesa Verde',
    description: 'Discover the ancient cliff dwellings and cultural heritage of Mesa Verde.',
    price: 129.99,
    duration: '5 hours',
    image: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'cultural',
    maxParticipants: 10
  },
  {
    id: '4',
    name: 'Wildlife Photography Trek',
    park: 'Denali',
    description: 'Perfect your wildlife photography skills with our professional photographer guides.',
    price: 199.99,
    duration: '8 hours',
    image: 'https://images.unsplash.com/photo-1518486229626-b9998f47f7f4?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'wildlife',
    maxParticipants: 8
  },
  {
    id: '5',
    name: 'Backcountry Hiking Adventure',
    park: 'Yosemite',
    description: 'Explore the hidden gems of Yosemite\'s backcountry trails and waterfalls.',
    price: 159.99,
    duration: '7 hours',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'hiking',
    maxParticipants: 10
  },
  {
    id: '6',
    name: 'Native American Heritage Experience',
    park: 'Zion',
    description: 'Learn about the rich Native American history and traditions of Zion National Park.',
    price: 139.99,
    duration: '6 hours',
    image: 'https://images.unsplash.com/photo-1489619243109-4e0ea59cfe10?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80',
    category: 'cultural',
    maxParticipants: 12
  }
];

const TourSection = () => {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    date: '',
    participants: 1,
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBookTour = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDialogOpen(true);
    setIsPaymentStep(false);
  };

  const proceedToPayment = () => {
    const { name, email, date, participants } = bookingDetails;
    
    if (!name || !email || !date || participants < 1) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsPaymentStep(true);
  };

  const processPayment = () => {
    const { cardNumber, cardName, expiry, cvv } = bookingDetails;
    
    if (!cardNumber || !cardName || !expiry || !cvv) {
      toast.error('Please fill all payment details');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsDialogOpen(false);
      
      // Reset form
      setBookingDetails({
        name: '',
        email: '',
        date: '',
        participants: 1,
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
      });
      
      toast.success('Tour booked successfully! Check your email for confirmation.');
    }, 1500);
  };

  return (
    <section id="tours" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Explore Our Guided Tours
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the beauty of nature with our expert-led tours designed for all experience levels.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 sm:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="wildlife">Wildlife</TabsTrigger>
              <TabsTrigger value="hiking">Hiking</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} onBook={() => handleBookTour(tour)} />
            ))}
          </TabsContent>

          <TabsContent value="wildlife" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours
              .filter((tour) => tour.category === 'wildlife')
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} onBook={() => handleBookTour(tour)} />
              ))}
          </TabsContent>

          <TabsContent value="hiking" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours
              .filter((tour) => tour.category === 'hiking')
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} onBook={() => handleBookTour(tour)} />
              ))}
          </TabsContent>

          <TabsContent value="cultural" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours
              .filter((tour) => tour.category === 'cultural')
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} onBook={() => handleBookTour(tour)} />
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTour && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isPaymentStep ? 'Payment Details' : 'Book Tour'}</DialogTitle>
              <DialogDescription>
                {isPaymentStep ? 'Complete your payment to secure your booking.' : `Fill in your details to book the ${selectedTour.name} tour.`}
              </DialogDescription>
            </DialogHeader>

            {!isPaymentStep ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={bookingDetails.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={bookingDetails.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={bookingDetails.date}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="participants" className="text-right">
                    Participants
                  </Label>
                  <Input
                    id="participants"
                    name="participants"
                    type="number"
                    min="1"
                    max={selectedTour.maxParticipants}
                    value={bookingDetails.participants}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="text-sm text-gray-500 col-span-4 text-right">
                  Max participants: {selectedTour.maxParticipants}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardNumber" className="text-right">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={bookingDetails.cardNumber}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardName" className="text-right">
                    Name on Card
                  </Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={bookingDetails.cardName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    name="expiry"
                    placeholder="MM/YY"
                    value={bookingDetails.expiry}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cvv" className="text-right">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="password"
                    placeholder="123"
                    value={bookingDetails.cvv}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="col-span-4 pt-2">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between">
                      <span>Tour Price:</span>
                      <span className="font-medium">${selectedTour.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Participants:</span>
                      <span className="font-medium">x{bookingDetails.participants}</span>
                    </div>
                    <div className="flex justify-between mt-1 font-bold border-t border-gray-200 pt-2 mt-2">
                      <span>Total:</span>
                      <span>${(selectedTour.price * bookingDetails.participants).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              {!isPaymentStep ? (
                <Button onClick={proceedToPayment}>Continue to Payment</Button>
              ) : (
                <Button onClick={processPayment} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Complete Booking'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

interface TourCardProps {
  tour: Tour;
  onBook: () => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onBook }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg card-hover animate-fade-in">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={tour.image} 
          alt={tour.name} 
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary">
          ${tour.price}
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 text-primary" /> {tour.park}
        </div>
        <CardTitle>{tour.name}</CardTitle>
        <CardDescription>{tour.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-primary" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-primary" />
            <span>Max {tour.maxParticipants}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onBook} className="w-full">Book Now</Button>
      </CardFooter>
    </Card>
  );
};

export default TourSection;
