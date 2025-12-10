import React from "react";
import { Link } from "react-router-dom";
import blogtop1 from "../assets/blogtop1.jpeg";
import blogtop2 from "../assets/blogtop2.png";
import blogtop3 from "../assets/blogtop3.png";
import blogtop4 from "../assets/blogtop4.jpeg";
import blogtop5 from "../assets/blogtop5.jpeg";
import blogtop7 from "../assets/blogtop4.jpeg";

import HarshNavbar from "./HarshNavbar";
import "../index.css";
import Footer2 from "./Footer2";

const Logo = ({ width = 256, height = 256 }) => (
  <div
    style={{ width, height }}
    className="rounded-[19px] bg-yellow-400 flex items-center justify-center shadow-md"
  >
    {/* Black circle */}
    <div
      style={{ width: width * 0.7, height: height * 0.7 }}
      className="bg-black rounded-full flex items-center justify-center"
    >
      {/* Yellow bar */}
      <div
        style={{ width: width * 0.15, height: height * 0.4 }}
        className="bg-yellow-400 rounded-full rotate-45"
      ></div>
    </div>
  </div>
);



export default function BlogTop() {
  const categories = [
    { name: "Deep End", link: "/deep-end" },
    { name: "Healthy Habits", link: "/healthy-habits" },
    { name: "Relationships", link: "/relationships" },
    { name: "Sleep", link: "/sleep" },
    { name: "Anxiety", link: "/anxiety" },
    { name: "Meditation 101", link: "/meditation-101" },
  ];

  const popularPosts = [
    {
      title: "It’s Not About the Cookie",
      author: "Yael Shy",
      date: "June 1, 2025",
      img: blogtop2,
    },
    {
      title: "Embracing Ambition",
      author: "Yael Shy",
      date: "May 25, 2025",
      img: blogtop3,
    },
    {
      title: "I Feel Afraid All The Time",
      author: "Yael Shy",
      date: "May 18, 2025",
      img: blogtop4,
    },
  ];

  const latestPosts = [
    {
      title: "Responding to Life, Instead of Reacting to It",
      author: "Stephen Batchelor",
      date: "August 31, 2025",
      img: blogtop5,
      tag: null,
    },
    {
      title: "Compassion is Where Pain Meets Love",
      author: "Susan Piver",
      date: "August 24, 2025",
      img: blogtop1,
      tag: null,
    },
    {
      title: "Mindfulness and Neurodiversity",
      author: "Tim Hwang",
      date: "August 17, 2025",
      img: blogtop2,
      tag: "Meditation 101",
    },
    {
      title: "Opening Up Wisely",
      author: "Oren Jay Sofer",
      date: "August 10, 2025",
      img: blogtop3,
    },
    {
      title: "Embracing the Suck",
      author: "Daron Larson",
      date: "August 3, 2025",
      img: blogtop7,
    },
  ];

  return (
    <div className="relative top-0 left-0 w-full flex flex-col bg-transparent">
      <HarshNavbar/>
      <div className="gradient-texture relative w-screen min-h-[110vh] flex flex-col items-center justify-start text-center p-14 pb-10 text-white">
        <div className="mb-6 mt-12 relative z-10">
          <h1 className="text-6xl font-medium leading-tight tracking-tight">
            Happier Meditation
          </h1>
          <h1 className="text-6xl font-medium leading-tight tracking-tight mt-2">
            Weekly
          </h1>
        </div>

        <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-10 relative z-10 opacity-90">
          Here, we're all about making the insights of the world's most
          inspiring teachers accessible and helping you find mindful joy every
          day.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10 relative z-10">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="px-5 py-2 border border-white rounded-full text-sm font-semibold transition"
            >
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>

        <hr className="border-t border-white/60 w-3/4 mx-auto relative z-10 mb-16" />

        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 text-left">
          <div className="flex justify-center">
            <img
              src={blogtop1}
              alt="Compassion"
              className="rounded-xl shadow-lg object-cover w-[400px] h-[400px] transition-all duration-700 hover:scale-110"
              loading="eager"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-semibold leading-snug mb-4">
              Compassion is Where <br /> Pain Meets Love
            </h1>
            <p className="text-lg mb-6 leading-relaxed opacity-90">
              Compassion is the art of holding pain and love in your heart at
              once. It's not about grand gestures; it's about what's needed in
              the moment. True compassion requires courage—letting your heart
              break open to the world's sorrow and beauty, and responding with
              fierce kindness.
            </p>
            <p className="text-sm opacity-80">Susan Piver • August 24, 2025</p>
          </div>
        </div>
      </div>

      <div className="w-screen mx-auto px-28 py-16">
        <h2 className="text-3xl font-semibold mb-2">Most popular</h2>
        <hr className="border-t border-black mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {popularPosts.map((post, idx) => (
            <div key={idx} className="flex flex-col">
              <img
                src={post.img}
                alt={post.title}
                className="w-full h-[320px] object-cover rounded-xl mb-4 transition-all duration-700 hover:scale-110"
                loading="eager"
              />
              <h3 className="text-lg font-medium mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600">
                {post.author} • {post.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-screen py-16 bg-gradient-to-b from-bg-[#FFFFFF] via-[#FFFFFF] px-28 to-[#FFFBE6]">
        <h2 className="text-3xl font-semibold mb-2">The latest</h2>
        <hr className="border-t border-black mb-10" />

        <div className="flex flex-col space-y-10">
          {latestPosts.map((post, idx) => (
            <div key={idx} className=" flex">
              {idx === 5 ? (
                <div className="flex flex-row items-start space-x-6">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-[600px] object-cover rounded-2xl mb-6 transition-all duration-700 hover:scale-110"
                    loading="eager"
                  />
                  <div className="pt-5">
                    {post.tag && (
                    <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold border rounded-full text-gray-700 border-gray-400">
                      {post.tag.toUpperCase()}
                    </span>
                  )}
                  <h3 className="text-2xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    {post.author} • {post.date}
                  </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-start space-x-6">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-36 h-36 object-cover rounded-2xl transition-all duration-700 hover:scale-110"
                    loading="eager"
                  />
                  <div className="pt-5">
                    {post.tag && (
                      <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold border rounded-full text-gray-700 border-gray-400 ">
                        {post.tag.toUpperCase()}
                      </span>
                    )}
                    <h3 className="text-xl font-medium mb-1 ">{post.title}</h3>
                    <p className="text-sm text-gray-600 ">
                      {post.author} • {post.date}
                    </p>
                  </div>
                </div>
              )}
              <hr className="border-t border-black mt-8" />
              
            </div>
          ))}
          
       <button className="px-6 py-3 w-fit block mx-auto border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition">
          Read more
        </button>
        </div>
        
      </div>
      <div
        className="h-[70vh] bg-transparent px-28 w-screen flex flex-col text-center"
        style={{
          background: "linear-gradient(to bottom, #fffceb, #fdd835, #e65100)",
        }}
      >

        <div className="flex flex-col items-start my-20 max-w-3xl text-left justify-center">
          <Logo width={86} height={86}/>
          <h1 className="mt-8 text-5xl md:text-6xl font-semibold leading-snug text-yellow-100 ">
            Do what it actually <br />
            takes to be happier.
          </h1>
        </div>

        <div className="absolute bottom-16 right-32">
          {/* <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
            Try for free
          </button> */}
        </div>
      </div>
      <Footer2/>
    </div>
  );
}