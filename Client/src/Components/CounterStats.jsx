import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const CounterStats = ({ value, label, suffix,index }) => {
  const CounterRef = useRef(null);

  useEffect(() => {
    let counter = { val: 0 };

    gsap.to(counter, {
      val: value,
      duration: 2,
      ease: "power1.out",
      onUpdate: () => {
        if (CounterRef.current) {
          CounterRef.current.innerText = Math.floor(counter.val) + suffix;
        }
      },
    });
  }, [value, suffix]);

  return (
    <div
      key={label}
      className="rounded-xl border border-slate-200 bg-white/80 px-4 py-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-105 animate-[fadeInUp_0.6s_ease-out]"
      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
    >
      <div className="text-3xl font-bold text-slate-900" ref={CounterRef}>0{suffix}</div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  );
};

export default CounterStats;
