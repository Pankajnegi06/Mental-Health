const Groq = require("groq-sdk");



let groq = null;

const generateInsights = async (journalEntries, userMoodStats) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing");
      return [{
        type: 'welcome',
        title: 'Start Your Journey',
        content: 'Begin tracking your mood daily to unlock personalized AI insights.',
        suggestion: 'Add your first journal entry to get started!',
        priority: 'high',
        date: new Date()
      }];
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    if (!journalEntries || journalEntries.length === 0) {
      return [{
        type: 'welcome',
        title: 'Start Your Journey',
        content: 'Begin tracking your mood daily to unlock personalized AI insights.',
        suggestion: 'Add your first journal entry to get started!',
        priority: 'high',
        date: new Date()
      }];
    }

    // Prepare data for AI analysis
    const analysisData = {
      recentEntries: journalEntries.slice(0, 10).map(e => ({
        date: e.date,
        mood: e.moodEntries?.[0]?.mood,
        intensity: e.moodEntries?.[0]?.intensity,
        notes: e.moodEntries?.[0]?.notes,
        sleep: e.sleep,
        activities: e.activities,
        stress: e.stressLevel
      })),
      stats: userMoodStats
    };

    const prompt = `
      Analyze the following mental health journal data and generate 3-5 personalized, actionable insights.
      
      Data: ${JSON.stringify(analysisData)}
      
      Return ONLY a JSON array of objects with this structure:
      [
        {
          "type": "trend_alert" | "sleep_correlation" | "activity_insight" | "stress_insight" | "general_advice",
          "title": "Short, catchy title",
          "content": "Detailed analysis (2-3 sentences)",
          "suggestion": "One specific, actionable recommendation",
          "priority": "high" | "medium" | "low"
        }
      ]
      
      Focus on:
      1. Correlations between sleep/activities and mood
      2. Emerging trends (improving/declining mood)
      3. Specific advice based on the user's actual data
      4. Be empathetic and supportive but professional
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an empathetic mental health AI assistant. Analyze data objectively and provide supportive, actionable insights. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    // Parse JSON response
    const insights = JSON.parse(content);
    
    // Ensure it's an array (handle if AI returns object with key)
    return Array.isArray(insights) ? insights : (insights.insights || []);

  } catch (error) {
    console.error("Error generating Groq insights:", error);
    // Fallback to basic insights or empty array
    return [];
  }
};

module.exports = { generateInsights };
