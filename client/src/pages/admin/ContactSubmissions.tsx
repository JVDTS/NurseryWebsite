import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, Phone, MapPin, User } from "lucide-react";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  nurseryLocation: string;
  message: string;
  createdAt: string;
}

export default function AdminContactSubmissions() {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: ContactSubmission[] }>({
    queryKey: ['/api/contact-submissions'],
    onSuccess: (data) => {
      // Successfully fetched data
    },
    onError: (err: Error) => {
      console.error('Error fetching contact submissions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive'
      });
    }
  });

  // Format date to readable string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return dateString;
    }
  };

  // Get location class for styling based on nursery location
  const getLocationClass = (location: string) => {
    switch(location.toLowerCase()) {
      case 'hayes': return 'bg-rainbow-red/20 text-rainbow-red';
      case 'uxbridge': return 'bg-rainbow-blue/20 text-rainbow-blue';
      case 'hounslow': return 'bg-rainbow-green/20 text-rainbow-green';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Contact Submissions">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
                An error occurred while loading contact submissions.
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No contact form submissions found.</p>
                <p className="text-gray-400 mt-2">Submissions will appear here once visitors use the contact form.</p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-gray-50 border-b text-gray-500 text-sm">
                  Showing {data.data.length} contact submissions. Click on a row to view full details.
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nursery</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.data.map((submission) => (
                        <tr 
                          key={submission.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setIsDialogOpen(true);
                          }}
                        >
                          <td className="px-4 py-3 text-sm text-gray-500">{submission.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{submission.name}</td>
                          <td className="px-4 py-3 text-sm text-blue-600">{submission.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationClass(submission.nurseryLocation)}`}>
                              {submission.nurseryLocation.charAt(0).toUpperCase() + submission.nurseryLocation.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(submission.createdAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="max-w-xs truncate" title={submission.message}>
                              {submission.message.length > 40 
                                ? `${submission.message.substring(0, 40)}...` 
                                : submission.message}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Message Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Message from {selectedSubmission?.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {selectedSubmission && (
                  <>
                    Submitted on {formatDate(selectedSubmission.createdAt)}
                    {' '}for {selectedSubmission.nurseryLocation.charAt(0).toUpperCase() + selectedSubmission.nurseryLocation.slice(1)} nursery
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              {/* Contact details */}
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Email</div>
                    <div className="text-sm text-blue-600">{selectedSubmission?.email}</div>
                  </div>
                </div>
                
                {selectedSubmission?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Phone</div>
                      <div className="text-sm">{selectedSubmission?.phone}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Preferred Nursery</div>
                    <div className="text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedSubmission ? getLocationClass(selectedSubmission.nurseryLocation) : ''}`}>
                        {selectedSubmission?.nurseryLocation.charAt(0).toUpperCase() + selectedSubmission?.nurseryLocation.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message content */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
                <div className="p-4 bg-white border rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSubmission?.message}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}