import React from 'react'
import Navbar from '../Components/Navbar'
import Hero from '../Components/Hero'
import LocationFeature from '../Components/LocationFeature'
import AIDoctorFeature from '../Components/AIDoctorFeature'
import About from '../Components/About'

import MyMap from '../Tracker/MyMap'
import MeetingFeature from '../Components/MeetingFeature'
import Dashboard from '../Components/Dashboard'
import ScrollToTop from '../Components/ScrollToTop'
import HeaderPage from '../Components/HeaderPage'
import BannerForMeditation from '../Components/BannerForMeditation'
import SliderComponent from '../Components/SliderComponent'
import AnalyseHeroPage from '../Components/AnalyseHeroPage'
import Brands from '../Components/Brands'
import Testimonials from '../Components/Testimonials'
import ReadMore from '../Components/ReadMore'
import FAQ from '../Components/FAQ'
import BenefitsSection from '../Components/Section_Benefits'
import Footer2 from '../Components/Footer2'
import Login from '../Auth/Login'
import Register from '../Auth/Register'
import DailyQuote from '../Components/DailyQuotes'

const CompletePage = () => {
  return (
    <>
    {/* <h1 className="text-xl font-bold mb-4">Google Map Example</h1> */}
    {/* <MyMap /> */}
    {/* <Dashboard/> */}
    {/* <Navbar/>
    <Hero/>
    <LocationFeature/>
    <MeetingFeature/>
    <AIDoctorFeature/>
    <ScrollToTop/>
    <About/>
    <Footer/> */}
    {/* <Login/> */}
    <HeaderPage/>
    <BannerForMeditation/>
    <SliderComponent/>
    <AnalyseHeroPage/>
    <Brands/>
    <DailyQuote/>
    <Testimonials/>
    <ReadMore/>
    <FAQ/>
    <BenefitsSection/>
    <Footer2/>
    </>
)
}

export default CompletePage
