import { useState, useEffect } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import UpcomingEvents from "@/components/nursery/UpcomingEvents";
import Newsletter from "@/components/nursery/Newsletter";
import { 
  Trees, 
  Leaf, 
  CloudSun, 
  BookOpen, 
  PawPrint, 
  ShieldCheck,
  HeartHandshake,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HounslowNursery() {
  const [events, setEvents] = useState<any[]>([]);
  
  // Fetch events from the API
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/nurseries/hounslow/events'],
    async queryFn() {
      const response = await fetch('/api/nurseries/hounslow/events');
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
      icon: <Trees className="text-hounslow w-6 h-6" />,
      title: "Forest School Area",
      description: "Dedicated outdoor learning environment where children connect with nature and develop confidence through hands-on activities."
    },
    {
      icon: <Leaf className="text-hounslow w-6 h-6" />,
      title: "Community Garden",
      description: "Child-friendly gardening spaces where children learn about growing plants, sustainability, and healthy eating."
    },
    {
      icon: <CloudSun className="text-hounslow w-6 h-6" />,
      title: "All-Weather Play Zone",
      description: "Specially designed outdoor area for play in all weather conditions, encouraging year-round outdoor learning."
    },
    {
      icon: <BookOpen className="text-hounslow w-6 h-6" />,
      title: "Nature Library",
      description: "Collection of nature-focused books and resources to deepen children's understanding of the natural world."
    },
    {
      icon: <PawPrint className="text-hounslow w-6 h-6" />,
      title: "Wildlife Observation Area",
      description: "Safe spaces where children can observe local wildlife, building respect and appreciation for animals."
    },
    {
      icon: <HeartHandshake className="text-hounslow w-6 h-6" />,
      title: "Community Connection",
      description: "Regular engagement with the local community through visits, partnerships and joint environmental projects."
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1508184964240-ee96bb9677a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];

  return (
    <NurseryLayout 
      title="Hounslow Nursery" 
      heroImage="https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      themeColor="hounslow"
    >
      <NurseryDescription 
        description="Our Hounslow nursery is a nature-focused environment with extensive outdoor play areas and forest school activities. Designed for children aged 1-5, our approach emphasizes environmental awareness, exploration, and adventure. Children spend significant time outdoors in all seasons, developing resilience, physical skills, and a deep connection to the natural world, complemented by thoughtful indoor spaces that extend their learning."
        imageSrc="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="488, 490 Great West Rd, Hounslow TW5 0TA"
        hoursText="Monday - Friday: 7:30 AM - 6:00 PM"
        phoneNumber="01895 272885"
        mapImage="https://images.unsplash.com/photo-1505322747495-6afdd3b70760?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryGallery images={galleryImages} />
      
      <UpcomingEvents events={events} nurseryName="Hounslow" />
      
      <Newsletter />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold mb-4">Downloadable Resources</h2>
            <p className="text-gray-600 mb-8">
              Download useful documents and resources for parents at our Hounslow nursery
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-hounslow/10 p-3 rounded-full mr-4">
                <Download className="text-hounslow w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Hounslow Nursery Policies</h3>
                <p className="text-gray-500 text-sm">PDF document • 2.3MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-hounslow/10 p-3 rounded-full mr-4">
                <Download className="text-hounslow w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Forest School Activities</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.7MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-hounslow/10 p-3 rounded-full mr-4">
                <Download className="text-hounslow w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Seasonal Menu Sample</h3>
                <p className="text-gray-500 text-sm">PDF document • 0.9MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-hounslow/10 p-3 rounded-full mr-4">
                <Download className="text-hounslow w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Nature Journal Templates</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.1MB</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </NurseryLayout>
  );
}