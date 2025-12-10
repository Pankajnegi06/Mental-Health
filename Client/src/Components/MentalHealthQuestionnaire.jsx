import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaArrowRight, FaArrowLeft, FaChartBar, FaLock, FaHistory, FaSignInAlt, FaVolumeUp, FaVolumeMute, FaHome } from "react-icons/fa";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAppContext } from "../Context/AppContext";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MentalHealthQuestionnaire = () => {
  const { isLoggedIn, BACKEND_URL, getAuthState } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessmentMode, setAssessmentMode] = useState(location.state?.mode || 'detailed');
  const [currentScale, setCurrentScale] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    phq9: [],
    gad7: [],
    pss10: [],
    dass21: []
  });
  const [showResults, setShowResults] = useState(false);
  const [showBriefReport, setShowBriefReport] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [scores, setScores] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState(null);
  const [questionnaireHistory, setQuestionnaireHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Calming background music URL (royalty-free meditation music)
  const backgroundMusicUrl = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";

  // PHQ-9 Questions (0-3 scale)
  const phq9Questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself"
  ];

  // GAD-7 Questions (0-3 scale)
  const gad7Questions = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen"
  ];

  // PSS-10 Questions (0-4 scale)
  const pss10Questions = [
    "In the last month, how often have you been upset because of something that happened unexpectedly?",
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt nervous and 'stressed'?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    "In the last month, how often have you been able to control irritations in your life?",
    "In the last month, how often have you felt that you were on top of things?",
    "In the last month, how often have you been angered because of things that were outside of your control?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
  ];

  // DASS-21 Questions (0-3 scale)
  const dass21Questions = [
    "I found it hard to wind down",
    "I was aware of dryness of my mouth",
    "I couldn't seem to experience any positive feeling at all",
    "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)",
    "I found it difficult to work up the initiative to do things",
    "I tended to over-react to situations",
    "I experienced trembling (e.g., in the hands)",
    "I felt that I was using a lot of nervous energy",
    "I was worried about situations in which I might panic and make a fool of myself",
    "I felt that I had nothing to look forward to",
    "I found myself getting agitated",
    "I found it difficult to relax",
    "I felt down-hearted and blue",
    "I was intolerant of anything that kept me from getting on with what I was doing",
    "I felt I was close to panic",
    "I was unable to become enthusiastic about anything",
    "I felt I wasn't worth much as a person",
    "I felt that I was rather touchy",
    "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)",
    "I felt scared without any good reason",
    "I felt that life was meaningless"
  ];

  const scaleNames = ["PHQ-9", "GAD-7", "PSS-10", "DASS-21"];
  const scaleDescriptions = [
    "Patient Health Questionnaire - Depression Screening",
    "Generalized Anxiety Disorder Assessment",
    "Perceived Stress Scale",
    "Depression Anxiety Stress Scales"
  ];

  // Music control functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error("Audio play failed:", error);
          toast.error("Could not play background music");
        });
        setIsMusicPlaying(true);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchQuestionnaireHistory();
    }
  }, [isLoggedIn]);

  const fetchQuestionnaireHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/questionnaire/history`, {
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.status === 1) {
        const sortedHistory = (response.data.data || []).sort((a, b) => 
          new Date(a.completedAt) - new Date(b.completedAt)
        );
        setQuestionnaireHistory(sortedHistory);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view your assessment history");
        getAuthState();
      }
    }
  };

  const getCurrentQuestions = () => {
    switch (currentScale) {
      case 0: return phq9Questions;
      case 1: return gad7Questions;
      case 2: return pss10Questions;
      case 3: return dass21Questions;
      default: return [];
    }
  };

  const getCurrentAnswers = () => {
    switch (currentScale) {
      case 0: return answers.phq9;
      case 1: return answers.gad7;
      case 2: return answers.pss10;
      case 3: return answers.dass21;
      default: return [];
    }
  };

  const getMaxValue = () => {
    switch (currentScale) {
      case 0: return 3;
      case 1: return 3;
      case 2: return 4;
      case 3: return 3;
      default: return 3;
    }
  };

  const getScaleLabels = () => {
    const maxValue = getMaxValue();
    if (maxValue === 3) {
      return ["Not at all", "Several days", "More than half the days", "Nearly every day"];
    } else {
      return ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];
    }
  };

  const handleAnswer = (value) => {
    const currentAnswers = getCurrentAnswers();
    const newAnswers = [...currentAnswers];
    newAnswers[currentQuestion] = value;
    
    setAnswers(prev => {
      const key = currentScale === 0 ? 'phq9' : currentScale === 1 ? 'gad7' : currentScale === 2 ? 'pss10' : 'dass21';
      return { ...prev, [key]: newAnswers };
    });
  };

  const handleNext = () => {
  const questions = getCurrentQuestions();
  const currentAnswers = getCurrentAnswers();
  
  if (currentAnswers[currentQuestion] === undefined) {
    toast.error("Please select an answer before continuing");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    // Determine the last scale based on assessment mode
    const lastScale = assessmentMode === 'quick' ? 1 : 3;
    
    if (currentScale < lastScale) {
      setCurrentScale(currentScale + 1);
      setCurrentQuestion(0);
      toast.success(`${scaleNames[currentScale]} completed!`);
    } else {
      calculateScores();
      setShowResults(true);
    }
  }
};

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentScale > 0) {
      setCurrentScale(currentScale - 1);
      const prevQuestions = currentScale === 1 ? gad7Questions : currentScale === 2 ? pss10Questions : dass21Questions;
      setCurrentQuestion(prevQuestions.length - 1);
    }
  };

  const calculateScores = () => {
  const phq9Score = answers.phq9.reduce((sum, val) => sum + (val || 0), 0);
  const gad7Score = answers.gad7.reduce((sum, val) => sum + (val || 0), 0);
  
  let pss10Score = 0;
  let dassDepression = 0;
  let dassAnxiety = 0;
  let dassStress = 0;

  // Only calculate PSS-10 and DASS-21 for detailed mode
  if (assessmentMode === 'detailed') {
    const pss10Reversed = [3, 4, 6, 7];
    answers.pss10.forEach((val, idx) => {
      if (val !== undefined) {
        if (pss10Reversed.includes(idx)) {
          pss10Score += (4 - val);
        } else {
          pss10Score += val;
        }
      }
    });
    
    const depressionItems = [2, 4, 9, 12, 15, 16, 20];
    const anxietyItems = [1, 3, 6, 8, 14, 18, 19];
    const stressItems = [0, 5, 7, 10, 11, 13, 17];
    
    dassDepression = depressionItems.reduce((sum, idx) => sum + (answers.dass21[idx] || 0) * 2, 0);
    dassAnxiety = anxietyItems.reduce((sum, idx) => sum + (answers.dass21[idx] || 0) * 2, 0);
    dassStress = stressItems.reduce((sum, idx) => sum + (answers.dass21[idx] || 0) * 2, 0);
  }
  
  const calculatedScores = {
    phq9: phq9Score,
    gad7: gad7Score,
    pss10: pss10Score,
    dass21: {
      depression: dassDepression,
      anxiety: dassAnxiety,
      stress: dassStress
    }
  };
  
  setScores(calculatedScores);
  
  // Show brief report first for all users
  setShowBriefReport(true);
};

  const saveQuestionnaire = async (calculatedScores) => {
  setSaving(true);
  try {
    const phq9Severity = getPHQ9Severity(calculatedScores.phq9).level;
    const gad7Severity = getGAD7Severity(calculatedScores.gad7).level;

    const payload = {
      assessmentMode,
      phq9: {
        score: calculatedScores.phq9,
        answers: answers.phq9,
        severity: phq9Severity,
      },
      gad7: {
        score: calculatedScores.gad7,
        answers: answers.gad7,
        severity: gad7Severity,
      },
    };

    // Add PSS-10 and DASS-21 only for detailed mode
    if (assessmentMode === 'detailed') {
      const pss10Severity = getPSS10Severity(calculatedScores.pss10).level;
      const dassDepressionSeverity = getDASS21Severity(calculatedScores.dass21.depression, "depression").level;
      const dassAnxietySeverity = getDASS21Severity(calculatedScores.dass21.anxiety, "anxiety").level;
      const dassStressSeverity = getDASS21Severity(calculatedScores.dass21.stress, "stress").level;

      payload.pss10 = {
        score: calculatedScores.pss10,
        answers: answers.pss10,
        severity: pss10Severity,
      };

      payload.dass21 = {
        depression: {
          score: calculatedScores.dass21.depression,
          severity: dassDepressionSeverity,
        },
        anxiety: {
          score: calculatedScores.dass21.anxiety,
          severity: dassAnxietySeverity,
        },
        stress: {
          score: calculatedScores.dass21.stress,
          severity: dassStressSeverity,
        },
        answers: answers.dass21,
      };
    }

    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${BACKEND_URL}/api/questionnaire/save`,
      payload,
      { 
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data.status === 1) {
      const savedQuestionnaireId = response.data.data._id;
      setQuestionnaireId(savedQuestionnaireId);
      toast.success("Results saved successfully!");
      fetchQuestionnaireHistory();
      
      // Generate AI report
      await generateAIReport(savedQuestionnaireId);
    }
  } catch (error) {
    toast.error("Failed to save results. Please try again.");
    console.error("Error saving questionnaire:", error);
    if (error.response) {
      console.error("Server error response:", error.response.data);
    }
  } finally {
    setSaving(false);
  }
};

  const generateAIReport = async (qId) => {
    setGeneratingReport(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/questionnaire/generate-report`,
        { questionnaireId: qId },
        {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 1) {
        setAiReport(response.data.data.aiReport);
        toast.success("AI report generated successfully!");
      }
    } catch (error) {
      console.error("Error generating AI report:", error);
      toast.error("Could not generate AI recommendations. Showing basic results.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleLoginAndSave = () => {
    navigate("/LoginPage", { state: { returnTo: "/MentalHealthQuestionnaire", saveResults: true, results: scores } });
  };

  const getPHQ9Severity = (score) => {
    if (score <= 4) return { level: "Minimal", color: "text-green-600" };
    if (score <= 9) return { level: "Mild", color: "text-yellow-600" };
    if (score <= 14) return { level: "Moderate", color: "text-orange-600" };
    if (score <= 19) return { level: "Moderately Severe", color: "text-red-600" };
    return { level: "Severe", color: "text-red-800" };
  };

  const getGAD7Severity = (score) => {
    if (score <= 4) return { level: "Minimal", color: "text-green-600" };
    if (score <= 9) return { level: "Mild", color: "text-yellow-600" };
    if (score <= 14) return { level: "Moderate", color: "text-orange-600" };
    return { level: "Severe", color: "text-red-600" };
  };

  const getPSS10Severity = (score) => {
    if (score <= 13) return { level: "Low", color: "text-green-600" };
    if (score <= 26) return { level: "Moderate", color: "text-yellow-600" };
    return { level: "High", color: "text-red-600" };
  };

  const getDASS21Severity = (score, type) => {
    if (type === "depression") {
      if (score <= 9) return { level: "Normal", color: "text-green-600" };
      if (score <= 13) return { level: "Mild", color: "text-yellow-600" };
      if (score <= 20) return { level: "Moderate", color: "text-orange-600" };
      if (score <= 27) return { level: "Severe", color: "text-red-600" };
      return { level: "Extremely Severe", color: "text-red-800" };
    } else if (type === "anxiety") {
      if (score <= 7) return { level: "Normal", color: "text-green-600" };
      if (score <= 9) return { level: "Mild", color: "text-yellow-600" };
      if (score <= 14) return { level: "Moderate", color: "text-orange-600" };
      if (score <= 19) return { level: "Severe", color: "text-red-600" };
      return { level: "Extremely Severe", color: "text-red-800" };
    } else {
      if (score <= 14) return { level: "Normal", color: "text-green-600" };
      if (score <= 18) return { level: "Mild", color: "text-yellow-600" };
      if (score <= 25) return { level: "Moderate", color: "text-orange-600" };
      if (score <= 33) return { level: "Severe", color: "text-red-600" };
      return { level: "Extremely Severe", color: "text-red-800" };
    }
  };

  const resetQuestionnaire = () => {
    setCurrentScale(0);
    setCurrentQuestion(0);
    setAnswers({ phq9: [], gad7: [], pss10: [], dass21: [] });
    setShowResults(false);
    setShowBriefReport(false);
    setShowLoginPrompt(false);
    setScores({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForChart = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data for PHQ-9
  const getPHQ9ChartData = () => {
    if (!questionnaireHistory || questionnaireHistory.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = questionnaireHistory.map(item => formatDateForChart(item.completedAt));
    const scores = questionnaireHistory.map(item => item.phq9.score);
    const maxScore = 27;

    return {
      labels,
      datasets: [
        {
          label: 'PHQ-9 Score',
          data: scores,
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(139, 92, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  // Prepare chart data for GAD-7
  const getGAD7ChartData = () => {
    if (!questionnaireHistory || questionnaireHistory.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = questionnaireHistory.map(item => formatDateForChart(item.completedAt));
    const scores = questionnaireHistory.map(item => item.gad7.score);
    const maxScore = 21;

    return {
      labels,
      datasets: [
        {
          label: 'GAD-7 Score',
          data: scores,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  // Prepare chart data for PSS-10
  const getPSS10ChartData = () => {
    if (!questionnaireHistory || questionnaireHistory.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = questionnaireHistory.map(item => formatDateForChart(item.completedAt));
    const scores = questionnaireHistory.map(item => item.pss10.score);
    const maxScore = 40;

    return {
      labels,
      datasets: [
        {
          label: 'PSS-10 Score',
          data: scores,
          borderColor: 'rgba(20, 184, 166, 1)',
          backgroundColor: 'rgba(20, 184, 166, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(20, 184, 166, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  // Prepare chart data for DASS-21
  const getDASS21ChartData = () => {
    if (!questionnaireHistory || questionnaireHistory.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = questionnaireHistory.map(item => formatDateForChart(item.completedAt));
    const depressionScores = questionnaireHistory.map(item => item.dass21.depression.score);
    const anxietyScores = questionnaireHistory.map(item => item.dass21.anxiety.score);
    const stressScores = questionnaireHistory.map(item => item.dass21.stress.score);

    return {
      labels,
      datasets: [
        {
          label: 'Depression',
          data: depressionScores,
          borderColor: 'rgba(236, 72, 153, 1)',
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(236, 72, 153, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Anxiety',
          data: anxietyScores,
          borderColor: 'rgba(249, 115, 22, 1)',
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(249, 115, 22, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Stress',
          data: stressScores,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(168, 85, 247, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => `Date: ${context[0].label}`,
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          stepSize: 5
        }
      }
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 8,
        hitRadius: 10,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // History View
  if (showHistory && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <Toaster />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Assessment History
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              className="px-6 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 shadow-lg font-semibold"
            >
              Back to Assessment
            </button>
          </div>

          {questionnaireHistory.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No assessment history found</p>
              <p className="text-gray-500 mt-2">Complete an assessment to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Analytics Charts Section */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaChartBar className="text-purple-600" />
                  Assessment Trends & Analytics
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* PHQ-9 Chart */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                      PHQ-9 (Depression) Trend
                    </h3>
                    <div className="h-64">
                      <Line data={getPHQ9ChartData()} options={{
                        ...lineChartOptions,
                        scales: {
                          ...lineChartOptions.scales,
                          y: {
                            ...lineChartOptions.scales.y,
                            max: 27,
                            ticks: {
                              ...lineChartOptions.scales.y.ticks,
                              callback: (value) => `${value}/27`
                            }
                          }
                        }
                      }} />
                    </div>
                    {questionnaireHistory.length > 0 && (
                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Latest: <span className="font-bold text-purple-600">{questionnaireHistory[questionnaireHistory.length - 1].phq9.score}/27</span>
                        </span>
                        <span className="text-gray-600">
                          {questionnaireHistory[questionnaireHistory.length - 1].phq9.severity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* GAD-7 Chart */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                      GAD-7 (Anxiety) Trend
                    </h3>
                    <div className="h-64">
                      <Line data={getGAD7ChartData()} options={{
                        ...lineChartOptions,
                        scales: {
                          ...lineChartOptions.scales,
                          y: {
                            ...lineChartOptions.scales.y,
                            max: 21,
                            ticks: {
                              ...lineChartOptions.scales.y.ticks,
                              callback: (value) => `${value}/21`
                            }
                          }
                        }
                      }} />
                    </div>
                    {questionnaireHistory.length > 0 && (
                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Latest: <span className="font-bold text-blue-600">{questionnaireHistory[questionnaireHistory.length - 1].gad7.score}/21</span>
                        </span>
                        <span className="text-gray-600">
                          {questionnaireHistory[questionnaireHistory.length - 1].gad7.severity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PSS-10 Chart - Only show if history has PSS-10 data */}
                  {questionnaireHistory.some(item => item.pss10) && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-teal-600 rounded-full"></span>
                      PSS-10 (Stress) Trend
                    </h3>
                    <div className="h-64">
                      <Line data={getPSS10ChartData()} options={{
                        ...lineChartOptions,
                        scales: {
                          ...lineChartOptions.scales,
                          y: {
                            ...lineChartOptions.scales.y,
                            max: 40,
                            ticks: {
                              ...lineChartOptions.scales.y.ticks,
                              callback: (value) => `${value}/40`
                            }
                          }
                        }
                      }} />
                    </div>
                    {questionnaireHistory.length > 0 && questionnaireHistory[questionnaireHistory.length - 1].pss10 && (
                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Latest: <span className="font-bold text-teal-600">{questionnaireHistory[questionnaireHistory.length - 1].pss10.score}/40</span>
                        </span>
                        <span className="text-gray-600">
                          {questionnaireHistory[questionnaireHistory.length - 1].pss10.severity}
                        </span>
                      </div>
                    )}
                  </div>
                  )}

                  {/* DASS-21 Chart - Only show if history has DASS-21 data */}
                  {questionnaireHistory.some(item => item.dass21) && (
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-pink-600 rounded-full"></span>
                      DASS-21 (Depression, Anxiety, Stress) Trend
                    </h3>
                    <div className="h-64">
                      <Line data={getDASS21ChartData()} options={{
                        ...lineChartOptions,
                        scales: {
                          ...lineChartOptions.scales,
                          y: {
                            ...lineChartOptions.scales.y,
                            max: 42,
                            ticks: {
                              ...lineChartOptions.scales.y.ticks,
                              callback: (value) => `${value}/42`
                            }
                          }
                        }
                      }} />
                    </div>
                    {questionnaireHistory.length > 0 && questionnaireHistory[questionnaireHistory.length - 1].dass21 && (
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-600">Depression</p>
                          <p className="font-bold text-pink-600">{questionnaireHistory[questionnaireHistory.length - 1].dass21.depression.score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Anxiety</p>
                          <p className="font-bold text-orange-600">{questionnaireHistory[questionnaireHistory.length - 1].dass21.anxiety.score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Stress</p>
                          <p className="font-bold text-purple-600">{questionnaireHistory[questionnaireHistory.length - 1].dass21.stress.score}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {/* Individual Assessment Cards */}
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Assessment History</h2>
                {questionnaireHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Assessment #{questionnaireHistory.length - index}
                      </h3>
                      <span className="text-sm text-gray-500">{formatDate(item.completedAt)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <p className="text-sm text-gray-600 mb-1">PHQ-9</p>
                        <p className="text-2xl font-bold text-purple-600">{item.phq9.score}/27</p>
                        <p className="text-sm text-gray-600">{item.phq9.severity}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">GAD-7</p>
                        <p className="text-2xl font-bold text-blue-600">{item.gad7.score}/21</p>
                        <p className="text-sm text-gray-600">{item.gad7.severity}</p>
                      </div>
                      {item.pss10 && (
                        <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-200">
                          <p className="text-sm text-gray-600 mb-1">PSS-10</p>
                          <p className="text-2xl font-bold text-teal-600">{item.pss10.score}/40</p>
                          <p className="text-sm text-gray-600">{item.pss10.severity}</p>
                        </div>
                      )}
                      {item.dass21 && (
                        <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
                          <p className="text-sm text-gray-600 mb-1">DASS-21</p>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-pink-600">D: {item.dass21.depression.score} ({item.dass21.depression.severity})</p>
                            <p className="text-sm font-bold text-orange-600">A: {item.dass21.anxiety.score} ({item.dass21.anxiety.severity})</p>
                            <p className="text-sm font-bold text-purple-600">S: {item.dass21.stress.score} ({item.dass21.stress.severity})</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Brief Report View (shown immediately after completing questionnaire)
  if (showBriefReport && !showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <Toaster />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <FaCheckCircle className="text-6xl text-green-500" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Assessment Complete!
              </h1>
              <p className="text-gray-600 text-lg">Here's a brief overview of your mental health assessment</p>
            </div>

            {/* Brief Results Summary */}
            <div className="space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Depression (PHQ-9)</h3>
                    <p className="text-sm text-gray-600">Patient Health Questionnaire</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{scores.phq9}/27</p>
                    <p className={`text-sm font-semibold ${getPHQ9Severity(scores.phq9).color}`}>
                      {getPHQ9Severity(scores.phq9).level}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5 border-2 border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Anxiety (GAD-7)</h3>
                    <p className="text-sm text-gray-600">Generalized Anxiety Disorder</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{scores.gad7}/21</p>
                    <p className={`text-sm font-semibold ${getGAD7Severity(scores.gad7).color}`}>
                      {getGAD7Severity(scores.gad7).level}
                    </p>
                  </div>
                </div>
              </motion.div>

              {assessmentMode === 'detailed' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-5 border-2 border-teal-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Stress (PSS-10)</h3>
                    <p className="text-sm text-gray-600">Perceived Stress Scale</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">{scores.pss10}/40</p>
                    <p className={`text-sm font-semibold ${getPSS10Severity(scores.pss10).color}`}>
                      {getPSS10Severity(scores.pss10).level}
                    </p>
                  </div>
                </div>
              </motion.div>
              )}

              {assessmentMode === 'detailed' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border-2 border-pink-200"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">DASS-21 Scores</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Depression</p>
                      <p className="text-xl font-bold text-pink-600">{scores.dass21.depression}</p>
                      <p className={`text-xs font-semibold ${getDASS21Severity(scores.dass21.depression, "depression").color}`}>
                        {getDASS21Severity(scores.dass21.depression, "depression").level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Anxiety</p>
                      <p className="text-xl font-bold text-pink-600">{scores.dass21.anxiety}</p>
                      <p className={`text-xs font-semibold ${getDASS21Severity(scores.dass21.anxiety, "anxiety").color}`}>
                        {getDASS21Severity(scores.dass21.anxiety, "anxiety").level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Stress</p>
                      <p className="text-xl font-bold text-pink-600">{scores.dass21.stress}</p>
                      <p className={`text-xs font-semibold ${getDASS21Severity(scores.dass21.stress, "stress").color}`}>
                        {getDASS21Severity(scores.dass21.stress, "stress").level}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Want to see detailed reports and track your progress?
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Create an account or sign in to access comprehensive charts, history tracking, and personalized recommendations
              </p>
            </div>

            {/* Action Buttons */}
            {!isLoggedIn ? (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/register", { state: { fromQuestionnaire: true, scores } })}
                  className="w-full px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg"
                >
                  Create Account & View Detailed Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login", { state: { fromQuestionnaire: true, scores } })}
                  className="w-full px-8 py-4 rounded-xl text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 transition-all duration-300 font-semibold text-lg shadow-lg"
                >
                  Sign In (Existing User)
                </motion.button>
                <button
                  onClick={() => {
                    setShowBriefReport(false);
                    setShowResults(true);
                  }}
                  className="w-full px-8 py-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-300 font-medium text-base"
                >
                  Continue Without Account (View Full Results)
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  await saveQuestionnaire(scores);
                  setShowBriefReport(false);
                  setShowResults(true);
                }}
                className="w-full px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg"
              >
                Save & View Detailed Report
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Login Prompt Modal (kept for backward compatibility but not used in new flow)
  if (showLoginPrompt && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 flex items-center justify-center">
        <Toaster />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-4xl text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Save Your Results
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Sign in to save your assessment results and track your progress over time
            </p>
            <p className="text-sm text-gray-500">
              You can still view your results below, but they won't be saved without an account
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginAndSave}
              className="w-full px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <FaSignInAlt />
              Sign In to Save Results
            </motion.button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full px-8 py-4 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 font-semibold text-lg"
            >
              Continue Without Saving
            </button>
          </div>

          {/* Show results preview */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Results Preview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PHQ-9 (Depression):</span>
                <span className="font-semibold">{scores.phq9}/27 - {getPHQ9Severity(scores.phq9).level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GAD-7 (Anxiety):</span>
                <span className="font-semibold">{scores.gad7}/21 - {getGAD7Severity(scores.gad7).level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PSS-10 (Stress):</span>
                <span className="font-semibold">{scores.pss10}/40 - {getPSS10Severity(scores.pss10).level}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results View
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <Toaster />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-block mb-4"
                >
                  <FaChartBar className="text-6xl text-purple-500" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  Assessment Results
                </h1>
                <p className="text-gray-600 text-lg">Your mental health assessment scores</p>
              </div>
              {isLoggedIn && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 transition-all font-semibold flex items-center gap-2"
                >
                  <FaHistory />
                  History
                </button>
              )}
            </div>

            {saving && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-blue-600 font-semibold">Saving your results...</p>
              </div>
            )}

            <div className="space-y-6">
              {/* PHQ-9 Results */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">PHQ-9 (Depression)</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-purple-600">{scores.phq9}/27</span>
                  <span className={`text-lg font-semibold ${getPHQ9Severity(scores.phq9).color}`}>
                    {getPHQ9Severity(scores.phq9).level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(scores.phq9 / 27) * 100}%` }}
                  ></div>
                </div>
              </motion.div>

              {/* GAD-7 Results */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border-2 border-blue-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">GAD-7 (Anxiety)</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-blue-600">{scores.gad7}/21</span>
                  <span className={`text-lg font-semibold ${getGAD7Severity(scores.gad7).color}`}>
                    {getGAD7Severity(scores.gad7).level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(scores.gad7 / 21) * 100}%` }}
                  ></div>
                </div>
              </motion.div>

              {/* PSS-10 Results */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl p-6 border-2 border-teal-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">PSS-10 (Perceived Stress)</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-teal-600">{scores.pss10}/40</span>
                  <span className={`text-lg font-semibold ${getPSS10Severity(scores.pss10).color}`}>
                    {getPSS10Severity(scores.pss10).level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(scores.pss10 / 40) * 100}%` }}
                  ></div>
                </div>
              </motion.div>

              {/* DASS-21 Results */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">DASS-21</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Depression</span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-pink-600">{scores.dass21.depression}/42</span>
                        <span className={`font-semibold ${getDASS21Severity(scores.dass21.depression, "depression").color}`}>
                          {getDASS21Severity(scores.dass21.depression, "depression").level}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(scores.dass21.depression / 42) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Anxiety</span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-pink-600">{scores.dass21.anxiety}/42</span>
                        <span className={`font-semibold ${getDASS21Severity(scores.dass21.anxiety, "anxiety").color}`}>
                          {getDASS21Severity(scores.dass21.anxiety, "anxiety").level}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(scores.dass21.anxiety / 42) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Stress</span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-pink-600">{scores.dass21.stress}/42</span>
                        <span className={`font-semibold ${getDASS21Severity(scores.dass21.stress, "stress").color}`}>
                          {getDASS21Severity(scores.dass21.stress, "stress").level}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(scores.dass21.stress / 42) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AI Report Section */}
            {generatingReport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-purple-600 font-semibold">Generating your personalized AI report...</p>
                </div>
              </motion.div>
            )}

            {aiReport && !generatingReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                {/* Overall Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-3xl">🤖</span>
                    AI-Powered Insights
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{aiReport.overallSummary}</p>
                </div>

                {/* Depression Section */}
                {aiReport.depression && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                    <h3 className="text-xl font-bold text-purple-600 mb-3">😔 Depression Analysis</h3>
                    <p className="text-gray-700 mb-4">{aiReport.depression.analysis}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">💡 Recommendations:</h4>
                        <ul className="space-y-2">
                          {aiReport.depression.recommendations?.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-500 mt-1">•</span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">🛠️ Coping Strategies:</h4>
                        <ul className="space-y-2">
                          {aiReport.depression.copingStrategies?.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-500 mt-1">✓</span>
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anxiety Section */}
                {aiReport.anxiety && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                    <h3 className="text-xl font-bold text-blue-600 mb-3">😰 Anxiety Analysis</h3>
                    <p className="text-gray-700 mb-4">{aiReport.anxiety.analysis}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">💡 Recommendations:</h4>
                        <ul className="space-y-2">
                          {aiReport.anxiety.recommendations?.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">🛠️ Coping Strategies:</h4>
                        <ul className="space-y-2">
                          {aiReport.anxiety.copingStrategies?.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">✓</span>
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stress Section */}
                {aiReport.stress && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100">
                    <h3 className="text-xl font-bold text-teal-600 mb-3">😓 Stress Analysis</h3>
                    <p className="text-gray-700 mb-4">{aiReport.stress.analysis}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">💡 Recommendations:</h4>
                        <ul className="space-y-2">
                          {aiReport.stress.recommendations?.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-500 mt-1">•</span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">🛠️ Coping Strategies:</h4>
                        <ul className="space-y-2">
                          {aiReport.stress.copingStrategies?.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-500 mt-1">✓</span>
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {aiReport.nextSteps && aiReport.nextSteps.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-green-700 mb-4">🎯 Your Next Steps</h3>
                    <ol className="space-y-3">
                      {aiReport.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Professional Help Recommendation */}
                {aiReport.professionalHelpRecommended && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">⚠️</span>
                      <div>
                        <h3 className="text-xl font-bold text-red-700 mb-2">Professional Support Recommended</h3>
                        <p className="text-gray-700">
                          Based on your assessment results, we strongly recommend consulting with a mental health professional. 
                          They can provide personalized treatment and support tailored to your specific needs.
                        </p>
                        <p className="text-gray-700 mt-3 font-semibold">
                          If you're in crisis, please contact a crisis helpline immediately (988 in the US).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}


            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuestionnaire}
              className="w-full mt-8 px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg"
            >
              Take Assessment Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Questionnaire View
  const questions = getCurrentQuestions();
  const currentAnswers = getCurrentAnswers();
  const scaleWeight = assessmentMode === 'quick' ? 50 : 25;
  const progress = ((currentScale * scaleWeight) + ((currentQuestion + 1) / questions.length) * scaleWeight);
  
  // Calculate total questions based on assessment mode
  const totalQuestions = assessmentMode === 'quick' 
    ? phq9Questions.length + gad7Questions.length  // Quick: 9 + 7 = 16
    : phq9Questions.length + gad7Questions.length + pss10Questions.length + dass21Questions.length; // Detailed: 9 + 7 + 10 + 21 = 47
  
  const answeredQuestions = Object.values(answers).flat().filter(a => a !== undefined).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <Toaster />
      
      {/* Background Music Player */}
      <audio ref={audioRef} loop>
        <source src={backgroundMusicUrl} type="audio/mpeg" />
      </audio>
      
      {/* Music Control Button - Fixed Position */}
      {!showResults && !showBriefReport && !showHistory && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={toggleMusic}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          title={isMusicPlaying ? "Pause Music" : "Play Calming Music"}
        >
          {isMusicPlaying ? <FaVolumeUp className="text-2xl" /> : <FaVolumeMute className="text-2xl" />}
        </motion.button>
      )}
      <div className="max-w-3xl mx-auto">
        {/* Existing User Login Banner */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white rounded-2xl shadow-lg p-4 border-2 border-blue-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FaSignInAlt className="text-2xl text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">Already have an account?</p>
                  <p className="text-sm text-gray-600">Skip the form and access your dashboard directly</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all duration-300 font-semibold shadow-lg whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <div className="flex justify-center items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Mental Health Assessment
            </h1>
            <button
              onClick={() => navigate("/home")}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              title="Go to Home"
            >
              <FaHome className="text-2xl" />
            </button>
          </div>
          <p className="text-gray-600 text-lg mb-2">{scaleNames[currentScale]}</p>
          <p className="text-gray-500 text-sm">{scaleDescriptions[currentScale]}</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {answeredQuestions} of {totalQuestions} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 h-3 rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentScale}-${currentQuestion}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 leading-relaxed">
              {questions[currentQuestion]}
            </h2>

            <div className="space-y-4">
              {getScaleLabels().map((label, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    currentAnswers[currentQuestion] === index
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{label}</span>
                    {currentAnswers[currentQuestion] === index && (
                      <FaCheckCircle className="text-xl" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0 && currentScale === 0}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              currentQuestion === 0 && currentScale === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaArrowLeft />
              Previous
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex-1 px-6 py-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              {currentQuestion === questions.length - 1 && currentScale === (assessmentMode === 'quick' ? 1 : 3) ? "Complete" : "Next"}
              <FaArrowRight />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthQuestionnaire;
