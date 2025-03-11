import { motion } from "framer-motion";
import { Target, BookOpen, Smile, Users, Shield, Leaf } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function MissionPage() {
  const missionPillars = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Educational Excellence",
      description: "We deliver a curriculum that balances structured learning with play-based discovery, nurturing each child's natural curiosity and love for learning."
    },
    {
      icon: <Smile className="h-8 w-8" />,
      title: "Emotional Wellbeing",
      description: "We create environments where children feel safe, valued, and emotionally secure, building the foundation for positive mental health and resilience."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Connection",
      description: "We foster strong partnerships with families and the wider community, recognizing that children thrive when surrounded by collaborative support networks."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe & Nurturing Spaces",
      description: "We provide secure, stimulating environments that encourage exploration and independence while maintaining the highest standards of safety and care."
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Sustainability & Respect",
      description: "We teach children to respect themselves, others, and the natural world, instilling values of environmental stewardship and global citizenship."
    }
  ];
  
  const educationalApproach = [
    {
      title: "Child-led Learning",
      description: "We follow children's interests and developmental stages, allowing them to direct their learning journey with guidance from skilled educators.",
      color: "bg-rose-100 text-rose-600"
    },
    {
      title: "STEAM Integration",
      description: "We incorporate Science, Technology, Engineering, Arts, and Mathematics into everyday activities, laying foundations for future academic success.",
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Language & Literacy",
      description: "We immerse children in language-rich environments with stories, songs, and conversations to develop strong communication skills from an early age.",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Physical Development",
      description: "We provide daily opportunities for both fine and gross motor skill development through indoor and outdoor play, dance, and structured activities.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Creative Expression",
      description: "We encourage artistic exploration through music, visual arts, drama, and imaginative play, helping children express themselves confidently.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Social Skills",
      description: "We foster positive relationships, teaching children to collaborate, negotiate, and develop empathy through guided social interactions and play.",
      color: "bg-teal-100 text-teal-600"
    }
  ];
  
  const goals = [
    {
      title: "Quality Excellence",
      current: "Maintaining 'Outstanding' Ofsted ratings across all our nurseries.",
      future: "Becoming a center of excellence for early years education, sharing best practices with other providers."
    },
    {
      title: "Staff Development",
      current: "Regular training and professional development for all team members.",
      future: "Establishing our own early years training academy for continuous professional growth."
    },
    {
      title: "Family Support",
      current: "Parent workshops and resources to support home learning environments.",
      future: "Creating comprehensive family centers offering extended support services."
    },
    {
      title: "Inclusive Practices",
      current: "Accommodating children with diverse needs and backgrounds.",
      future: "Pioneering innovative approaches to inclusive early education."
    },
    {
      title: "Sustainable Operations",
      current: "Incorporating eco-friendly practices into daily nursery operations.",
      future: "Achieving carbon-neutral status across all our facilities."
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
                Our Mission & Vision
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Guiding principles that inspire everything we do at Coat of Many Colours Nursery
              </motion.p>
            </div>
          </div>
        </section>
        
        {/* Mission & Vision Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="grid gap-16 md:grid-cols-2">
                <motion.div variants={fadeUp} className="flex flex-col">
                  <div className="bg-white rounded-xl shadow-md p-8 border border-primary/10 h-full flex flex-col">
                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Mission</h2>
                    <div className="prose prose-lg max-w-none text-muted-foreground flex-grow">
                      <p>
                        To provide exceptional care and education in nurturing environments where children are 
                        empowered to discover, grow, and thrive.
                      </p>
                      <p>
                        We are committed to supporting each child's unique journey of development, 
                        fostering a love of learning, building confidence, and laying the foundations for 
                        lifelong success and wellbeing.
                      </p>
                      <p>
                        Through partnerships with families and communities, we create inclusive spaces 
                        where diversity is celebrated and every child feels valued and respected.
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={fadeUp} className="flex flex-col">
                  <div className="bg-white rounded-xl shadow-md p-8 border border-primary/10 h-full flex flex-col">
                    <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                      <Leaf className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Vision</h2>
                    <div className="prose prose-lg max-w-none text-muted-foreground flex-grow">
                      <p>
                        To be recognized as a leading provider of exceptional early years education 
                        that inspires children to become confident, compassionate, and curious individuals.
                      </p>
                      <p>
                        We envision our nurseries as vibrant communities where innovative practices 
                        and traditional values combine to create magical childhood experiences.
                      </p>
                      <p>
                        We strive to set new standards in early years care and education, 
                        positively influencing not just the lives of the children and families we serve, 
                        but the wider early childhood sector.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Core Pillars Section */}
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
                <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Core Pillars</h2>
                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Five fundamental principles that guide our approach to early childhood education
                </p>
              </motion.div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {missionPillars.map((pillar, index) => (
                  <motion.div
                    key={pillar.title}
                    variants={childFadeIn}
                    custom={index}
                    className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                      {pillar.icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-4">{pillar.title}</h3>
                    <p className="text-muted-foreground">{pillar.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Educational Approach Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Educational Approach</h2>
                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  A holistic curriculum that nurtures all aspects of a child's development
                </p>
              </motion.div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {educationalApproach.map((approach, index) => (
                  <motion.div
                    key={approach.title}
                    variants={childFadeIn}
                    custom={index}
                    className="bg-white rounded-xl shadow-md p-6 border border-primary/10"
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${approach.color}`}>
                      {approach.title}
                    </div>
                    <p className="text-muted-foreground">{approach.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Goals Section */}
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
                <h2 className="text-3xl font-heading font-bold text-primary mb-4">Our Goals</h2>
                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Where we are today and where we're heading tomorrow
                </p>
              </motion.div>
              
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.title}
                    variants={childFadeIn}
                    custom={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-primary/10"
                  >
                    <div className="bg-primary text-white py-3 px-6">
                      <h3 className="font-heading font-bold text-xl">{goal.title}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-6">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                            Current
                          </span>
                          Where We Are
                        </h4>
                        <p className="text-muted-foreground">{goal.current}</p>
                      </div>
                      <div className="p-6">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <span className="bg-green-100 text-green-600 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                            Future
                          </span>
                          Where We're Going
                        </h4>
                        <p className="text-muted-foreground">{goal.future}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div variants={fadeUp} className="mt-16 text-center">
                <a href="/contact" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-heading font-semibold shadow-md hover:shadow-lg transition-all">
                  Partner With Us
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Quote Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-10 border border-primary/10 text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="text-5xl text-primary mb-6">"</div>
              <blockquote className="text-2xl font-heading text-foreground italic mb-6">
                Our greatest responsibility is not just to care for children today, but to help shape 
                who they will become tomorrow. Every interaction, every lesson, every moment of play 
                is an opportunity to nurture their potential.
              </blockquote>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-muted-foreground">Founder & Director</div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}