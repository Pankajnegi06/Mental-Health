import {
    FaFacebookF,
    FaTiktok,
    FaInstagram,
    FaX
  } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
  

const Footer2 = () => {

  const Navigate=useNavigate();

  return (
    <footer className="bg-[#FEFEF0] w-full text-[#262626] font-sans">
      {/* Top section */}
      <div className="max-w-[1280px] mx-auto py-[56px] px-[40px] flex flex-col lg:flex-row gap-[32px]">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-[48px] h-[48px] bg-[#262626] rounded-full flex items-center justify-center">
            <FaX className="text-white w-[24px] h-[24px]" /> {/* Replace with phone icon */}
          </div>
        </div>
  
        {/* Link groups */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[64px] gap-y-[16px] text-[14px] leading-[20px]">
          {[
            { title: "About Us", items: ["Our Story", "How We Price"] },
            { title: "Reach Us", items: ["Contact Support","Work With Us","Partnerships","Press"] },
            { title: "Gifting", items: ["Gift Happier","Redeem a Gift"] },
            { title: "Support", items: ["Free Meditations","FAQ","Help Center"] }
          ].map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-[16px] mb-2">{section.title}</h4>
              <ul className="space-y-[8px]  cursor-pointer">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
  
        {/* CTA Button */}
        <div className="ml-auto">
          <button  onClick={()=>window.open("/meditation","__blank")}
           className="bg-[#f2ca02] text-[#262626] font-medium text-[14px] leading-[20px] py-[12px] px-[24px] rounded-full">
            Try for free
          </button>
          <div className="flex items-center gap-[12px]  py-8">
            {[FaFacebookF, FaTiktok, FaInstagram, FaX].map((Icon, i) => (
              <div key={i} className="w-[28px] h-[28px] bg-[#262626] rounded-full flex items-center justify-center cursor-pointer">
                <Icon className="text-white w-[16px] h-[16px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
  
      {/* Bottom section */}
      <div className="max-w-[1280px] mx-auto pt-[24px] pb-[40px] px-[40px] flex flex-col md:flex-row justify-between items-center text-[12px] leading-[18px]">
        {/* Left: icon + copyright */}
        <div className="flex items-center gap-[8px] mb-[16px] md:mb-0">
          {/* <div className="w-[32px] h-[32px] bg-[#262626] rounded-full flex items-center justify-center">
            <FaX className="text-white w-[16px] h-[16px]" /> Replace with the small icon
          </div> */}
          <span>© 2025 Happier Meditation, Inc. All Rights Reserved</span>
        </div>
  
        {/* Right: links and socials */}
        <div className="flex flex-col md:flex-row items-center gap-[16px]">
          
          <div className="flex gap-[24px] text-[#262626] cursor-pointer">
            {["Sitemap","Privacy Policy","Terms & Conditions"].map((link, i) => (
              <a key={i} href="#" className="hover:underline">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer2