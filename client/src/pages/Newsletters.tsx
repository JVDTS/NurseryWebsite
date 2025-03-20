import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Download, Info } from "lucide-react";
import { format } from "date-fns";
import PageTransition from "@/components/PageTransition";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeIn, fadeUp } from "@/lib/animations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Newsletter {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  publishDate: string;
  nurseryId: number;
}

interface Nursery {
  id: number;
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  emailAddress: string;
  description: string;
  openingHours: string;
  ageRange: string;
}

export default function NewslettersPage() {
  const [selectedNursery, setSelectedNursery] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const { toast } = useToast();

  // Get nurseries data
  const { data: nurseryData } = useQuery<{ success: boolean, nurseries: Nursery[] }>({
    queryKey: ["/api/nurseries"],
  });
  
  // Extract nurseries array from response or use empty array as fallback
  const nurseries = nurseryData?.nurseries || [];

  // Get all newsletters data
  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filter newsletters based on selected nursery and month
  const filteredNewsletters = newsletters.filter(newsletter => {
    const newsletterDate = new Date(newsletter.publishDate);
    const newsletterMonth = newsletterDate.getMonth().toString();
    
    if (selectedNursery === "all") {
      return selectedMonth === "all" || newsletterMonth === selectedMonth;
    } else {
      const nurseryId = parseInt(selectedNursery);
      return newsletter.nurseryId === nurseryId && 
        (selectedMonth === "all" || newsletterMonth === selectedMonth);
    }
  });

  const handleDownload = (fileUrl: string, title: string) => {
    // In a real application, this would trigger a download
    toast({
      title: "Download Started",
      description: `Downloading ${title}...`,
    });
    window.open(fileUrl, "_blank");
  };

  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery?.name || "Unknown Nursery";
  };

  const getNurseryColor = (nurseryId: number) => {
    const locations = ["hayes", "uxbridge", "hounslow"];
    const colors = ["text-blue-500", "text-green-500", "text-purple-500"];
    
    const nursery = nurseries.find(n => n.id === nurseryId);
    if (!nursery) return colors[0];
    
    const locationIndex = locations.findIndex(
      loc => nursery.location.toLowerCase() === loc
    );
    
    return locationIndex >= 0 ? colors[locationIndex] : colors[0];
  };

  return (
    <>
      <NavBar />
      <PageTransition>
        <div className="pt-24 pb-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                Nursery Newsletters
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Stay updated with what's happening at our nurseries. Browse our monthly newsletters to
                learn about our activities, events, and important announcements.
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto">
              <motion.div 
                className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="p-6">
                  <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h2 className="text-2xl font-heading font-bold">Browse Newsletters</h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <Select
                        value={selectedNursery}
                        onValueChange={setSelectedNursery}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select Nursery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Nurseries</SelectItem>
                          {nurseries.map(nursery => (
                            <SelectItem key={nursery.id} value={nursery.id.toString()}>
                              {nursery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Months</SelectItem>
                          {months.map((month, index) => (
                            <SelectItem key={month} value={index.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="grid" className="w-full">
                      {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                          {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="bg-gray-100 rounded-lg h-60"></div>
                          ))}
                        </div>
                      ) : filteredNewsletters.length === 0 ? (
                        <div className="text-center py-16">
                          <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-medium text-gray-700 mb-2">
                            No newsletters found
                          </h3>
                          <p className="text-gray-500">
                            Try changing your filter criteria or check back later.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredNewsletters.map((newsletter) => (
                            <motion.div 
                              key={newsletter.id}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              whileHover={{ y: -5 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-sm font-medium ${getNurseryColor(newsletter.nurseryId)}`}>
                                    {getNurseryName(newsletter.nurseryId)}
                                  </span>
                                  <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    {format(new Date(newsletter.publishDate), 'MMM yyyy')}
                                  </div>
                                </div>
                                <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">
                                  {newsletter.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                  {newsletter.description}
                                </p>
                                <button
                                  onClick={() => handleDownload(newsletter.fileUrl, newsletter.title)}
                                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download PDF
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="list" className="w-full">
                      {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="h-16 bg-gray-100 rounded-lg"></div>
                          ))}
                        </div>
                      ) : filteredNewsletters.length === 0 ? (
                        <div className="text-center py-16">
                          <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-medium text-gray-700 mb-2">
                            No newsletters found
                          </h3>
                          <p className="text-gray-500">
                            Try changing your filter criteria or check back later.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredNewsletters.map((newsletter) => (
                            <motion.div 
                              key={newsletter.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${getNurseryColor(newsletter.nurseryId)}`}>
                                    {getNurseryName(newsletter.nurseryId)}
                                  </span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(newsletter.publishDate), 'MMMM yyyy')}
                                  </span>
                                </div>
                                <h3 className="font-heading font-bold text-gray-900">{newsletter.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{newsletter.description}</p>
                              </div>
                              <button
                                onClick={() => handleDownload(newsletter.fileUrl, newsletter.title)}
                                className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm whitespace-nowrap"
                              >
                                <Download className="h-4 w-4 mr-1.5" />
                                Download
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
}