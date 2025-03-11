import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function DailyRoutinePage() {
  const dailySchedule = [
    {
      time: "7:30 - 8:30",
      activity: "Early Drop-off & Breakfast",
      description: "Quiet activities, reading, and a nutritious breakfast to start the day."
    },
    {
      time: "8:30 - 9:15",
      activity: "Welcome & Free Play",
      description: "Children arrive and engage in free play activities of their choice."
    },
    {
      time: "9:15 - 9:30",
      activity: "Morning Circle Time",
      description: "Group welcome, songs, weather discussion, and plan for the day."
    },
    {
      time: "9:30 - 10:30",
      activity: "Planned Activities",
      description: "Age-appropriate learning activities based on weekly themes."
    },
    {
      time: "10:30 - 10:45",
      activity: "Morning Snack",
      description: "Healthy snacks and social time with friends."
    },
    {
      time: "10:45 - 11:45",
      activity: "Outdoor Play",
      description: "Active play in our outdoor areas, exploring nature and developing physical skills."
    },
    {
      time: "11:45 - 12:00",
      activity: "Story Time",
      description: "Interactive storytelling and language development."
    },
    {
      time: "12:00 - 12:45",
      activity: "Lunch",
      description: "Nutritious hot lunch and social interaction."
    },
    {
      time: "12:45 - 13:00",
      activity: "Toothbrushing & Hygiene",
      description: "Learning about personal hygiene and dental care."
    },
    {
      time: "13:00 - 14:30",
      activity: "Quiet/Rest Time",
      description: "Nap time for younger children, quiet activities for older ones."
    },
    {
      time: "14:30 - 15:30",
      activity: "Afternoon Activities",
      description: "Creative arts, music, and movement sessions."
    },
    {
      time: "15:30 - 15:45",
      activity: "Afternoon Snack",
      description: "Healthy refreshments to boost energy levels."
    },
    {
      time: "15:45 - 16:45",
      activity: "Child-led Activities",
      description: "Self-directed play in various learning centers."
    },
    {
      time: "16:45 - 17:15",
      activity: "Tea Time",
      description: "Light evening meal and social time."
    },
    {
      time: "17:15 - 18:00",
      activity: "Quiet Activities & Collection",
      description: "Winding down with books, puzzles, and preparing to go home."
    }
  ];

  const ageGroups = [
    {
      name: "Babies (3-18 months)",
      routineAdjustments: [
        "Individual sleeping schedules followed as per parents' guidance",
        "One-to-one feeding and nappy changing as needed",
        "Sensory-rich activities tailored to developmental stages",
        "Regular tummy time and physical development exercises",
        "Shorter, more frequent activity transitions"
      ]
    },
    {
      name: "Toddlers (18-36 months)",
      routineAdjustments: [
        "Toilet training support in partnership with parents",
        "More emphasis on developing independence and self-help skills",
        "Shorter group activities with higher engagement",
        "Focus on language development and simple instructions",
        "Introduction to simple turn-taking and sharing concepts"
      ]
    },
    {
      name: "Preschool (3-5 years)",
      routineAdjustments: [
        "More complex activities preparing for school readiness",
        "Longer periods of focused learning with specific objectives",
        "Advanced problem solving and critical thinking challenges",
        "Leadership opportunities and responsibility assignments",
        "Early literacy and numeracy skill development"
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
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Typical Daily Schedule</h2>
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-[2.75rem] w-0.5 bg-primary/20 z-0 md:left-[6.8rem]"></div>
            <div className="space-y-6">
              {dailySchedule.map((item, index) => (
                <motion.div 
                  key={item.time} 
                  variants={childFadeIn}
                  custom={index}
                  className="relative z-10 flex flex-col md:flex-row gap-4"
                >
                  <div className="md:w-28 flex-shrink-0">
                    <div className="inline-block bg-white p-2 rounded-lg border border-primary/10 shadow-sm">
                      <span className="font-semibold text-primary">{item.time}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white border-4 border-primary/10 flex items-center justify-center flex-shrink-0 ml-1 md:ml-0">
                    <div className="h-4 w-4 rounded-full bg-primary"></div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md border border-primary/10 flex-1 ml-6 md:ml-0">
                    <h3 className="font-heading font-bold text-lg text-primary">{item.activity}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Age-Specific Adaptations</h2>
          <div className="space-y-6">
            {ageGroups.map((group, index) => (
              <motion.div 
                key={group.name} 
                variants={childFadeIn}
                custom={index}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-primary/10"
              >
                <div className="bg-primary text-white py-3 px-6">
                  <h3 className="text-xl font-heading font-bold">{group.name}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {group.routineAdjustments.map((adjustment, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <span className="text-muted-foreground">{adjustment}</span>
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