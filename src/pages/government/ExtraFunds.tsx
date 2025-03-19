
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExtraFunds = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Extra Funds Management"
            subtitle="Allocate and manage additional funding"
          />
          
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Extra Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Extra funds allocation interface - coming soon</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ExtraFunds;
