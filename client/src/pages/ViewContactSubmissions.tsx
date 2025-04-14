import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  nurseryLocation: string;
  message: string;
  createdAt: string;
}

export default function ViewContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/contact-submissions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contact submissions');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setSubmissions(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching contact submissions:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: 'Failed to load contact submissions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-28">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-heading font-bold mb-4 text-center">Contact Form Submissions</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Click on any row to view the full message details</p>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No contact form submissions found.</p>
              <p className="text-gray-400 mt-2">Try submitting a form from the contact section!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nursery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setIsDialogOpen(true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">{submission.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{submission.name}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{submission.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{submission.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${submission.nurseryLocation === 'hayes' ? 'bg-rainbow-red/20 text-rainbow-red' : 
                          submission.nurseryLocation === 'uxbridge' ? 'bg-rainbow-blue/20 text-rainbow-blue' : 
                          'bg-rainbow-green/20 text-rainbow-green'}`}>
                          {submission.nurseryLocation.charAt(0).toUpperCase() + submission.nurseryLocation.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(submission.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="max-w-xs truncate" title={submission.message}>
                          {submission.message.length > 50 
                            ? `${submission.message.substring(0, 50)}...` 
                            : submission.message}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Message from {selectedSubmission?.name}</DialogTitle>
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
            <div>
              <h4 className="font-medium text-sm text-gray-500">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-sm font-medium">Email:</span> 
                  <span className="text-sm text-blue-600">{selectedSubmission?.email}</span>
                </div>
                {selectedSubmission?.phone && (
                  <div>
                    <span className="text-sm font-medium">Phone:</span> 
                    <span className="text-sm">{selectedSubmission?.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500">Message</h4>
              <div className="mt-1 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedSubmission?.message}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}