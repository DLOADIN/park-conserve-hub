
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 z-[-1]">
        <img
          src="/lovable-uploads/3d18fb14-dd3e-4bff-83a3-a258b6249e64.png"
          alt="National Park"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40 text-white">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Preserve Nature's Legacy
          </h1>
          <p className="mt-6 text-lg leading-8">
            Join our mission to protect and preserve natural habitats. Book a tour, make a donation, 
            or partner with us to ensure our parks thrive for future generations.
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
