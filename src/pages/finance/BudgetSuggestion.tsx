
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BudgetSuggestion = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Budget Suggestions"
            subtitle="Propose and manage budget suggestions"
          />
          
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Budget suggestion management interface - coming soon</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BudgetSuggestion;
