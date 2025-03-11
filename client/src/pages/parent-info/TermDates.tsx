import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function TermDatesPage() {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  const termDates = [
    {
      term: "Autumn Term",
      dates: `5 September ${currentYear} - 16 December ${currentYear}`,
      halfTerm: `24 October - 28 October ${currentYear}`,
      insetDays: [`1 September ${currentYear}`, `2 September ${currentYear}`]
    },
    {
      term: "Spring Term",
      dates: `3 January ${nextYear} - 31 March ${nextYear}`,
      halfTerm: `13 February - 17 February ${nextYear}`,
      insetDays: [`3 January ${nextYear}`]
    },
    {
      term: "Summer Term",
      dates: `17 April ${nextYear} - 21 July ${nextYear}`,
      halfTerm: `29 May - 2 June ${nextYear}`,
      insetDays: [`26 May ${nextYear}`]
    }
  ];
  
  const holidayClosure = [
    {
      holiday: "Christmas Closure",
      dates: `23 December ${currentYear} - 2 January ${nextYear}`
    },
    {
      holiday: "Easter Closure",
      dates: `7 April ${nextYear} - 10 April ${nextYear}`
    },
    {
      holiday: "Bank Holidays",
      dates: `The nursery will be closed on all UK bank holidays`
    }
  ];

  return (
    <ParentInfoLayout 
      title="Term Dates" 
      subtitle="Plan ahead with our nursery term dates and holiday closures"
      icon={<Calendar />}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Nursery Opening</h2>
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <p className="mb-4">
              Coat of Many Colours Nursery operates Monday to Friday throughout the year, except for bank holidays and specified closure periods.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-heading font-bold mb-2 text-primary">Regular Opening Hours</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>7:30am - 6:00pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Saturday - Sunday:</span>
                    <span>Closed</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold mb-2 text-primary">Term Time vs. Full Year</h3>
                <p className="text-sm text-muted-foreground">
                  We offer both term-time only and full-year attendance options. Term-time follows the dates below, 
                  while full-year care is available throughout the year except during our specified closure periods.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Academic Year {currentYear}/{nextYear}</h2>
          <div className="space-y-6">
            {termDates.map((term, index) => (
              <motion.div 
                key={term.term} 
                variants={childFadeIn}
                custom={index}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-primary/10"
              >
                <div className="bg-primary text-white py-3 px-6">
                  <h3 className="text-xl font-heading font-bold">{term.term}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary">Term Dates:</h4>
                      <p className="text-lg font-semibold">{term.dates}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Half Term Break:</h4>
                      <p>{term.halfTerm}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Staff Training Days (Nursery Closed):</h4>
                      <ul className="list-disc pl-5">
                        {term.insetDays.map((day, i) => (
                          <li key={i}>{day}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Holiday Closures</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <p className="mb-6">
              The nursery will be fully closed during the following periods:
            </p>
            <div className="space-y-4">
              {holidayClosure.map((holiday, index) => (
                <motion.div 
                  key={holiday.holiday}
                  variants={childFadeIn} 
                  custom={index}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <h3 className="font-heading font-bold text-lg">{holiday.holiday}</h3>
                  <p className="text-muted-foreground">{holiday.dates}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Additional Information</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-3">Term-Time Only Attendance</h3>
              <p className="text-muted-foreground">
                For parents choosing term-time only attendance, please note that fees are calculated based on 38 weeks per year. 
                You will not be charged for holiday periods between terms, but payment is required for half-term breaks.
              </p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-3">Full Year Attendance</h3>
              <p className="text-muted-foreground">
                Full year attendance covers 48 weeks per year (excluding the 4-week closure periods). 
                Fees are calculated on a monthly basis and spread evenly throughout the year.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3">Holiday Allowance (Full Year Only)</h3>
            <p className="mb-4">
              Families on full-year contracts are entitled to two weeks' holiday allowance per academic year at a 50% fee reduction. 
              This allowance is subject to the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Four weeks' written notice must be provided</li>
              <li>Holidays must be taken in complete week blocks (Monday-Friday)</li>
              <li>Allowance cannot be carried over to the next academic year</li>
              <li>Not applicable during term-time for funded places</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}