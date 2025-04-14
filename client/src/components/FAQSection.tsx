import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";

// FAQ data - each item has a question and answer
const faqItems = [
  {
    question: "What ages do you accept at your nurseries?",
    answer: "We welcome children aged 3 months to 5 years across all our nursery locations. Each nursery has specially designed spaces and activities appropriate for different age groups."
  },
  {
    question: "What are your opening hours?",
    answer: "Our standard operating hours are Monday to Friday, 7:30am to 6:30pm. We're open all year round excluding bank holidays and a short closure period during Christmas."
  },
  {
    question: "How do you ensure children's safety?",
    answer: "Safety is our top priority. We maintain strict security procedures, including secure entry systems, regular staff training in safeguarding, comprehensive risk assessments, and adherence to all health and safety regulations."
  },
  {
    question: "What is your staff-to-child ratio?",
    answer: "We maintain ratios that exceed government requirements: 1:3 for children under 2 years, 1:4 for 2-year-olds, and 1:8 for 3-5 year olds. This ensures each child receives proper care and attention."
  },
  {
    question: "Do you provide meals and snacks?",
    answer: "Yes, we provide nutritious, freshly prepared meals and snacks daily, catering to all dietary requirements and allergies. Our menus are designed by nutrition experts to support children's development."
  },
  {
    question: "How do you handle allergies and dietary restrictions?",
    answer: "We take allergies very seriously. Upon enrollment, we document all allergies and dietary needs. Our kitchen staff are trained in allergen management, and we maintain strict protocols to prevent cross-contamination."
  },
  {
    question: "What is your approach to early learning?",
    answer: "We follow the Early Years Foundation Stage (EYFS) framework, focusing on learning through play. Our curriculum promotes physical, cognitive, social, and emotional development in a nurturing environment."
  },
  {
    question: "How do you keep parents updated on their child's progress?",
    answer: "We provide regular updates through our parent communication app, daily verbal feedback, termly progress reports, and parent-teacher meetings. We believe in maintaining open, transparent communication with families."
  }
];

export default function FAQSection() {
  return (
    <section className="bg-gray-50 py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our nurseries, programs, and policies.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left px-6 py-4 hover:no-underline text-gray-900 font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 text-gray-700">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}