import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, Quote } from 'lucide-react';

export default function DailyQuote() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [timeUntilNext, setTimeUntilNext] = useState('');

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You learn more from failure than from success.", author: "Unknown" },
    { text: "If you are working on something that you really care about, you don't have to be pushed.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Go confidently in the direction of your dreams! Live the life you've imagined.", author: "Henry David Thoreau" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
    { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
    { text: "May you live all the days of your life.", author: "Jonathan Swift" },
    { text: "Life itself is the most wonderful fairy tale.", author: "Hans Christian Andersen" },
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "Life is a succession of lessons which must be lived to be understood.", author: "Helen Keller" },
    { text: "You have within you right now, everything you need to deal with whatever the world can throw at you.", author: "Brian Tracy" }
  ];

  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    return quotes[quoteIndex];
  };

  const calculateTimeUntilNext = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setQuote(getDailyQuote());
    
    const interval = setInterval(() => {
      setTimeUntilNext(calculateTimeUntilNext());
      
      const currentQuote = getDailyQuote();
      if (currentQuote.text !== quote.text) {
        setQuote(currentQuote);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote.text]);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-fit flex justify-center bg-transparent">
      <div className="max-w-screen w-full">
        <div className="p-8 md:p-12 bg-transparent">
          <div className="relative mb-8">
            <Quote className="w-12 h-12 text-purple-300 absolute -top-4 -left-4 transform -rotate-12" />
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12 border border-purple-100">
              <blockquote className="text-2xl md:text-3xl font-light text-gray-700 leading-relaxed mb-6 italic">
                "{quote.text}"
              </blockquote>
              <div className="flex items-center justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold text-purple-600">— {quote.author}</p>
                </div>
              </div>
            </div>
          </div>

           <div className="bg-gray-50 rounded-xl p-0 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 font-medium">Next quote in:</span>
            </div>
            <div className="font-mono text-2xl font-bold text-purple-600">
              {timeUntilNext}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              A new inspiring quote awaits you tomorrow
            </p>
          </div>

        
        </div>
      </div>
    </div>
  );
}