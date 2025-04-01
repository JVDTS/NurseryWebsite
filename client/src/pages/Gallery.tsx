import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Image, Calendar, MapPin, Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fadeUp, staggerContainer, childFadeIn } from '@/lib/animations';

// Types for gallery images from server
interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  nurseryId: number;
  createdAt: string;
}

interface NurseryLocation {
  id: number;
  name: string;
  location: string;
}

export default function GalleryPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Fetch nursery locations
  const { data: nurseriesData } = useQuery<{ nurseries: NurseryLocation[] }>({
    queryKey: ['/api/nurseries'],
  });
  
  const nurseries = nurseriesData?.nurseries || [];

  // Use individual queries for each nursery to get gallery images
  const hayesQuery = useQuery<{ images: GalleryImage[] }>({
    queryKey: ['/api/nurseries/hayes/gallery'],
    enabled: locationFilter === 'all' || locationFilter === 'hayes',
  });

  const uxbridgeQuery = useQuery<{ images: GalleryImage[] }>({
    queryKey: ['/api/nurseries/uxbridge/gallery'],
    enabled: locationFilter === 'all' || locationFilter === 'uxbridge',
  });

  const hounslowQuery = useQuery<{ images: GalleryImage[] }>({
    queryKey: ['/api/nurseries/hounslow/gallery'],
    enabled: locationFilter === 'all' || locationFilter === 'hounslow',
  });

  // Combine all gallery images
  const allImages = [
    ...(hayesQuery.data?.images || []),
    ...(uxbridgeQuery.data?.images || []),
    ...(hounslowQuery.data?.images || []),
  ];

  // Filter images based on search term and location
  const filteredImages = allImages.filter((image) => {
    const matchesSearch = 
      searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (locationFilter === 'all') return matchesSearch;
    
    // Find the nursery that matches the image's nurseryId
    const nursery = nurseries.find(n => n.id === image.nurseryId);
    return matchesSearch && nursery?.location.toLowerCase() === locationFilter.toLowerCase();
  });

  // Sort images by most recent first
  const sortedImages = [...filteredImages].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Function to get nursery name from nurseryId
  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery ? nursery.name : 'Unknown Nursery';
  };

  // Loading state for all queries
  const isLoading = hayesQuery.isLoading || uxbridgeQuery.isLoading || hounslowQuery.isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Header */}
        <motion.section 
          className="pt-32 pb-16 bg-primary/10"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center shadow-md">
                <div className="text-primary text-3xl">
                  <Image />
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Our Gallery</h1>
                <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
                  Explore moments captured at our nurseries showcasing events, activities, and the joy of learning
                </p>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Gallery Filter Section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select 
                  value={locationFilter} 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="hayes">Hayes</SelectItem>
                    <SelectItem value="uxbridge">Uxbridge</SelectItem>
                    <SelectItem value="hounslow">Hounslow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>
        
        {/* Gallery Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              ref={ref}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {isLoading ? (
                // Loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div 
                    key={`skeleton-${index}`} 
                    variants={childFadeIn}
                    className="bg-muted rounded-lg overflow-hidden h-[300px] animate-pulse"
                  />
                ))
              ) : sortedImages.length === 0 ? (
                // Empty state
                <div className="col-span-full py-16 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium">No gallery images found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm || locationFilter !== 'all' 
                      ? "Try changing your search or filter settings."
                      : "Check back soon as we update our gallery with new images."}
                  </p>
                </div>
              ) : (
                // Gallery grid
                sortedImages.map((image) => (
                  <motion.div 
                    key={image.id} 
                    variants={childFadeIn}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(image);
                        }}
                      >
                        View
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-lg mb-1 text-foreground line-clamp-1">{image.title}</h3>
                      {image.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{image.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{getNurseryName(image.nurseryId)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-heading">{selectedImage.title}</DialogTitle>
                {selectedImage.description && (
                  <DialogDescription className="text-sm md:text-base mt-2">
                    {selectedImage.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="mt-2 h-full w-full max-h-[70vh] overflow-hidden rounded-md bg-muted">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{getNurseryName(selectedImage.nurseryId)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}