import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Brain, 
  Heart, 
  Star,
  Users,
  Clock,
  Award, 
  CheckCircle
} from "lucide-react";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";

export default function MissionSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const values = [
    {
      title: "Creativity",
      description: "We encourage children to explore, experiment, and express themselves through art, music, and play.",
      icon: <Star className="h-6 w-6" />,
      color: "#FFBD59",
      delay: 0.1
    },
    {
      title: "Compassion",
      description: "We foster empathy and kindness, teaching children to care for themselves, others, and the world around them.",
      icon: <Heart className="h-6 w-6" />,
      color: "#FF7D30",
      delay: 0.2
    },
    {
      title: "Curiosity",
      description: "We nurture inquisitive minds by creating an environment that promotes discovery and a love of learning.",
      icon: <Brain className="h-6 w-6" />,
      color: "#4AADA5",
      delay: 0.3
    },
    {
      title: "Community",
      description: "We build strong relationships between children, families, educators, and our local community.",
      icon: <Users className="h-6 w-6" />,
      color: "#FF5757",
      delay: 0.4
    }
  ];

  const stats = [
    {
      value: "96%",
      label: "Parent Satisfaction",
      icon: <CheckCircle />,
      color: "#FF7D30"
    },
    {
      value: "15+",
      label: "Years Experience",
      icon: <Clock />,
      color: "#4AADA5"
    },
    {
      value: "3:1",
      label: "Child-Teacher Ratio",
      icon: <Users />,
      color: "#FFBD59"
    },
    {
      value: "250+",
      label: "Happy Children",
      icon: <Award />,
      color: "#FF5757"
    }
  ];

  return (
    <section id="mission" className="py-24 bg-[#FFF6E9] relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-[#FF5757] rounded-full opacity-10 animate-float-slow"></div>
      <div className="absolute bottom-40 right-20 w-20 h-20 bg-[#FFBD59] rounded-full opacity-10 animate-float"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column - Mission Statement */}
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeLeft}
            ref={ref}
          >
            <span className="inline-block px-4 py-1 bg-[#FFBD59] text-[#B25F00] font-medium text-sm rounded-full mb-4">Our Mission</span>
            
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
              Nurturing <span className="text-[#FF7D30]">Happy</span>, <span className="text-[#4AADA5]">Healthy</span> & <span className="text-[#FF5757]">Curious</span> Children
            </h2>
            
            <p className="text-gray-700 mb-8 text-lg">
              At Coat of Many Colours Nursery, our mission is to provide a safe, nurturing environment where children can develop emotionally, socially, and intellectually. We believe every child is unique and deserves an individualized approach to learning.
            </p>
            
            <p className="text-gray-700 mb-8 text-lg">
              Through play-based learning, creative expression, and meaningful relationships, we help children build a strong foundation for lifelong learning and wellbeing.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-4"
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeUp}
                  custom={index * 0.1}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: `${stat.color}20`}}>
                    <div className="text-lg" style={{color: stat.color}}>{stat.icon}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl" style={{color: stat.color}}>{stat.value}</h4>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Right Column - Values */}
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeRight}
          >
            <div className="relative w-full p-8 rounded-3xl bg-white shadow-xl">
              <span className="inline-block px-4 py-1 bg-[#93E2D0] text-[#4AADA5] font-medium text-sm rounded-full mb-4">Our Core Values</span>
              
              <div className="space-y-6">
                {values.map((value, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-4 p-4 rounded-xl transition-all"
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={fadeUp}
                    custom={value.delay}
                    whileHover={{backgroundColor: `${value.color}10`}}
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center" style={{backgroundColor: `${value.color}20`}}>
                      <div style={{color: value.color}}>{value.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2" style={{color: value.color}}>{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#FF7D30] rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#4AADA5] rounded-full opacity-20"></div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,181.3C672,181,768,203,864,218.7C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
