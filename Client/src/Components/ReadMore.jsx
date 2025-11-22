import React from "react";
import { useNavigate } from "react-router-dom";

const articles = [
  {
    title: "Compassion is Where Pain Meets Love",
    date: "August 24, 2025",
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=300&q=80",
    tag: null,
  },
  {
    title: "Mindfulness and Neurodiversity",
    date: "August 17, 2025",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    tag: "Meditation 101",
  },
  {
    title: "Opening Up Wisely",
    date: "August 10, 2025",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80",
    tag: null,
  },
  {
    title: "Embracing the Suck",
    date: "August 3, 2025",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80",
    tag: null,
  },
];

const ReadMore = () => {

  const Navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b py-11 pt-16 w-screen h-fit from-[#FFFEFB] via-[#FFFEFB] to-[#FEFEF1]">
      <div className="max-w-6xl mx-auto px-8 bg-transparent">
        <h1 className="text-[42px] font-bold text-gray-800 mb-4 tracking-tight">
          Happier Meditation Weekly
        </h1>
        <hr className="border border-black" />
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-8 mt-10 grid md:grid-cols-2 gap-y-16 gap-x-20 bg-transparent">
        {articles.map((article, index) => (
          <div key={index} className="flex items-center space-x-6">
            <img
              src={article.image}
              alt={article.title}
              className="w-36 h-36 object-cover rounded-[20px]"
            />
            <div className="flex flex-col justify-center">
              {article.tag && (
                <span className="px-3 py-0.5 w-36 cursor-pointer border border-gray-700 rounded-full text-[12px] font-medium tracking-wide uppercase mb-3 inline-block text-gray-700">
                  {article.tag}
                </span>
              )}
              <a className="text-[20px] cursor-pointer font-normal text-gray-800 leading-snug hover:text-gray-900 transition">
                {article.title}
              </a>
              <p className="text-sm text-gray-600 mt-2">{article.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8 my-14">
        <hr className="border border-black" />
      </div>

      {/* Read more button */}
      <div className="max-w-6xl mx-auto px-8">
        <button className="px-8 py-2.5 border border-gray-800 rounded-full text-gray-800 text-[15px] font-normal hover:bg-gray-900 hover:text-white transition" onClick={()=>Navigate("/blog")}>
          Read more
        </button>
      </div>
    </div>
  );
};

export default ReadMore;
