import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

const FeedbackSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const sliderRef = useRef(null);

   const feedbacks = [
  {
    message: "StillMind has truly changed my mornings. The guided meditations help me start each day with calm and clarity.",
    name: "John Doe",
  },
  {
    message: "I never thought mindfulness could fit into my busy schedule, but these short sessions make it easy and effective.",
    name: "Jane Smith",
  },
  {
    message: "The breathing exercises taught here have reduced my stress levels significantly. I feel more balanced every day.",
    name: "Alice Johnson",
  },
  {
    message: "As someone who struggles with focus, these mindfulness practices have helped me feel more present and productive.",
    name: "Bob Brown",
  },
  {
    message: "The teachers explain everything so simply. Even a few minutes of practice leaves me feeling refreshed.",
    name: "Charlie Davis",
  },
  {
    message: "After a long workday, I use StillMind to unwind. It’s like a reset button for my mind and body.",
    name: "Eve Wilson",
  },
  {
    message: "I’ve tried many meditation apps, but this one feels the most personal and authentic. Highly recommended!",
    name: "Frank Thomas",
  },
  {
    message: "The guided sessions are gentle yet powerful. I’ve noticed better sleep and reduced anxiety after just a few weeks.",
    name: "Grace Lee",
  },
  {
    message: "StillMind has helped me create a small daily ritual that keeps me grounded no matter how hectic life gets.",
    name: "Hank Martin",
  },
  {
    message: "I love the combination of mindfulness and reflection. The journaling section especially helps me track my growth.",
    name: "Ivy Clark",
  },
];


    const infiniteFeedbacks = [...feedbacks, ...feedbacks, ...feedbacks];
    const itemWidth = 350;

    useEffect(() => {
        setCurrentIndex(feedbacks.length);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setStartX(e.clientX || e.touches?.[0]?.clientX || 0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
        const diff = currentX - startX;
        setTranslateX(diff);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (Math.abs(translateX) > 50) {
            if (translateX > 0) {
                moveSlide(-1);
            } else {
                moveSlide(1);
            }
        }
        setTranslateX(0);
    };

    const moveSlide = (direction) => {
        const newIndex = currentIndex + direction;
        setCurrentIndex(newIndex);
        setTimeout(() => {
            if (newIndex >= feedbacks.length * 2) {
                setCurrentIndex(feedbacks.length);
            } else if (newIndex < feedbacks.length) {
                setCurrentIndex(feedbacks.length * 2 - 1);
            }
        }, 300);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className='bg-transparent'>
        <div className=" w-full max-w-6xl mx-auto p-6  rounded-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">What Our Customers Say</h2>
                <p className="text-gray-600">Drag the cards to explore more testimonials</p>
            </div>

            <div className="relative overflow-hidden">
                <div
                    ref={sliderRef}
                    className="flex transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing select-none"
                    style={{
                        transform: `translateX(${-currentIndex * itemWidth + translateX}px)`,
                        width: `${infiniteFeedbacks.length * itemWidth}px`,
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >
                    {infiniteFeedbacks.map((feedback, index) => (
                        <div
                            key={`${feedback.id}-${Math.floor(index / feedbacks.length)}`}
                            className="flex-shrink-0 w-80 mx-4 bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                            style={{ width: '320px' }}
                        >
                            <div className="flex items-center mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{feedback.name}</h3>
                                    <p className="text-sm text-gray-500">{feedback.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          

            {/* <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <button
                    onClick={() => moveSlide(-1)}
                    className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                    <span className="text-gray-600 font-bold">‹</span>
                </button>
            </div> */}

            {/* <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <button
                    onClick={() => moveSlide(1)}
                    className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                    <span className="text-gray-600 font-bold">›</span>
                </button>
            </div> */}
        </div></div>
    );
};

export default FeedbackSlider;