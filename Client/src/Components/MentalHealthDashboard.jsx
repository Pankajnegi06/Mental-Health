import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { 
  FiActivity, 
  FiPlus, 
  FiMoon, 
  FiTrendingUp, 
  FiRefreshCw,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import { useAppContext } from '../Context/AppContext';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper function to get date range based on time range selection
const getDateRange = (range) => {
  const now = new Date();
  const from = new Date(now);
  
  switch (range) {
    case 'week':
      from.setDate(now.getDate() - 7);
      break;
    case 'month':
      from.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      from.setMonth(now.getMonth() - 3);
      break;
    default:
      from.setDate(now.getDate() - 7);
  }
  
  return { from, to: now };
};

// Helper function to format date for display
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const MentalHealthDashboard = () => {
  const { userData: user, isLoggedIn, getAuthState, BACKEND_URL } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [moodData, setMoodData] = useState({
    moodStats: [],
    moodTrends: [],
    activityCorrelations: []
  });
  const [insights, setInsights] = useState([]);
  const [moodMapData, setMoodMapData] = useState({
    locations: [],
    totalLocations: 0,
    totalEntries: 0
  });
  const [showMoodMap, setShowMoodMap] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token && !isLoggedIn) {
        await getAuthState();
      }
    };
    checkAuth();
  }, []);

  // Map time range options to number of days
  const timeRangeToDays = {
    'week': 7,
    'month': 30,
    'quarter': 90
  };

  const fetchData = useCallback(async () => {
    console.log('Starting data fetch...');
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching dashboard data...');
      console.log('Time range:', timeRange);
      console.log('BACKEND_URL:', BACKEND_URL);

      // Get token
      let token = localStorage.getItem('token');

      // If no token, try to refresh auth state
      if (!token) {
        console.log('No token found, attempting to refresh auth state...');
        await getAuthState();
        token = localStorage.getItem('token');
      }

      if (!token) {
        console.log('No token available, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Token found:', token ? 'Yes' : 'No');

      // Fetch mood statistics and trends
      const statsUrl = `${BACKEND_URL}/api/mental-health/mood/stats?days=${timeRangeToDays[timeRange]}`;
      console.log('Fetching from:', statsUrl);

      let statsResponse;
      try {
        statsResponse = await axios.get(statsUrl, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Stats response:', statsResponse);
      } catch (statsErr) {
        console.error('Error in stats API call:', statsErr);
        if (statsErr.response?.status === 401) {
          await getAuthState();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Failed to fetch mood statistics: ${statsErr.message}`);
      }

      const statsData = statsResponse?.data;
      console.log('Stats data:', statsData);

      if (!statsData || statsData.status !== 1) {
        throw new Error(statsData?.message || 'Invalid response from mood statistics API');
      }

      // Fetch insights
      const insightsUrl = `${BACKEND_URL}/api/mental-health/insights?days=${timeRangeToDays[timeRange]}`;
      console.log('Fetching insights from:', insightsUrl);
      
      let insightsResponse;
      try {
        insightsResponse = await axios.get(insightsUrl, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Insights response:', insightsResponse);
      } catch (insightsErr) {
        console.error('Error in insights API call:', insightsErr);
        if (insightsErr.response?.status === 401) {
          await getAuthState();
        }
        // Continue with the rest of the data even if insights fail
        console.warn('Continuing without insights data');
      }

      const insightsData = insightsResponse?.data;
      console.log('Insights data:', insightsData);

      // Update state with fetched data
      const newMoodData = {
        moodStats: statsData.data?.moodStats || [],
        moodTrends: statsData.data?.moodTrends || [],
        activityCorrelations: statsData.data?.activityCorrelations || []
      };
      
      console.log('Updating state with:', { newMoodData, insights: insightsData?.data?.insights || [] });
      
      setMoodData(newMoodData);
      setInsights(insightsData?.data?.insights || []);

      // Fetch mood map data
      try {
        const moodMapUrl = `${BACKEND_URL}/api/mental-health/mood-map?days=${timeRangeToDays[timeRange]}`;
        const moodMapResponse = await axios.get(moodMapUrl, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (moodMapResponse.data.status === 1) {
          setMoodMapData(moodMapResponse.data.data || { locations: [], totalLocations: 0, totalEntries: 0 });
        }
      } catch (moodMapErr) {
        console.warn('Error fetching mood map data:', moodMapErr);
        // Continue without mood map data
      }

      // Fetch current mood
      try {
        const currentMoodUrl = `${BACKEND_URL}/api/mood-detection/current`;
        const currentMoodResponse = await axios.get(currentMoodUrl, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (currentMoodResponse.data.status === 1) {
          setCurrentMood(currentMoodResponse.data.data);
        }
      } catch (currentMoodErr) {
        console.warn('Error fetching current mood:', currentMoodErr);
        // Continue without current mood data
      }
      
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Failed to load dashboard data');
      if (err.message.includes('log in') || err.message.includes('Session expired')) {
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log('Data fetch completed');
      console.log(moodMapData);
    }
  }, [timeRange, BACKEND_URL]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Prepare chart data
  const getMoodTrendData = () => {
    if (!moodData?.moodTrends || moodData.moodTrends.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Mood Level',
          data: [],
          borderColor: 'rgba(99, 102, 241, 0.8)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true
        }]
      };
    }
    
    return {
      labels: moodData.moodTrends.map(item => formatDate(item._id)),
      datasets: [
        {
          label: 'Mood Level',
          data: moodData.moodTrends.map(item => item.avgMood),
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  const getMoodDistributionData = () => {
    if (!moodData?.moodStats || moodData.moodStats.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(156, 163, 175, 0.2)'],
          borderWidth: 0
        }]
      };
    }
    
    const moodLabels = {
      'happy': 'Happy',
      'sad': 'Sad',
      'anxious': 'Anxious',
      'angry': 'Angry',
      'neutral': 'Neutral',
      'very_happy': 'Very Happy',
      'very_sad': 'Very Sad',
      'excited': 'Excited',
      'tired': 'Tired',
      'stressed': 'Stressed'
    };
    
    // Sort by totalCount in descending order (backend returns {mood, totalCount, weeklyData})
    const sortedStats = [...moodData.moodStats].sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0));
    
    return {
      labels: sortedStats.map(item => {
        if (!item || !item.mood) return 'Unknown';
        return moodLabels[item.mood] || (typeof item.mood === 'string' ? item.mood.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown');
      }),
      datasets: [{
        data: sortedStats.map(item => item.totalCount || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderWidth: 1,
        borderColor: '#fff'
      }]
    };  
  };

  const getActivityCorrelationData = () => {
    if (!moodData?.activityCorrelations || moodData.activityCorrelations.length === 0) {
      return {
        labels: ['No activity data'],
        datasets: [{
          label: 'Mood Impact',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.2)']
        }]
      };
    }
    
    // Sort by mood change in descending order
    const sortedActivities = [...moodData.activityCorrelations]
      .sort((a, b) => (b.moodChange || 0) - (a.moodChange || 0))
      .slice(0, 5); // Limit to top 5 activities
    
    return {
      labels: sortedActivities.map(item => {
        if (!item || !item.activity) return 'Unknown';
        return typeof item.activity === 'string' 
          ? item.activity.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'Unknown';
      }),
      datasets: [
        {
          label: 'Mood Impact',
          data: sortedActivities.map(item => {
            const change = item.moodChange || 0;
            // Return a tiny value for 0 so a bar renders, but keep sign logic
            return change === 0 ? 0.05 : change;
          }),
          backgroundColor: sortedActivities.map(item => {
            const change = item.moodChange || 0;
            if (change > 0) return 'rgba(16, 185, 129, 0.6)'; // Green for positive
            if (change < 0) return 'rgba(239, 68, 68, 0.6)'; // Red for negative
            return 'rgba(156, 163, 175, 0.6)'; // Gray for neutral
          }),
          borderColor: sortedActivities.map(item => {
            const change = item.moodChange || 0;
            if (change > 0) return 'rgba(16, 185, 129, 1)';
            if (change < 0) return 'rgba(239, 68, 68, 1)';
            return 'rgba(156, 163, 175, 1)';
          }),
          borderWidth: 1
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
          padding: 20,
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: { 
          title: (context) => `Date: ${context[0].label}`,
          label: (context) => `Mood: ${context.parsed.y.toFixed(1)} / 10`,
          labelColor: (context) => ({
            borderColor: 'transparent',
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderWidth: 2,
            borderRadius: 2
          })
        } 
      }
    },
    scales: { 
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: { 
        min: 0, 
        max: 10, 
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: { 
          stepSize: 2,
          callback: (value) => `${value}/10`
        } 
      } 
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        hitRadius: 10,
        hoverBorderWidth: 2
      },
      line: {
        borderWidth: 2
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} entry${value === 1 ? '' : 's'} (${percentage}%)`;
          },
          labelColor: (context) => ({
            borderColor: 'transparent',
            backgroundColor: context.dataset.backgroundColor[context.dataIndex],
            borderWidth: 2,
            borderRadius: 2
          })
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { 
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          label: (context) => {
            // Use raw data from the original sorted array if possible, or infer from value
            // Since we modified 0 to 0.05, we need to display 0 for 0.05
            let value = context.parsed.x;
            if (Math.abs(value) === 0.05) value = 0;
            
            return `Mood change: ${value > 0 ? '+' : ''}${value.toFixed(1)}`;
          },
          labelColor: (context) => ({
            borderColor: 'transparent',
            backgroundColor: context.dataset.backgroundColor[context.dataIndex],
            borderWidth: 2,
            borderRadius: 2
          })
        }
      }
    },
    scales: { 
      x: {
        min: -2,
        max: 2,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => value > 0 ? `+${value}` : value
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Calculate stats for the summary cards
  const totalEntries = moodData.moodTrends.reduce((sum, day) => sum + (day.count || 0), 0);
  const averageMood = moodData.moodTrends.length > 0 
    ? (moodData.moodTrends.reduce((sum, day) => sum + (day.avgMood || 0), 0) / moodData.moodTrends.length).toFixed(1)
    : 'N/A';
    
  const mostCommonMood = moodData.moodStats.length > 0 
    ? (moodData.moodStats[0]?.mood || moodData.moodStats[0]?._id || 'N/A').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'N/A';
    
  const bestActivity = moodData.activityCorrelations.length > 0 
    ? moodData.activityCorrelations[0]?.activity?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'N/A';

  // If there's an error but we have data, show the dashboard with an error banner
  const showErrorBanner = error && (!moodData || !insights.length);
  
  // If there's an error and no data, show error page
  if (error && !moodData && !insights.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {error && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-start">
              <FiAlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="ml-auto text-yellow-700 hover:text-yellow-900"
                disabled={isRefreshing}
              >
                <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showErrorBanner && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-start">
            <FiAlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="ml-auto text-yellow-700 hover:text-yellow-900"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header with Time Range Selector and Refresh Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mental Health Dashboard</h1>
            <p className="mt-1 text-gray-600">Track and improve your well-being</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="inline-flex rounded-md shadow-sm">
              {['week', 'month', 'quarter'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  disabled={isRefreshing}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${range === 'week' ? 'rounded-l-lg' : ''} ${
                    range === 'quarter' ? 'rounded-r-lg' : 'border-r border-gray-200'
                  } transition-colors duration-200 disabled:opacity-50`}
                >
                  {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Last 3 Months'}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50 transition-colors duration-200"
              title="Refresh data"
            >
              <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Current Mood Card */}
          {currentMood && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">
                    {currentMood.mood === 'happy' && '😊'}
                    {currentMood.mood === 'sad' && '😢'}
                    {currentMood.mood === 'anxious' && '😰'}
                    {currentMood.mood === 'angry' && '😠'}
                    {currentMood.mood === 'neutral' && '😐'}
                    {currentMood.mood === 'surprised' && '😲'}
                    {currentMood.mood === 'fearful' && '😨'}
                    {currentMood.mood === 'excited' && '🤩'}
                    {currentMood.mood === 'tired' && '😴'}
                    {currentMood.mood === 'stressed' && '😫'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold capitalize">
                      {currentMood.mood.replace('_', ' ')}
                    </h3>
                    <p className="text-indigo-100">
                      Confidence: {currentMood.confidence}%
                    </p>
                    <p className="text-sm text-indigo-200">
                      {new Date(currentMood.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/mood-detector'}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-200"
                >
                  Detect Again
                </button>
              </div>
            </div>
          )}

          {/* {!currentMood && (
            <div className="bg-gray-100 rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 mb-4">No mood detected yet. Detect your mood to get personalized insights!</p>
              <button
                onClick={() => window.location.href = '/mood-detector'}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                😊 Detect My Mood
              </button>
            </div>
          )} */}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mr-3">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Average Mood</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {averageMood}
                    <span className="ml-1 text-base text-gray-500">/10</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalEntries}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 mr-3">
                  <FiInfo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Most Common Mood</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mostCommonMood}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
                  <FiMoon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Best Activity</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bestActivity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mood Trend Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mood Trend</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
                </span>
              </div>
              <div className="h-72">
                <Line data={getMoodTrendData()} options={lineChartOptions} />
              </div>
            </div>

            {/* Mood Distribution Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Distribution</h3>
              <div className="h-72 flex items-center justify-center">
                <div className="w-full max-w-xs">
                  <Doughnut data={getMoodDistributionData()} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Impact */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Activity Impact on Mood</h3>
              <span className="text-xs text-gray-500">Higher is better</span>
            </div>
            <div className="h-72">
              <Bar data={getActivityCorrelationData()} options={barChartOptions} />
            </div>
          </div>

          {/* Mood Map Analytics */}
          {moodMapData.locations.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mood Map Analytics</h3>
                <button
                  onClick={() => setShowMoodMap(!showMoodMap)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  {showMoodMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Locations</p>
                  <p className="text-2xl font-bold text-indigo-600">{moodMapData.totalLocations}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-purple-600">{moodMapData.totalEntries}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Time Range</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '90 days'}
                  </p>
                </div>
              </div>
              {showMoodMap && (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-gray-800 mb-3">Location-Based Mood Data</h4>
                    <div className="space-y-2">
                      {moodMapData.locations.map((location, idx) => {
                        const moodColors = {
                          'very_happy': 'bg-green-500',
                          'happy': 'bg-green-400',
                          'neutral': 'bg-gray-400',
                          'sad': 'bg-blue-400',
                          'very_sad': 'bg-blue-600',
                          'anxious': 'bg-yellow-400',
                          'angry': 'bg-red-400',
                          'tired': 'bg-purple-400'
                        };
                        return (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${moodColors[location.dominantMood] || 'bg-gray-400'}`}></div>
                                <div>
                                  <p className="font-medium text-gray-800">{location.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700 capitalize">{location.dominantMood.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-500">Avg: {location.avgIntensity}/10</p>
                                <p className="text-xs text-gray-500">{location.entryCount} entries</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights Section */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FiInfo className="text-indigo-600" />
              AI-Powered Insights
            </h3>
            
            {(!insights || insights.length === 0) ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                  <FiInfo className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Start tracking to unlock AI insights!</h4>
                    <p className="mt-2 text-sm text-blue-700">
                      Our AI analyzes your journal entries to find patterns in your mood, sleep, and activities. 
                      Add a few entries to get personalized recommendations!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 shadow-sm ${
                      insight.priority === 'high'
                        ? 'bg-red-50 border-red-500'
                        : insight.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        insight.priority === 'high'
                          ? 'bg-red-100 text-red-600'
                          : insight.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {insight.type === 'sleep_correlation' && <FiMoon className="text-xl" />}
                        {insight.type === 'activity_insight' && <FiActivity className="text-xl" />}
                        {insight.type === 'trend_alert' && <FiTrendingUp className="text-xl" />}
                        {insight.type === 'stress_insight' && <FiAlertCircle className="text-xl" />}
                        {(!['sleep_correlation', 'activity_insight', 'trend_alert', 'stress_insight'].includes(insight.type)) && <FiInfo className="text-xl" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{insight.content}</p>
                        {insight.suggestion && (
                          <div className="bg-white/60 p-2 rounded text-sm text-gray-600 italic border border-gray-100">
                            💡 {insight.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <button
              onClick={() => navigate('/mood-journal')}
              className="group flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 mb-2 group-hover:bg-indigo-200 transition-colors">
                <FiActivity className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Log Mood</span>
              <span className="text-xs text-gray-400 mt-1">How are you feeling?</span>
            </button>
            
            <button
              onClick={() => navigate('/questionnaire')}
              className="group flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="p-2 bg-green-100 rounded-full text-green-600 mb-2 group-hover:bg-green-200 transition-colors">
                <FiPlus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add Journal</span>
              <span className="text-xs text-gray-400 mt-1">Share your thoughts</span>
            </button>
            
            <button
              onClick={() => navigate('/meditation')}
              className="group flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="p-2 bg-purple-100 rounded-full text-purple-600 mb-2 group-hover:bg-purple-200 transition-colors">
                <FiMoon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Meditate</span>
              <span className="text-xs text-gray-400 mt-1">Find your peace</span>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 mb-2 group-hover:bg-yellow-200 transition-colors">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Progress</span>
              <span className="text-xs text-gray-400 mt-1">See your journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthDashboard;