import { useState } from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Navbar from './Components/Navbar';
import CompletePage from './Page/CompletePage';
import About from './Components/About';
import Contact from './Components/Contact';
import AIHealthAssistant from './AI_DOCTOR/AIHealthAssistant';
import Hero from './Components/Hero';
import LocationFeature from './Components/LocationFeature';
import LocationTracker from './Tracker/LocationTracker';
import AIDoctorFeature from './Components/AIDoctorFeature';

import { MyScreen } from './CameraSecurity/screens/MyScreen';
import LobbyScreen from './CameraSecurity/screens/Lobby';
import Docs from './Components/Docs';
import Developer from './Components/Developer';
import MeetingFeature from './Components/MeetingFeature';
import Dashboard from './Components/Dashboard';
import Login from './Auth/Login';
import Register from './Auth/Register';
import RegisteredEmail from './Auth/RegisteredEmail';
import EnterOTPforPassword from './Auth/EnterOTPforPassword';
import ResetPassword from './Auth/ResetPassword';
import VerifyEmail from './Auth/VerifyEmail';
import ProfileSection from './Components/ProfileSection';
import AppointmentTabel from './Components/AppointmentTabel';
import MeditationAndExercise from './Components/MeditationAndExercise';
import ActualAnalyser from './Components/ActualAnalyser';
import BlogTop from './Components/HarshBlog';
import FAQ from './Components/FAQ';
import MoodJournal from './Components/Mood';
import MentalHealthQuestionnaire from './Components/MentalHealthQuestionnaire';
import MentalHealthDashboard from './Components/MentalHealthDashboard';
import QuestionnaireLanding from './Components/QuestionnaireLanding';
import MoodDetector from './Components/MoodDetector';

// Layout component that includes Navbar and Footer
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    
    </div>
  );
};

// Pages that don't need Navbar/Footer
const AuthLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<QuestionnaireLanding />} />
          <Route path="/MentalHealthQuestionnaire" element={<MentalHealthQuestionnaire />} />
          <Route path="/home" element={<CompletePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-health-assistant" element={<AIHealthAssistant />} />
          <Route path="/location" element={<LocationFeature />} />
          <Route path="/location-tracker" element={<LocationTracker />} />
          <Route path="/ai-doctor" element={<AIDoctorFeature />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/meeting" element={<MeetingFeature />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileSection />} />
          <Route path="/appointments" element={<AppointmentTabel />} />
          <Route path="/meditation" element={<MeditationAndExercise />} />
          <Route path="/analyzer" element={<ActualAnalyser />} />
          <Route path="/blog" element={<BlogTop />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/mood-journal" element={<MoodJournal />} />
          <Route path="/questionnaire" element={<QuestionnaireLanding />} />
          <Route path="/mental-health" element={<MentalHealthDashboard />} />
          <Route path="/mood-detector" element={<MoodDetector />} />
        </Route>

        {/* Auth routes without Navbar/Footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<RegisteredEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/otp-verification" element={<EnterOTPforPassword />} />
        </Route>

        {/* Meeting routes without Navbar/Footer */}
        <Route path="/meeting-room" element={<MyScreen />} />
        <Route path="/meeting-room/:roomid" element={<MyScreen />} />
        <Route path="/lobby" element={<LobbyScreen />} />
      </Routes>
    </>
  )
}

export default App
