const MoodDetection = require('../Models/MoodDetectionSchema');
const axios = require('axios');

// Analyze mood from image using Gemini AI
const analyzeMood = async (req, res) => {
  try {
    const { imageData } = req.body;
    const userId = req.body.userId; // From auth middleware

    if (!imageData) {
      return res.status(400).json({
        status: 0,
        message: 'Image data is required'
      });
    }

    console.log('Analyzing mood for user:', userId);

    // Extract base64 data from data URL
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

    // Prepare Gemini API request
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `Analyze this person's facial expression and determine their emotional state. Provide a JSON response with this exact structure:
{
  "primaryEmotion": "one of: happy, sad, anxious, angry, neutral, surprised, fearful, excited, tired, stressed",
  "confidence": 85,
  "secondaryEmotions": [{"emotion": "slightly anxious", "confidence": 30}],
  "facialIndicators": "Brief description of facial features indicating this mood",
  "recommendations": {
    "activities": ["meditation", "deep breathing", "light exercise"],
    "tips": ["Take a 5-minute break", "Practice mindfulness"],
    "summary": "Based on your current mood, consider taking a moment to relax and practice self-care."
  }
}
Respond ONLY with valid JSON, no additional text.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = geminiResponse.data.candidates[0]?.content?.parts[0]?.text;
    console.log('AI Response:', aiResponse);

    if (!aiResponse) {
      return res.status(500).json({
        status: 0,
        message: 'No response from AI'
      });
    }

    // Parse AI response
    let moodData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moodData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        status: 0,
        message: 'Failed to parse mood analysis',
        error: parseError.message,
        aiResponse: aiResponse
      });
    }

    // Save mood detection to database
    const moodDetection = new MoodDetection({
      userId,
      detectedMood: moodData.primaryEmotion.toLowerCase().replace(' ', '_'),
      confidence: moodData.confidence || 0,
      secondaryEmotions: moodData.secondaryEmotions || [],
      facialIndicators: moodData.facialIndicators || '',
      aiRecommendations: moodData.recommendations || {},
      timestamp: new Date()
    });

    await moodDetection.save();

    console.log('Mood detection saved successfully');

    return res.status(200).json({
      status: 1,
      message: 'Mood analyzed successfully',
      data: {
        mood: moodDetection.detectedMood,
        confidence: moodDetection.confidence,
        secondaryEmotions: moodDetection.secondaryEmotions,
        facialIndicators: moodDetection.facialIndicators,
        recommendations: moodDetection.aiRecommendations,
        timestamp: moodDetection.timestamp
      }
    });

  } catch (error) {
    console.error('Error in analyzeMood:', error);
    return res.status(500).json({
      status: 0,
      message: 'Failed to analyze mood',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

// Get mood history for a user
const getMoodHistory = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { days = 7 } = req.query;

    console.log(`Fetching mood history for user ${userId}, last ${days} days`);

    const moodHistory = await MoodDetection.getMoodHistory(userId, parseInt(days));

    return res.status(200).json({
      status: 1,
      message: 'Mood history retrieved successfully',
      data: {
        history: moodHistory,
        count: moodHistory.length
      }
    });

  } catch (error) {
    console.error('Error in getMoodHistory:', error);
    return res.status(500).json({
      status: 0,
      message: 'Failed to retrieve mood history',
      error: error.message
    });
  }
};

// Get current (latest) mood for a user
const getCurrentMood = async (req, res) => {
  try {
    const userId = req.body.userId;

    console.log(`Fetching current mood for user ${userId}`);

    const currentMood = await MoodDetection.getLatestMood(userId);

    if (!currentMood) {
      return res.status(404).json({
        status: 0,
        message: 'No mood data found for this user'
      });
    }

    return res.status(200).json({
      status: 1,
      message: 'Current mood retrieved successfully',
      data: {
        mood: currentMood.detectedMood,
        confidence: currentMood.confidence,
        secondaryEmotions: currentMood.secondaryEmotions,
        facialIndicators: currentMood.facialIndicators,
        recommendations: currentMood.aiRecommendations,
        timestamp: currentMood.timestamp
      }
    });

  } catch (error) {
    console.error('Error in getCurrentMood:', error);
    return res.status(500).json({
      status: 0,
      message: 'Failed to retrieve current mood',
      error: error.message
    });
  }
};

module.exports = {
  analyzeMood,
  getMoodHistory,
  getCurrentMood
};
