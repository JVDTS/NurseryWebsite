import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function DailyRoutinePage() {


  const ageGroups = [
    {
      name: "Little Blessings (3-18 months)",
      color: "hayes",
      routineAdjustments: [
        "Individual sleeping schedules followed as per parents' guidance",
        "One-to-one feeding and nappy changing as needed",
        "Sensory-rich activities tailored to developmental stages",
        "Regular tummy time and physical development exercises",
        "Shorter, more frequent activity transitions"
      ],
      schedule: [
        { time: "7:30 - 9:00", activity: "Arrival & Gentle Play", description: "Calm welcome routines and sensory exploration" },
        { time: "9:00 - 9:30", activity: "Breakfast", description: "Individual feeding with close attention to dietary needs" },
        { time: "9:30 - 10:15", activity: "Sensory Activities", description: "Textures, sounds, and visual stimulation experiences" },
        { time: "10:15 - 10:45", activity: "Morning Nap", description: "Sleep time according to individual schedules" },
        { time: "10:45 - 11:30", activity: "Outdoor Sensory Time", description: "Nature exploration in our dedicated baby garden" },
        { time: "11:30 - 12:15", activity: "Lunch", description: "Assisted feeding and social interaction" },
        { time: "12:15 - 14:15", activity: "Afternoon Nap", description: "Extended rest period in our quiet sleep room" },
        { time: "14:15 - 15:00", activity: "Story & Song Time", description: "Language development through books and music" },
        { time: "15:00 - 15:30", activity: "Afternoon Snack", description: "Healthy age-appropriate foods" },
        { time: "15:30 - 16:30", activity: "Physical Development", description: "Activities to encourage movement and coordination" },
        { time: "16:30 - 17:15", activity: "Tea Time", description: "Light evening meal with social interaction" },
        { time: "17:15 - 18:00", activity: "Calm Collection Activities", description: "Gentle activities while waiting for parents" }
      ]
    },
    {
      name: "Growing Feet (18-36 months)",
      color: "uxbridge",
      routineAdjustments: [
        "Toilet training support in partnership with parents",
        "More emphasis on developing independence and self-help skills",
        "Shorter group activities with higher engagement",
        "Focus on language development and simple instructions",
        "Introduction to simple turn-taking and sharing concepts"
      ],
      schedule: [
        { time: "7:30 - 8:30", activity: "Early Drop-off & Breakfast", description: "Self-feeding with supervision and morning welcome" },
        { time: "8:30 - 9:15", activity: "Free Play & Welcome", description: "Child-led exploration with developmental toys" },
        { time: "9:15 - 9:45", activity: "Morning Circle", description: "Simple songs, greetings and introduction to the day" },
        { time: "9:45 - 10:30", activity: "Creative Activities", description: "Art, messy play and sensory experiences" },
        { time: "10:30 - 10:45", activity: "Morning Snack", description: "Healthy snacks with focus on self-feeding skills" },
        { time: "10:45 - 11:45", activity: "Outdoor Exploration", description: "Physical play and nature discovery" },
        { time: "11:45 - 12:00", activity: "Story Time", description: "Interactive storytelling with props and puppets" },
        { time: "12:00 - 12:45", activity: "Lunch", description: "Developing table manners and social eating" },
        { time: "12:45 - 14:30", activity: "Naptime", description: "Rest period with quiet alternatives for non-sleepers" },
        { time: "14:30 - 15:30", activity: "Language Activities", description: "Songs, rhymes and language development games" },
        { time: "15:30 - 16:30", activity: "Outdoor/Indoor Choice", description: "Child-led activities in different areas" },
        { time: "16:30 - 17:15", activity: "Tea Time", description: "Social mealtime with developing independence" },
        { time: "17:15 - 18:00", activity: "Quiet Play & Collection", description: "Calm activities while waiting for collection" }
      ]
    },
    {
      name: "Young Eagles (3-5 years)",
      color: "hounslow",
      routineAdjustments: [
        "More complex activities preparing for school readiness",
        "Longer periods of focused learning with specific objectives",
        "Advanced problem solving and critical thinking challenges",
        "Leadership opportunities and responsibility assignments",
        "Early literacy and numeracy skill development"
      ],
      schedule: [
        { time: "7:30 - 8:30", activity: "Early Drop-off & Breakfast", description: "Self-service breakfast and independent activities" },
        { time: "8:30 - 9:00", activity: "Welcome & Planning", description: "Children help plan their day's activities" },
        { time: "9:00 - 9:30", activity: "Morning Circle Time", description: "Calendar, weather, news sharing and day overview" },
        { time: "9:30 - 10:30", activity: "Focused Learning", description: "Literacy, numeracy and topic work in small groups" },
        { time: "10:30 - 10:45", activity: "Morning Snack", description: "Independent preparation and social conversation" },
        { time: "10:45 - 11:45", activity: "Outdoor Learning", description: "Physical challenges, projects and nature exploration" },
        { time: "11:45 - 12:15", activity: "STEM Activities", description: "Science, technology, engineering and math exploration" },
        { time: "12:15 - 13:00", activity: "Lunch", description: "Table helpers, self-service and conversation" },
        { time: "13:00 - 13:30", activity: "Quiet Reading", description: "Independent book exploration and storytelling" },
        { time: "13:30 - 14:30", activity: "Project Work", description: "Extended topic work with research and creativity" },
        { time: "14:30 - 15:30", activity: "Specialist Activities", description: "Music, drama, languages or sports" },
        { time: "15:30 - 16:00", activity: "Afternoon Snack & Meeting", description: "Reflection on day's learning" },
        { time: "16:00 - 16:45", activity: "Free Choice & Outdoors", description: "Child-directed play and activities" },
        { time: "16:45 - 17:15", activity: "Tea Time", description: "Independent serving and cleanup responsibilities" },
        { time: "17:15 - 18:00", activity: "Story, Games & Collection", description: "Calm activities preparing for home" }
      ]
    }
  ];

  return (
    <ParentInfoLayout 
      title="Daily Routine" 
      subtitle="A structured day filled with learning, play, and discovery"
      icon={<Clock />}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Our Approach to Daily Routines</h2>
          <p className="text-muted-foreground mb-6">
            At Coat of Many Colours Nursery, we provide a structured yet flexible daily routine that gives children a sense of security while allowing for spontaneity and individual needs. 
            Our schedule balances active and quiet times, group and individual activities, and indoor and outdoor experiences.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3 text-primary">Benefits of Our Routine</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="text-primary text-lg font-bold">1</div>
                </div>
                <div>
                  <h4 className="font-semibold">Security & Predictability</h4>
                  <p className="text-sm text-muted-foreground">Children thrive when they know what to expect</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="text-primary text-lg font-bold">2</div>
                </div>
                <div>
                  <h4 className="font-semibold">Balanced Development</h4>
                  <p className="text-sm text-muted-foreground">Activities covering all developmental areas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="text-primary text-lg font-bold">3</div>
                </div>
                <div>
                  <h4 className="font-semibold">Building Independence</h4>
                  <p className="text-sm text-muted-foreground">Routine helps children anticipate and prepare for transitions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="text-primary text-lg font-bold">4</div>
                </div>
                <div>
                  <h4 className="font-semibold">Individual Rhythms</h4>
                  <p className="text-sm text-muted-foreground">Flexibility to accommodate personal needs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Age-Specific Daily Routines</h2>
          <div className="space-y-10">
            {ageGroups.map((group, index) => (
              <motion.div 
                key={group.name} 
                variants={childFadeIn}
                custom={index}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-primary/10"
              >
                <div className={`bg-${group.color} text-white py-3 px-6`}>
                  <h3 className="text-xl font-heading font-bold">{group.name}</h3>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-heading font-semibold mb-4 text-gray-700">Daily Schedule</h4>
                  <div className="relative mb-6">
                    <div className={`absolute top-0 bottom-0 left-[2.75rem] w-0.5 bg-${group.color}/20 z-0 md:left-[6.8rem]`}></div>
                    <div className="space-y-4">
                      {group.schedule.map((item, i) => (
                        <div 
                          key={i} 
                          className="relative z-10 flex flex-col md:flex-row gap-4"
                        >
                          <div className="md:w-28 flex-shrink-0">
                            <div className="inline-block bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                              <span className={`font-semibold text-${group.color}`}>{item.time}</span>
                            </div>
                          </div>
                          <div className={`h-8 w-8 rounded-full bg-white border-4 border-${group.color}/10 flex items-center justify-center flex-shrink-0 ml-1 md:ml-0`}>
                            <div className={`h-3 w-3 rounded-full bg-${group.color}`}></div>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1 ml-6 md:ml-0">
                            <h5 className={`font-heading font-bold text-${group.color}`}>{item.activity}</h5>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-heading font-semibold mb-3 text-gray-700">Special Considerations</h4>
                  <ul className="space-y-2">
                    {group.routineAdjustments.map((adjustment, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`h-6 w-6 rounded-full bg-${group.color}/10 flex items-center justify-center mt-0.5 flex-shrink-0`}>
                          <div className={`h-2 w-2 rounded-full bg-${group.color}`}></div>
                        </div>
                        <span className="text-gray-600">{adjustment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3">Parent Information</h3>
            <p className="mb-4">
              We understand that each child is unique and may have individual preferences or needs that require adjustments to our routine. 
              We welcome ongoing communication with parents to ensure that your child's experience at our nursery is positive and supportive of their development.
            </p>
            <p className="italic text-muted-foreground">
              Please note that this schedule is a general framework and may be adjusted for special activities, outings, or based on the children's interests and needs on a particular day.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}