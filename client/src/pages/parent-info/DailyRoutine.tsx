import { motion } from "framer-motion";
import { Clock, Download } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function DailyRoutinePage() {
  // Age group data with actual schedules from the PDFs
  const ageGroups = [
    {
      name: "Little Blessings (3-18 months)",
      color: "hayes",
      pdfUrl: "/files/daily-routines/Little-blessings.pdf",
      routineAdjustments: [
        "Individual sleeping schedules followed as per parents' guidance",
        "One-to-one feeding and nappy changing as needed",
        "Sensory-rich activities tailored to developmental stages",
        "Regular tummy time and physical development exercises",
        "Shorter, more frequent activity transitions"
      ],
      schedule: [
        { time: "07:30 - 09:00", activity: "Children arrive – Breakfast and free play" },
        { time: "09:00 - 09:15", activity: "Free play" },
        { time: "09:15 - 09:30", activity: "Morning song/ Nursery rhymes" },
        { time: "09:30 - 09:50", activity: "Planned/ focused activities" },
        { time: "09:50 - 10:10", activity: "Morning snack" },
        { time: "10:10 - 10:40", activity: "Sensory play" },
        { time: "10:40 - 10:45", activity: "Tidy up time" },
        { time: "10:45 - 11:00", activity: "Garden time" },
        { time: "11:00 - 11:20", activity: "Circle time" },
        { time: "11:20 - 12:00", activity: "Lunch time" },
        { time: "12:00 - 1:30", activity: "Nap time" },
        { time: "1:30 - 2:00", activity: "Afternoon snack" },
        { time: "2:00 - 2:30", activity: "Messy play" },
        { time: "2:30 - 2:45", activity: "Circle time" },
        { time: "2:45 - 3:10", activity: "Garden time" },
        { time: "3:10 - 4:00", activity: "Teatime" },
        { time: "4:00 - 4:30", activity: "Activity time" },
        { time: "4:30 - 4:50", activity: "Story time" },
        { time: "4:50 - 5:30", activity: "Free play" },
        { time: "5:30 - 6:00", activity: "Children go home" }
      ],
      note: "Nappy changing time - Every 3 hours apart from when they've done a poo"
    },
    {
      name: "Growing Feet (18-36 months)",
      color: "uxbridge",
      pdfUrl: "/files/daily-routines/Growing-feet.pdf",
      routineAdjustments: [
        "Toilet training support in partnership with parents",
        "More emphasis on developing independence and self-help skills",
        "Shorter group activities with higher engagement",
        "Focus on language development and simple instructions",
        "Introduction to simple turn-taking and sharing concepts"
      ],
      schedule: [
        { time: "7:30 - 09:00", activity: "Children arrive – Breakfast and free play" },
        { time: "09:00 - 09:10", activity: "Tidy up time" },
        { time: "09:10 - 09:20", activity: "Morning song and circle time" },
        { time: "09:20 - 09:50", activity: "Group activity" },
        { time: "09:50 - 10:15", activity: "Washing hands/ Morning snack" },
        { time: "10:15 - 10:35", activity: "Garden time" },
        { time: "10:45 - 11:00", activity: "Tidy up time" },
        { time: "11:00 - 11:15", activity: "Story time" },
        { time: "11:15 - 11:20", activity: "Washing hands" },
        { time: "11:20 - 11:50", activity: "Lunch time" },
        { time: "11:50 - 12:15", activity: "Washing hands and faces / Children leaving" },
        { time: "12:15 - 01:00", activity: "Free play/ children sleeping" },
        { time: "01:00 - 01:30", activity: "Afternoon song and circle time" },
        { time: "01:30 - 01:45", activity: "Washing hands / Afternoon snack" },
        { time: "01:45 - 02:15", activity: "Focused activity" },
        { time: "02:15 - 02:45", activity: "Garden time" },
        { time: "02:45 - 02:55", activity: "Tidy up time" },
        { time: "02:55 - 03:00", activity: "Washing hands" },
        { time: "03:00 - 03:30", activity: "Teatime" },
        { time: "03:30 - 04:00", activity: "Washing hands and faces / Children leaving" },
        { time: "04:00 - 04:15", activity: "Story time" },
        { time: "04:15 - 05:00", activity: "Garden time" }
      ]
    },
    {
      name: "Young Eagles (3-5 years)",
      color: "hounslow",
      pdfUrl: "/files/daily-routines/Young-Eagles.pdf",
      routineAdjustments: [
        "More complex activities preparing for school readiness",
        "Longer periods of focused learning with specific objectives",
        "Advanced problem solving and critical thinking challenges",
        "Leadership opportunities and responsibility assignments",
        "Early literacy and numeracy skill development"
      ],
      schedule: [
        { time: "7:30 - 09:00", activity: "Children arrive – Breakfast and free play" },
        { time: "09:00 - 09:10", activity: "Tidy up time" },
        { time: "09:10 - 09:45", activity: "Morning song and circle time" },
        { time: "09:50 - 10:15", activity: "Garden time" },
        { time: "10:15 - 10:35", activity: "Washing hands / Morning snack" },
        { time: "10:35 - 11:15", activity: "Focused activity/ free flow" },
        { time: "11:15 - 11:20", activity: "Tidy up time" },
        { time: "11:20 - 11:30", activity: "Story time" },
        { time: "11:30 - 11:35", activity: "Washing hands" },
        { time: "11:35 - 12:00", activity: "Lunch time + children go home" },
        { time: "12:00 - 12:55", activity: "Free play" },
        { time: "12:55 - 1:00", activity: "Tidy up + welcome children" },
        { time: "1:00 - 1:20", activity: "Circle time" },
        { time: "1:20 - 1:25", activity: "Washing hands" },
        { time: "1:25 - 1:50", activity: "Afternoon snack" },
        { time: "1:50 - 2:50", activity: "Free flow, Focused activity + garden time" },
        { time: "2:50 - 3:00", activity: "Tidy up time" },
        { time: "3:00 - 3:15", activity: "Storytime" },
        { time: "3:15 - 3:20", activity: "Washing hands" },
        { time: "3:20 - 4:00", activity: "Teatime buffet" },
        { time: "4:00 - 5:00", activity: "Home time/ free play" }
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
                <div className={`bg-${group.color} text-white py-3 px-6 flex justify-between items-center`}>
                  <h3 className="text-xl font-heading font-bold">{group.name}</h3>
                  <a 
                    href={group.pdfUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </a>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {group.note && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-gray-700 italic">{group.note}</p>
                    </div>
                  )}
                  
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
            <p className="italic text-muted-foreground mb-4">
              Please note that this schedule is a general framework and may be adjusted for special activities, outings, or based on the children's interests and needs on a particular day.
            </p>
            <div className="flex flex-wrap gap-4">
              {ageGroups.map((group) => (
                <a 
                  key={group.name}
                  href={group.pdfUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 bg-${group.color}/10 hover:bg-${group.color}/20 text-${group.color} px-4 py-2 rounded-md transition-colors`}
                >
                  <Download className="w-4 h-4" />
                  <span>{group.name.split('(')[0].trim()} Schedule</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}