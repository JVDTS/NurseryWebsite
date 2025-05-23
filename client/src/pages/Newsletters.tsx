import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Download, Search, Info, FileText } from "lucide-react";
import { format } from "date-fns";
import PageTransition from "@/components/PageTransition";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { fadeIn, fadeUp } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Newsletter {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  publishDate: string;
  nurseryId: number;
  tags?: string; // Optional tags field for categorizing newsletters
}

interface ThumbnailResponse {
  success: boolean;
  thumbnails: {
    id: number;
    thumbnailUrl: string;
  }[];
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
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
  
  // Get PDF thumbnails
  const { data: thumbnailsData, isLoading: thumbnailsLoading } = useQuery<ThumbnailResponse>({
    queryKey: ["/api/newsletters/thumbnails"],
  });

  // Filter newsletters based on selected location
  const filteredNewsletters = newsletters.filter(newsletter => {
    // Filter by search term
    const matchesSearch = 
      searchTerm === "" || 
      newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (newsletter.tags && newsletter.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by location
    const matchesLocation = selectedLocation === "all" || 
      (nurseries.find(n => n.id === newsletter.nurseryId)?.location.toLowerCase() === selectedLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });
  
  console.log("Filtered newsletters:", filteredNewsletters);

  const handlePreview = (fileUrl: string, title: string) => {
    // Open the PDF in a new tab
    toast({
      title: "Opening Preview",
      description: `Opening ${title}...`,
    });
    window.open(fileUrl, "_blank");
  };

  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery?.name || "Unknown Nursery";
  };

  const locations = [
    { value: "all", label: "All" },
    { value: "hayes", label: "CMC HAYES" },
    { value: "uxbridge", label: "CMC UXBRIDGE" },
    { value: "hounslow", label: "CMC HOUNSLOW" }
  ];

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
                  {/* Search Bar */}
                  <div className="mb-8 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search newsletters by title, description or tags..."
                      className="pl-10 w-full border-2 focus:border-primary h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Tabs for Nursery Locations */}
                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {locations.map((location) => (
                      <Button
                        key={location.value}
                        variant={selectedLocation === location.value ? "default" : "outline"}
                        onClick={() => setSelectedLocation(location.value)}
                        className="rounded-full py-2 px-6"
                      >
                        {location.label}
                      </Button>
                    ))}
                  </div>

                  {/* Newsletter Grid */}
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
                        Try changing your search term or filter criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredNewsletters.map((newsletter) => (
                        <div
                          key={newsletter.id}
                          className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Newsletter Preview Image */}
                          <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center border-b relative">
                            {thumbnailsLoading ? (
                              <Skeleton className="w-full h-full absolute" />
                            ) : thumbnailsData?.thumbnails.find(t => t.id === newsletter.id)?.thumbnailUrl ? (
                              <img 
                                src={thumbnailsData?.thumbnails.find(t => t.id === newsletter.id)?.thumbnailUrl} 
                                alt={`${newsletter.title} preview`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <FileText className="h-12 w-12 text-gray-400 mb-2" />
                                <span className="text-lg font-medium text-gray-500">Preview Unavailable</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Newsletter Title and Tags */}
                          <div className="p-3 border-b">
                            <h3 className="text-center font-medium text-gray-800 truncate">
                              {newsletter.title}
                            </h3>
                            <div className="flex flex-col items-center">
                              <p className="text-center text-sm text-gray-500">
                                {format(new Date(newsletter.publishDate), 'MMMM yyyy')}
                              </p>
                              {newsletter.tags && (
                                <span className="mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                  {newsletter.tags}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Newsletter Action */}
                          <div className="p-4 flex justify-center">
                            <Button
                              onClick={() => handlePreview(newsletter.fileUrl, newsletter.title)}
                              variant="outline"
                              className="border-gray-300"
                            >
                              PREVIEW
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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