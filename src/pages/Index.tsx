
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TourSection from '@/components/TourSection';
import DonationSection from '@/components/DonationSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Hero />
        <TourSection />
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
