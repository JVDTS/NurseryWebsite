import { motion } from "framer-motion";
import { Users, History, Award, Heart, Map, Clock } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & Director",
      image: "/images/team/sarah.jpg",
      bio: "With over 20 years of experience in early childhood education, Sarah founded Coat of Many Colours Nursery with a vision to create nurturing spaces where children can thrive. Her dedication to quality childcare has been the driving force behind our growth and success."
    },
    {
      name: "David Thompson",
      role: "Operations Manager",
      image: "/images/team/david.jpg",
      bio: "David oversees the day-to-day operations across all our nurseries, ensuring that our high standards are consistently maintained. His background in business management combined with his passion for education makes him an invaluable member of our leadership team."
    },
    {
      name: "Emma Patel",
      role: "Lead Early Years Educator",
      image: "/images/team/emma.jpg",
      bio: "Emma leads our curriculum development and staff training initiatives. With her degree in Early Childhood Studies and years of hands-on experience, she ensures that our educational approach remains innovative and child-centered."
    },
    {
      name: "Michael Roberts",
      role: "Family Liaison Officer",
      image: "/images/team/michael.jpg",
      bio: "Michael is the bridge between our nurseries and families. His warm, approachable nature and background in family support services help him to build strong relationships with parents and ensure that every child's individual needs are met."
    }
  ];
  
  const timeline = [
    {
      year: "2005",
      title: "Foundation",
      description: "Coat of Many Colours Nursery was founded with our first location in Hayes, starting with just 15 children and 3 staff members."
    },
    {
      year: "2010",
      title: "Growth & Recognition",
      description: "We expanded to our second location in Uxbridge and received our first 'Outstanding' rating from Ofsted."
    },
    {
      year: "2015",
      title: "Innovation in Education",
      description: "Implemented our unique curriculum approach, blending traditional learning with innovative STEAM activities."
    },
    {
      year: "2018",
      title: "Community Expansion",
      description: "Opened our third nursery in Hounslow to meet growing demand and launched our parent partnership program."
    },
    {
      year: "2022",
      title: "Award-Winning Excellence",
      description: "Recognized as 'Nursery Group of the Year' and celebrated serving over 1,000 families in our community."
    }
  ];

  // Core values based on FISEP acronym
  const fisepValues = [
    {
      letter: "F",
      title: "Fun",
      description: "We believe childhood should be joyful. We create playful environments where learning feels like an adventure."
    },
    {
      letter: "I",
      title: "Inclusive",
      description: "We welcome and celebrate children from all backgrounds, cultures, and abilities, ensuring everyone feels valued."
    },
    {
      letter: "S",
      title: "Spiritual",
      description: "We nurture children's sense of wonder, helping them develop their understanding of themselves and the world around them."
    },
    {
      letter: "E",
      title: "Excellence",
      description: "We strive for the highest standards in everything we do, from our facilities to our educational programs."
    },
    {
      letter: "P",
      title: "Passion",
      description: "Our dedicated team brings enthusiasm and commitment to supporting each child's unique journey of growth."
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Nurturing Care",
      description: "We create environments where children feel safe, loved, and supported in their development journey."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "We strive for the highest standards in everything we do, from our facilities to our educational programs."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "We build strong partnerships with families and the wider community to provide holistic support for children."
    },
    {
      icon: <Map className="h-8 w-8" />,
      title: "Diversity",
      description: "We celebrate and respect the uniqueness of each child, embracing all cultures, abilities, and backgrounds."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Consistency",
      description: "We provide reliable, consistent care that families can depend on, with clear communication and expectations."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow pt-28">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                About Coat of Many Colours
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Creating nurturing environments where childhood thrives through play, discovery, and care.
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a href="#team" className="px-6 py-3 bg-primary text-white rounded-full font-heading font-semibold shadow-md hover:shadow-lg transition-all">
                  Meet Our Team
                </a>
                <a href="#our-values" className="px-6 py-3 bg-primary/90 text-white rounded-full font-heading font-semibold shadow-md hover:shadow-lg transition-all">
                  Our Values
                </a>
                <a href="#history" className="px-6 py-3 border border-primary text-primary rounded-full font-heading font-semibold hover:bg-primary/5 transition-colors">
                  Our Journey
                </a>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Story</h2>
                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
              </motion.div>
              
              <motion.div variants={fadeUp} className="prose prose-lg max-w-none text-muted-foreground">
                <p>
                  Coat of Many Colours Nursery began with a simple yet profound vision: to create childcare 
                  settings where every child is valued, respected, and empowered to reach their full potential. 
                  Founded in 2005 by Sarah Johnson, a passionate advocate for early years education, our first 
                  nursery opened its doors in Hayes with just a small team of dedicated educators.
                </p>
                <p>
                  The name 'Coat of Many Colours' was chosen to represent our commitment to celebrating diversity 
                  and the unique qualities of each child. Just as a coat of many colours is made up of different 
                  fabrics and patterns woven together to create something beautiful, our nurseries bring together 
                  children from all backgrounds to form vibrant, inclusive communities.
                </p>
                <p>
                  Over the years, we've grown from a single nursery to three thriving locations across West London, 
                  each maintaining the warm, family atmosphere that has become our hallmark. Our growth has been 
                  organic, driven by the trust and recommendations of the families we serve.
                </p>
                <p>
                  While we've expanded, our core values remain unchanged. We believe in nurturing the whole child, 
                  supporting not just their academic development but also their social, emotional, and physical 
                  wellbeing. Our play-based approach encourages curiosity, creativity, and a love of learning that 
                  we hope will stay with children throughout their lives.
                </p>
                <p>
                  Today, Coat of Many Colours is proud to be a trusted provider of exceptional childcare, known for 
                  our outstanding quality, dedicated staff, and the lasting relationships we build with families. 
                  As we look to the future, we remain committed to our founding principles while continuously 
                  evolving to meet the changing needs of children and families in our community.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Our FISEP Values Section */}
        <section className="py-20" id="our-values">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Values: FISEP</h2>
                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                  Our values are embodied in the acronym FISEP, which represents the pillars of our approach to nurturing children's development
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                {fisepValues.map((value, index) => {
                  // Assign each value a different color
                  const colors = [
                    { bg: "bg-rainbow-red", text: "text-rainbow-red" },
                    { bg: "bg-rainbow-orange", text: "text-rainbow-orange" },
                    { bg: "bg-rainbow-green", text: "text-rainbow-green" },
                    { bg: "bg-rainbow-blue", text: "text-rainbow-blue" },
                    { bg: "bg-rainbow-violet", text: "text-rainbow-violet" }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <motion.div
                      key={value.letter}
                      variants={childFadeIn}
                      custom={index}
                      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className={`${color.bg} text-white text-4xl font-bold flex items-center justify-center h-20`}>
                        {value.letter}
                      </div>
                      <div className="p-6">
                        <h3 className={`text-xl font-heading font-bold mb-3 ${color.text}`}>{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <motion.p 
                variants={fadeUp}
                className="text-center text-lg text-muted-foreground max-w-3xl mx-auto"
              >
                These values form the foundation of everything we do at Coat of Many Colours Nursery, 
                guiding our approach to childcare, education, and family partnerships.
              </motion.p>
            </motion.div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl font-heading font-bold text-rainbow-green mb-4">Our Core Values</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-rainbow-blue via-rainbow-green to-rainbow-yellow mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  These principles guide everything we do at Coat of Many Colours Nursery
                </p>
              </motion.div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {values.map((value, index) => {
                  // Rainbow colors for core values
                  const colors = [
                    { bg: "bg-rainbow-green/10", text: "text-rainbow-green", icon: "text-rainbow-green" },
                    { bg: "bg-rainbow-blue/10", text: "text-rainbow-blue", icon: "text-rainbow-blue" },
                    { bg: "bg-rainbow-orange/10", text: "text-rainbow-orange", icon: "text-rainbow-orange" },
                    { bg: "bg-rainbow-indigo/10", text: "text-rainbow-indigo", icon: "text-rainbow-indigo" },
                    { bg: "bg-rainbow-teal/10", text: "text-rainbow-teal", icon: "text-rainbow-teal" }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <motion.div
                      key={value.title}
                      variants={childFadeIn}
                      custom={index}
                      className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-all"
                    >
                      <div className={`h-16 w-16 rounded-full ${color.bg} flex items-center justify-center mb-6 ${color.icon}`}>
                        {value.icon}
                      </div>
                      <h3 className={`text-xl font-heading font-bold mb-4 ${color.text}`}>{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Our Journey Timeline Section */}
        <section id="history" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl font-heading font-bold text-rainbow-orange mb-4">Our Journey</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-rainbow-red via-rainbow-orange to-rainbow-yellow mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  The milestones that have shaped Coat of Many Colours Nursery
                </p>
              </motion.div>
              
              <div className="relative">
                {/* Timeline center line */}
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-primary/20 transform -translate-x-1/2"></div>
                
                <div className="space-y-16">
                  {timeline.map((event, index) => {
                    // Timeline colors
                    const colors = [
                      { bg: "bg-rainbow-red", border: "border-rainbow-red", text: "text-rainbow-red" },
                      { bg: "bg-rainbow-blue", border: "border-rainbow-blue", text: "text-rainbow-blue" },
                      { bg: "bg-rainbow-green", border: "border-rainbow-green", text: "text-rainbow-green" },
                      { bg: "bg-rainbow-violet", border: "border-rainbow-violet", text: "text-rainbow-violet" },
                      { bg: "bg-rainbow-orange", border: "border-rainbow-orange", text: "text-rainbow-orange" }
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <motion.div 
                        key={event.year}
                        variants={childFadeIn}
                        custom={index}
                        className="relative"
                      >
                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}>
                          {/* Timeline center dot */}
                          <div className={`absolute left-1/2 top-10 w-5 h-5 bg-white border-4 ${color.border} rounded-full transform -translate-x-1/2 z-20`}></div>
                          
                          {/* Content card */}
                          <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                            <div className="bg-white shadow-md rounded-lg p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-all">
                              <div className={`${color.bg} text-white text-lg font-bold rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
                                {event.year}
                              </div>
                              <h3 className={`text-xl font-heading font-bold mb-2 ${color.text}`}>{event.title}</h3>
                              <p className="text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                          
                          {/* Empty space for the other side */}
                          <div className="md:w-1/2"></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Our Team Section */}
        <section id="team" className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl font-heading font-bold text-rainbow-blue mb-4">Meet Our Leadership Team</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-rainbow-indigo via-rainbow-blue to-rainbow-teal mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  The passionate individuals guiding our vision and operations
                </p>
              </motion.div>
              
              <div className="grid gap-8 md:grid-cols-2">
                {teamMembers.map((member, index) => {
                  // Team member colors
                  const colors = [
                    { bg: "bg-rainbow-blue/10", text: "text-rainbow-blue", accent: "bg-rainbow-blue" },
                    { bg: "bg-rainbow-green/10", text: "text-rainbow-green", accent: "bg-rainbow-green" },
                    { bg: "bg-rainbow-teal/10", text: "text-rainbow-teal", accent: "bg-rainbow-teal" }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <motion.div 
                      key={member.name}
                      variants={childFadeIn}
                      custom={index}
                      className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 mx-auto md:mx-0">
                        <div className={`w-full h-full rounded-full ${color.bg} flex items-center justify-center ${color.text} text-4xl font-bold`}>
                          {member.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-xl font-heading font-bold ${color.text} mb-1`}>{member.name}</h3>
                        <p className={`font-medium ${color.text}/70 mb-4`}>{member.role}</p>
                        <p className="text-muted-foreground">{member.bio}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <motion.div variants={fadeUp} className="text-center mt-16">
                <p className="text-lg text-muted-foreground mb-8">
                  In addition to our leadership team, we have over 40 dedicated staff members across our nurseries,
                  including qualified early years educators, assistants, chefs, and administrative personnel.
                </p>
                <a href="#contact" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-heading font-semibold shadow-md hover:shadow-lg transition-all">
                  Join Our Team
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Accreditations & Partnerships */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-rainbow-violet mb-4">Our Accreditations & Partnerships</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-rainbow-violet via-rainbow-pink to-rainbow-red mx-auto mb-8"></div>
              </motion.div>
              
              <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-md p-8 border border-gray-200 hover:shadow-lg transition-all">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-4">Accreditations</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-blue/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-blue"></div>
                        </div>
                        <span>Ofsted Outstanding Rating (2022)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-green/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-green"></div>
                        </div>
                        <span>Early Years Quality Mark (EYQM)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-orange/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-orange"></div>
                        </div>
                        <span>National Day Nurseries Association (NDNA) Member</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-violet/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-violet"></div>
                        </div>
                        <span>Children's Food Trust Early Years Nutrition Partnership</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-4">Partnerships</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-red/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-red"></div>
                        </div>
                        <span>Local primary schools transition program</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-pink/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-pink"></div>
                        </div>
                        <span>Local health visitor service</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-yellow/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-yellow"></div>
                        </div>
                        <span>Early Years Alliance</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-rainbow-teal/10 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-rainbow-teal"></div>
                        </div>
                        <span>Local community groups and charities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}