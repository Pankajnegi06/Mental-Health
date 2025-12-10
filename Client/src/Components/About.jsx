import React from "react";
import Accordion, { AccordionItem } from "../Context/AccordianComponent.jsx";
import { useNavigate } from "react-router-dom";

const faqItems = [
  {
    value: "item1",
    question: "Does it support meeting between doctor and patient?",
    answer: "Yes, the platform supports real-time meetings between doctors and patients.",
  },
  {
    value: "item2",
    question: "Is an AI Doctor Assistant supported?",
    answer: "Yes, it comes with an integrated AI Doctor Assistant to help with basic queries and triage.",
  },
  {
    value: "item3",
    question: "Is the platform available 24x7?",
    answer: "Yes, the platform is available 24x7 to ensure healthcare access at any time.",
  },
  {
    value: "item4",
    question: "Can it find nearby hospitals and clinics?",
    answer: "Yes, it can locate nearby hospitals and clinics using your location.",
  },
  {
    value: "item5",
    question: "Can I book an appointment?",
    answer: "Yes, appointments can be booked directly through the system.",
  },
  {
    value: "item6",
    question: "Is my data secured?",
    answer: "Yes, your data is secured using JWT authentication, with secure login and logout functionality.",
  },
  {
    value: "item7",
    question: "Can I upload an image of the disease to the AI?",
    answer: "Yes, image upload functionality is available for disease identification by AI.",
  },
  {
    value: "item8",
    question: "Does it support filtering based on nearby hospitals for cost minimization?",
    answer: "Yes, filtering based on proximity and cost is supported for better decision-making.",
  },
  {
    value: "item9",
    question: "Can I cancel an appointment if needed?",
    answer: "Yes, appointments can be canceled, and your dashboard will reflect the update.",
  },
  {
    value: "item10",
    question: "Does it support chatbot, camera, and mic functionality for doctor-patient communication?",
    answer: "Yes, it includes chatbot support and enables camera and microphone access for live consultations.",
  },
];

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 flex justify-center items-start px-4 sm:px-8 md:px-12 py-16 min-h-screen">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center">FAQ</h1>

        {/* Responsive Layout */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {[0, 1].map((col) => (
            <div key={col}>
              <Accordion
                value={null}
                // onChange={(value) =>
                  // console.log("Selected Accordion:", value)
                // }
                className="space-y-2"
              >
                {faqItems
                  .slice(col * 5, col * 5 + 5)
                  .map(({ value, question, answer }) => (
                    <AccordionItem
                      key={value}
                      value={value}
                      trigger={question}
                      className="text-white cursor-pointer hover:bg-white/10 backdrop-blur-md rounded-xl"
                    >
                      <p className="text-white">{answer}</p>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="text-gray-300 text-center font-light px-4 pt-6">
          More questions? Visit our website or send us a{" "}
          <span
            onClick={() => navigate("/Contact")}
            className="hover:underline underline-offset-4 cursor-pointer text-blue-400"
          >
            message
          </span>.
        </div>
      </div>
    </div>
  );
};

export default About;
