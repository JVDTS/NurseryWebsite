import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ManageNewsletters from '@/components/admin/ManageNewsletters';
import ManageGallery from '@/components/admin/ManageGallery';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, ImageIcon } from 'lucide-react';

export default function MediaManager() {
  const [activeTab, setActiveTab] = useState<'newsletters' | 'gallery'>('newsletters');

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Media Manager</h1>
              <p className="text-gray-500">
                Manage newsletters and gallery images across all nurseries.
              </p>
            </div>
            
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'newsletters' | 'gallery')}
            >
              <TabsList>
                <TabsTrigger value="newsletters" className="flex items-center gap-1">
                  <Newspaper className="h-4 w-4" />
                  <span>Newsletters</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>Gallery</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <TabsContent value="newsletters" className="mt-0 space-y-0">
            <ManageNewsletters />
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-0 space-y-0">
            <ManageGallery />
          </TabsContent>
        </div>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}