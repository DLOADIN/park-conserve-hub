
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 z-[-1]">
        <img
          src="/lovable-uploads/pexels-followalice-667205.jpg"
          alt="National Park"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40 text-white">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Loango National Park
          </h1>
          <p className="mt-6 text-lg leading-8">
            Often referred to as "Africa’s Last Eden," a name first coined by renowned naturalist Mike Fay, Loango National Park lies on the western coast of Gabon, nestled between the Nkomi and Ndogo Lagoons. Spanning nearly a thousand square miles, the park boasts diverse landscapes, including savannas, beaches, jungles, and mangroves. Within its vast expanse is a portion of the Iguéla Lagoon, the only significant protected lagoon in West Africa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-conservation-600 hover:bg-conservation-700 text-white">
              <Link to="/book-tour">
                <Ticket className="mr-2 h-5 w-5" />
                Book a Tour
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white">
              <Link to="/donate">
                <Heart className="mr-2 h-5 w-5" />
                Make a Donation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
