import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async (isManualRefresh = false) => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact-submissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Sort submissions by date (newest first)
        const sortedSubmissions = [...data.data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setSubmissions(sortedSubmissions);
        setLastRefreshed(new Date());
        
        // Show success toast only on manual refresh
        if (isManualRefresh) {
          toast({
            title: 'Success',
            description: `Loaded ${sortedSubmissions.length} submission${sortedSubmissions.length !== 1 ? 's' : ''}`,
            variant: 'default'
          });
        }
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
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Format date to readable string with proper timezone handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Format date with proper day/month/year and localized time
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-28">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-heading font-bold mb-4 text-center">Contact Form Submissions</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              {lastRefreshed && (
                <span>
                  Last updated: {formatDate(lastRefreshed.toISOString())} • 
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchSubmissions(true)}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
          
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
                    <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50">
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-left hover:text-primary hover:underline focus:outline-none">
                              <div className="max-w-xs truncate">
                                {submission.message.length > 50 
                                  ? `${submission.message.substring(0, 50)}...` 
                                  : submission.message}
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span>Message from {submission.name}</span>
                                <span className="text-sm font-normal text-gray-500">
                                  ({formatDate(submission.createdAt)})
                                </span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                              {submission.message}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <p><strong>Email:</strong> {submission.email}</p>
                              <p><strong>Phone:</strong> {submission.phone || 'Not provided'}</p>
                              <p><strong>Nursery:</strong> {submission.nurseryLocation.charAt(0).toUpperCase() + submission.nurseryLocation.slice(1)}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
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
    </div>
  );
}