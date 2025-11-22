import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Happier and how did it get started?",
    answer: "Happier is a wellness platform started by experts to help people live healthier, mindful lives."
  },
  {
    question: "What’s included in my membership?",
    answer: "Your membership includes guided meditations, expert courses, daily inspiration, and more."
  },
  {
    question: "How is Happier priced?",
    answer: "Happier offers monthly, yearly, and lifetime pricing options depending on your needs."
  },
  {
    question: "What types of meditation and mindfulness practices does Happier offer?",
    answer: "Happier offers breathing exercises, guided meditation, body scans, mindful movement, and more."
  },
  {
    question: "Who are the teachers and experts behind Happier?",
    answer: "Happier collaborates with psychologists, meditation teachers, and mindfulness coaches worldwide."
  },
  {
    question: "Can beginners use Happier?",
    answer: "Yes! It’s perfect for both beginners and experienced practitioners."
  },
  {
    question: "What kind of resources does Happier have for dealing with stress, anxiety, and other challenges?",
    answer: "You’ll find courses, audio guides, calming music, and expert advice on tackling various mental challenges."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const answerRefs = useRef([]);

  const toggleFAQ = (index) => {
    const isOpen = index === openIndex;
    setOpenIndex(isOpen ? null : index);

    faqs.forEach((_, i) => {
      if (answerRefs.current[i]) {
        if (i === index && !isOpen) {
          gsap.to(answerRefs.current[i], {
            height: "auto",
            duration: 0.4,
            ease: "power2.out",
            opacity: 1,
            display: "block"
          });
        } else {
          gsap.to(answerRefs.current[i], {
            height: 0,
            duration: 0.4,
            ease: "power2.in",
            opacity: 0,
            display: "none"
          });
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 border rounded-3xl shadow-md bg-white">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left side */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6 leading-snug">
            Need help <br /> getting started? <br /> Have questions?
          </h2>
          <button className="border border-black rounded-full px-5 py-2 text-lg font-medium hover:bg-black hover:text-white transition">
            Common questions
          </button>
        </div>

        {/* Right side - FAQ List */}
        <div className="flex-1">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex items-center justify-between py-4 font-medium text-lg focus:outline-none"
              >
                {faq.question}
                <ChevronDown
                  className={`transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                ref={(el) => (answerRefs.current[index] = el)}
                style={{ height: 0, overflow: "hidden", opacity: 0 }}
                className="text-gray-600 text-base pb-4"
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;