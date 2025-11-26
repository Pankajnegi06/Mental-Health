const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const myAPIKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(myAPIKey);

/**
 * Generate AI-powered mental health report with personalized recommendations
 * @param {Object} assessmentData - Contains scores and severity levels
 * @returns {Object} Structured report with recommendations
 */
const generateMentalHealthReport = async (assessmentData) => {
  try {
    if (!myAPIKey) {
      console.error("GEMINI_API_KEY is not set");
      return getFallbackReport(assessmentData);
    }

    const {
      phq9Score,
      phq9Severity,
      gad7Score,
      gad7Severity,
      pss10Score,
      pss10Severity,
      dassDepression,
      dassDepressionSeverity,
      dassAnxiety,
      dassAnxietySeverity,
      dassStress,
      dassStressSeverity,
      assessmentMode,
    } = assessmentData;

    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a compassionate mental health assistant providing personalized insights and recommendations based on standardized mental health assessment scores.

CRITICAL RULES:
1. Be empathetic, supportive, and non-judgmental
2. Provide specific, actionable recommendations
3. Never diagnose or replace professional medical advice
4. Encourage professional help for moderate to severe cases
5. Focus on evidence-based coping strategies
6. Keep language simple and accessible
7. Return response in valid JSON format only

Your response must be a valid JSON object with this exact structure:
{
  "overallSummary": "Brief 2-3 sentence overview of their mental health status",
  "depression": {
    "analysis": "2-3 sentences about their depression level and what it means",
    "recommendations": ["rec1", "rec2", "rec3"],
    "copingStrategies": ["strategy1", "strategy2", "strategy3"]
  },
  "anxiety": {
    "analysis": "2-3 sentences about their anxiety level and what it means",
    "recommendations": ["rec1", "rec2", "rec3"],
    "copingStrategies": ["strategy1", "strategy2", "strategy3"]
  },
  "stress": {
    "analysis": "2-3 sentences about their stress level and what it means",
    "recommendations": ["rec1", "rec2", "rec3"],
    "copingStrategies": ["strategy1", "strategy2", "strategy3"]
  },
  "nextSteps": ["step1", "step2", "step3"],
  "professionalHelpRecommended": true/false
}`,
    });

    // Build the prompt based on assessment mode
    let prompt = `Generate a personalized mental health report for someone with the following assessment results:\n\n`;

    // Always include PHQ-9 and GAD-7
    prompt += `PHQ-9 (Depression): Score ${phq9Score}/27 - ${phq9Severity}\n`;
    prompt += `GAD-7 (Anxiety): Score ${gad7Score}/21 - ${gad7Severity}\n`;

    // Include PSS-10 and DASS-21 for detailed mode
    if (assessmentMode === "detailed") {
      if (pss10Score !== undefined) {
        prompt += `PSS-10 (Stress): Score ${pss10Score}/40 - ${pss10Severity}\n`;
      }
      if (dassDepression !== undefined) {
        prompt += `\nDASS-21 Scores:\n`;
        prompt += `- Depression: ${dassDepression}/42 - ${dassDepressionSeverity}\n`;
        prompt += `- Anxiety: ${dassAnxiety}/42 - ${dassAnxietySeverity}\n`;
        prompt += `- Stress: ${dassStress}/42 - ${dassStressSeverity}\n`;
      }
    }

    prompt += `\nProvide a comprehensive, personalized report with specific recommendations and coping strategies for each area. Be encouraging and supportive while being honest about the severity.`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (
      !response ||
      !response.candidates ||
      !response.candidates[0] ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      !response.candidates[0].content.parts[0]
    ) {
      console.error("Invalid response structure from AI");
      return getFallbackReport(assessmentData);
    }

    const rawText = response.candidates[0].content.parts[0].text;
    console.log("Raw AI Response:", rawText);

    // Parse JSON response
    let aiReport;
    try {
      // Remove markdown code blocks if present
      const cleanedText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiReport = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return getFallbackReport(assessmentData);
    }

    // Add generation timestamp
    aiReport.generatedAt = new Date();

    // Validate and ensure all required fields exist
    if (!aiReport.overallSummary || !aiReport.depression || !aiReport.anxiety) {
      console.error("AI response missing required fields");
      return getFallbackReport(assessmentData);
    }

    return aiReport;
  } catch (error) {
    console.error("Error generating mental health report:", error.message);
    return getFallbackReport(assessmentData);
  }
};

/**
 * Fallback report when AI is unavailable
 */
const getFallbackReport = (assessmentData) => {
  const {
    phq9Score,
    phq9Severity,
    gad7Score,
    gad7Severity,
    pss10Score,
    pss10Severity,
    assessmentMode,
  } = assessmentData;

  // Determine if professional help is recommended
  const professionalHelpRecommended =
    phq9Severity === "Moderately Severe" ||
    phq9Severity === "Severe" ||
    gad7Severity === "Severe" ||
    (pss10Severity === "High" && assessmentMode === "detailed");

  return {
    overallSummary: `Your assessment shows ${phq9Severity.toLowerCase()} depression and ${gad7Severity.toLowerCase()} anxiety levels. ${
      professionalHelpRecommended
        ? "We strongly recommend consulting with a mental health professional."
        : "There are several evidence-based strategies that can help improve your well-being."
    }`,
    depression: {
      analysis: `Your PHQ-9 score of ${phq9Score}/27 indicates ${phq9Severity.toLowerCase()} depression. ${
        phq9Score <= 4
          ? "This suggests minimal depressive symptoms."
          : phq9Score <= 9
          ? "You may be experiencing mild depressive symptoms that could benefit from self-care strategies."
          : phq9Score <= 14
          ? "You're experiencing moderate depressive symptoms. Consider reaching out for professional support."
          : "You're experiencing significant depressive symptoms. Professional help is strongly recommended."
      }`,
      recommendations: [
        "Maintain a regular sleep schedule (7-9 hours per night)",
        "Engage in physical activity for at least 30 minutes daily",
        "Connect with supportive friends or family members",
        phq9Score > 9 ? "Consider speaking with a mental health professional" : "Practice gratitude journaling",
      ],
      copingStrategies: [
        "Practice mindfulness meditation for 10-15 minutes daily",
        "Set small, achievable daily goals",
        "Limit social media and news consumption",
        "Spend time in nature or sunlight when possible",
      ],
    },
    anxiety: {
      analysis: `Your GAD-7 score of ${gad7Score}/21 indicates ${gad7Severity.toLowerCase()} anxiety. ${
        gad7Score <= 4
          ? "This suggests minimal anxiety symptoms."
          : gad7Score <= 9
          ? "You may be experiencing mild anxiety that can often be managed with self-help strategies."
          : gad7Score <= 14
          ? "You're experiencing moderate anxiety. Professional guidance could be beneficial."
          : "You're experiencing severe anxiety. Please consider seeking professional help."
      }`,
      recommendations: [
        "Practice deep breathing exercises (4-7-8 technique)",
        "Limit caffeine and alcohol intake",
        "Establish a calming bedtime routine",
        gad7Score > 9 ? "Consult with a therapist about anxiety management" : "Try progressive muscle relaxation",
      ],
      copingStrategies: [
        "Use grounding techniques (5-4-3-2-1 method) when feeling anxious",
        "Challenge anxious thoughts with evidence-based thinking",
        "Create a worry journal to externalize concerns",
        "Practice yoga or gentle stretching exercises",
      ],
    },
    stress: {
      analysis:
        assessmentMode === "detailed" && pss10Score !== undefined
          ? `Your PSS-10 score of ${pss10Score}/40 indicates ${pss10Severity.toLowerCase()} stress levels. ${
              pss10Score <= 13
                ? "You're managing stress relatively well."
                : pss10Score <= 26
                ? "You're experiencing moderate stress that may benefit from stress management techniques."
                : "You're experiencing high stress levels. It's important to address this proactively."
            }`
          : "Stress management is an important part of overall mental health. Regular practice of stress-reduction techniques can significantly improve your well-being.",
      recommendations: [
        "Practice time management and prioritization",
        "Set healthy boundaries in work and relationships",
        "Take regular breaks throughout the day",
        "Engage in activities you enjoy and find relaxing",
      ],
      copingStrategies: [
        "Try the Pomodoro Technique for focused work sessions",
        "Practice saying 'no' to non-essential commitments",
        "Use guided meditation apps (Headspace, Calm, Insight Timer)",
        "Maintain a consistent exercise routine",
      ],
    },
    nextSteps: [
      professionalHelpRecommended
        ? "Schedule an appointment with a mental health professional (therapist, counselor, or psychiatrist)"
        : "Start implementing 2-3 coping strategies from the recommendations above",
      "Track your mood and symptoms daily to identify patterns",
      "Share your results with a trusted friend or family member",
      "Retake this assessment in 2-4 weeks to monitor your progress",
      professionalHelpRecommended
        ? "If you're in crisis, contact a crisis helpline immediately (988 in the US)"
        : "Consider joining a support group or online community",
    ],
    professionalHelpRecommended,
    generatedAt: new Date(),
  };
};

module.exports = {
  generateMentalHealthReport,
  getFallbackReport,
};
