/**
 * AI Health Summary Generator
 * Generates intelligent health summaries and personalized recommendations
 */

/**
 * Generate an AI-powered health summary with suggestions
 * @param {Object} healthMetrics - Parsed health metrics
 * @param {Array} medications - Parsed medications
 * @param {string} extractedText - Full extracted text for context
 * @returns {Object} - Summary and insights
 */
const generateHealthSummary = (healthMetrics, medications, extractedText = '') => {
  const summary = {
    overview: '',
    keyFindings: [],
    healthStatus: 'normal', // normal, attention, concerning
    suggestions: [],
    mentalHealthTips: [],
    lifestyleRecommendations: []
  };

  let concernLevel = 0; // 0 = normal, 1-2 = attention, 3+ = concerning

  // Analyze Blood Pressure
  if (healthMetrics.bloodPressure) {
    const { systolic, diastolic } = healthMetrics.bloodPressure;
    summary.keyFindings.push(`Blood Pressure: ${systolic}/${diastolic} mmHg`);
    
    if (systolic >= 140 || diastolic >= 90) {
      concernLevel += 2;
      summary.suggestions.push('⚠️ Your blood pressure is elevated. Consider reducing salt intake and increasing physical activity.');
      summary.mentalHealthTips.push('High blood pressure can be linked to stress. Try meditation or deep breathing exercises for 10 minutes daily.');
    } else if (systolic >= 130 || diastolic >= 85) {
      concernLevel += 1;
      summary.suggestions.push('💡 Your blood pressure is slightly high. Monitor it regularly and maintain a healthy lifestyle.');
    } else if (systolic >= 120) {
      summary.suggestions.push('✅ Your blood pressure is in the elevated range. Keep up healthy habits to prevent it from rising.');
    } else {
      summary.suggestions.push('✅ Your blood pressure is normal. Great job maintaining your cardiovascular health!');
    }
  }

  // Analyze Blood Sugar
  if (healthMetrics.bloodSugar) {
    const { value, type } = healthMetrics.bloodSugar;
    summary.keyFindings.push(`Blood Sugar (${type}): ${value} mg/dL`);
    
    if (type === 'fasting') {
      if (value >= 126) {
        concernLevel += 2;
        summary.suggestions.push('⚠️ Fasting blood sugar is high. Please consult your doctor about diabetes management.');
        summary.lifestyleRecommendations.push('Reduce refined carbs and sugars. Focus on whole grains, vegetables, and lean proteins.');
      } else if (value >= 100) {
        concernLevel += 1;
        summary.suggestions.push('💡 Fasting blood sugar is in the prediabetic range. Consider dietary changes and regular exercise.');
      } else {
        summary.suggestions.push('✅ Fasting blood sugar is normal. Maintain a balanced diet to keep it stable.');
      }
    } else if (type === 'random') {
      if (value >= 200) {
        concernLevel += 2;
        summary.suggestions.push('⚠️ Random blood sugar is very high. Seek medical attention promptly.');
      } else if (value >= 140) {
        concernLevel += 1;
        summary.suggestions.push('💡 Random blood sugar is elevated. Monitor your diet and consider checking HbA1c.');
      }
    }
  }

  // Analyze Weight
  if (healthMetrics.weight) {
    const { value, unit } = healthMetrics.weight;
    summary.keyFindings.push(`Weight: ${value} ${unit}`);
    summary.lifestyleRecommendations.push('Maintain a healthy weight through balanced nutrition and regular physical activity.');
  }

  // Analyze Heart Rate
  if (healthMetrics.heartRate) {
    const { value } = healthMetrics.heartRate;
    summary.keyFindings.push(`Heart Rate: ${value} bpm`);
    
    if (value > 100) {
      concernLevel += 1;
      summary.suggestions.push('💡 Your resting heart rate is elevated. This could be due to stress, caffeine, or lack of fitness.');
      summary.mentalHealthTips.push('Practice stress-reduction techniques like yoga, mindfulness, or progressive muscle relaxation.');
    } else if (value < 60 && value > 40) {
      summary.suggestions.push('✅ Your heart rate suggests good cardiovascular fitness!');
    } else if (value <= 40) {
      concernLevel += 1;
      summary.suggestions.push('💡 Your heart rate is quite low. If you\'re not an athlete, consult your doctor.');
    } else {
      summary.suggestions.push('✅ Your heart rate is in the normal range.');
    }
  }

  // Analyze Cholesterol
  if (healthMetrics.cholesterol) {
    const { total, ldl, hdl } = healthMetrics.cholesterol;
    if (total) summary.keyFindings.push(`Total Cholesterol: ${total} mg/dL`);
    if (ldl) summary.keyFindings.push(`LDL (Bad): ${ldl} mg/dL`);
    if (hdl) summary.keyFindings.push(`HDL (Good): ${hdl} mg/dL`);
    
    if (total && total >= 240) {
      concernLevel += 2;
      summary.suggestions.push('⚠️ Total cholesterol is high. Reduce saturated fats and increase fiber intake.');
    } else if (total && total >= 200) {
      concernLevel += 1;
      summary.suggestions.push('💡 Total cholesterol is borderline high. Consider heart-healthy dietary changes.');
    }
    
    if (ldl && ldl >= 160) {
      concernLevel += 1;
      summary.suggestions.push('⚠️ LDL cholesterol is high. Focus on reducing saturated and trans fats.');
    }
    
    if (hdl && hdl < 40) {
      concernLevel += 1;
      summary.suggestions.push('💡 HDL cholesterol is low. Increase physical activity and healthy fats (like omega-3s).');
    }
  }

  // Analyze Medications
  if (medications && medications.length > 0) {
    summary.keyFindings.push(`Medications: ${medications.length} prescribed`);
    medications.forEach(med => {
      summary.keyFindings.push(`  • ${med.name} ${med.dosage} - ${med.frequency}`);
    });
    
    summary.suggestions.push('💊 Take medications as prescribed. Set reminders to ensure consistency.');
    summary.mentalHealthTips.push('Medication adherence is crucial for both physical and mental well-being. Create a routine that works for you.');
  }

  // Mental Health & Lifestyle Tips (Always include)
  summary.mentalHealthTips.push(
    '🧘 Practice mindfulness: Even 5 minutes of meditation daily can reduce stress and improve focus.',
    '😴 Prioritize sleep: Aim for 7-9 hours of quality sleep each night for optimal mental and physical health.',
    '🤝 Stay connected: Social connections are vital for mental health. Reach out to friends or family regularly.',
    '📝 Journal your thoughts: Writing can help process emotions and reduce anxiety.'
  );

  summary.lifestyleRecommendations.push(
    '🏃 Exercise regularly: Aim for 150 minutes of moderate activity per week.',
    '🥗 Eat a balanced diet: Focus on whole foods, fruits, vegetables, and lean proteins.',
    '💧 Stay hydrated: Drink 8-10 glasses of water daily.',
    '🚭 Avoid smoking and limit alcohol consumption.',
    '☀️ Get sunlight: 15-20 minutes of sun exposure daily can boost vitamin D and mood.'
  );

  // Determine health status
  if (concernLevel >= 3) {
    summary.healthStatus = 'concerning';
    summary.overview = '⚠️ Some health metrics require attention. Please consult with your healthcare provider to discuss these findings and create an action plan.';
  } else if (concernLevel >= 1) {
    summary.healthStatus = 'attention';
    summary.overview = '💡 Your health metrics show some areas for improvement. Small lifestyle changes can make a big difference. Consider the suggestions below.';
  } else {
    summary.healthStatus = 'normal';
    summary.overview = '✅ Your health metrics look good! Keep up the healthy habits and continue monitoring your health regularly.';
  }

  // Add context-based insights if text contains certain keywords
  const textLower = extractedText.toLowerCase();
  if (textLower.includes('stress') || textLower.includes('anxiety')) {
    summary.mentalHealthTips.unshift('🧠 Your record mentions stress/anxiety. Consider speaking with a mental health professional for personalized support.');
  }
  if (textLower.includes('sleep') || textLower.includes('insomnia')) {
    summary.mentalHealthTips.unshift('😴 Sleep issues detected. Establish a consistent sleep schedule and create a relaxing bedtime routine.');
  }

  return summary;
};

module.exports = {
  generateHealthSummary
};
