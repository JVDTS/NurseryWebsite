import { useState, useEffect } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import UpcomingEvents from "@/components/nursery/UpcomingEvents";
import Newsletter from "@/components/nursery/Newsletter";
import { 
  Brain, 
  BookOpen, 
  Puzzle, 
  Trees, 
  HeartPulse, 
  ShieldCheck, 
  Heart,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UxbridgeNursery() {
  const [events, setEvents] = useState<any[]>([]);
  
  // Fetch events from the API
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/nurseries/uxbridge/events'],
    async queryFn() {
      const response = await fetch('/api/nurseries/uxbridge/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    }
  });
  
  useEffect(() => {
    if (eventsData && eventsData.events) {
      // Transform the events data to match the expected format
      const formattedEvents = eventsData.events.map((event: any) => ({
        title: event.title,
        date: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: event.time,
        location: event.location,
        description: event.description
      }));
      setEvents(formattedEvents);
    }
  }, [eventsData]);

  const facilities = [
    {
      icon: <Brain className="text-uxbridge w-6 h-6" />,
      title: "Sensory Room",
      description: "A dedicated sensory room designed to stimulate children's senses and support their cognitive development.",
      image: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      icon: <BookOpen className="text-uxbridge w-6 h-6" />,
      title: "Learning Laboratory",
      description: "Interactive space with educational materials to encourage exploration and discovery.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      icon: <Puzzle className="text-uxbridge w-6 h-6" />,
      title: "STEM Discovery Zone",
      description: "Area equipped with age-appropriate science and math materials to foster early STEM skills.",
      image: "https://images.unsplash.com/photo-1537655780520-1e392ead81f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      icon: <Trees className="text-uxbridge w-6 h-6" />,
      title: "Nature Garden",
      description: "Carefully designed outdoor space with plants, small wildlife habitats, and natural play elements.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      icon: <HeartPulse className="text-uxbridge w-6 h-6" />,
      title: "Physical Development Area",
      description: "Space dedicated to developing gross motor skills, balance, and coordination through active play.",
      image: "https://images.unsplash.com/photo-1596460107916-430662021049?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      icon: <ShieldCheck className="text-uxbridge w-6 h-6" />,
      title: "Secure Environment",
      description: "State-of-the-art security systems and protocols to ensure children's safety at all times.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

  // Fetch gallery images from API
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Fetch gallery images from our backend API
  const { data: galleryData, isLoading: galleryLoading } = useQuery({
    queryKey: ['/api/nurseries/uxbridge/gallery'],
    async queryFn() {
      try {
        const response = await fetch('/api/nurseries/uxbridge/gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch gallery images');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        return { images: [] };
      }
    }
  });
  
  // Update gallery images when data is loaded
  useEffect(() => {
    if (galleryData && galleryData.images) {
      // Extract image URLs from the response
      const imageUrls = galleryData.images.map((image: any) => image.imageUrl || image.url);
      setGalleryImages(imageUrls);
    }
  }, [galleryData]);
  
  // Fallback images if no gallery images are available
  const fallbackImages = [
    "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];
  
  // Use uploaded images if available, otherwise use fallback images
  const displayGalleryImages = galleryImages.length > 0 ? galleryImages : fallbackImages;

  return (
    <NurseryLayout 
      title="Uxbridge Nursery" 
      heroImage="https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      themeColor="uxbridge"
    >
      <NurseryDescription 
        description="Our Uxbridge nursery is a cozy, innovative environment with state-of-the-art learning facilities and a dedicated sensory room. We cater to children aged 2-5, providing a nurturing space where curious minds flourish. Our approach focuses on hands-on learning experiences that develop cognitive, social, and emotional skills while celebrating each child's unique personality and learning style."
        imageSrc="https://images.unsplash.com/photo-1527490087278-9c75be0b8052?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="4 New Windsor Street, Uxbridge, UB8 2TU"
        hoursText="Monday - Friday: 7:30 AM - 6:00 PM"
        phoneNumber="01895 272885"
        mapImage="/images/maps/uxbridge-map.png"
      />
      
      <NurseryGallery nurseryLocation="uxbridge" />
      
      <UpcomingEvents events={events} nurseryName="Uxbridge" />
      
      <Newsletter />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold mb-4">Downloadable Resources</h2>
            <p className="text-gray-600 mb-8">
              Download useful documents and resources for parents at our Uxbridge nursery
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <a href="/documents/Terms-and-Conditions.docx" download="Coat-of-Many-Colours-Terms-and-Conditions.docx" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Terms and Conditions</h3>
                <p className="text-gray-500 text-sm">Word document • Download</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">STEM Activities Guide</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.5MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Weekly Menu Sample</h3>
                <p className="text-gray-500 text-sm">PDF document • 0.8MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Parent Handbook</h3>
                <p className="text-gray-500 text-sm">PDF document • 3.2MB</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </NurseryLayout>
  );
}