const QuestionnaireModel = require("../Models/QuestionnaireSchema.js");
const { generateMentalHealthReport } = require("../Services/reportGenerator.service.js");

const saveQuestionnaire = async (req, res) => {
  try {
    const { phq9, gad7, pss10, dass21, assessmentMode } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).send({
        status: 0,
        message: "User not authenticated",
      });
    }

    if (!phq9 || !gad7) {
      return res.status(400).send({
        status: 0,
        message: "Incomplete questionnaire data (PHQ-9 and GAD-7 required)",
      });
    }

    // For detailed mode, require pss10 and dass21
    if (assessmentMode === 'detailed' && (!pss10 || !dass21)) {
      return res.status(400).send({
        status: 0,
        message: "Incomplete questionnaire data for detailed assessment",
      });
    }

    const questionnaireData = {
      userId,
      assessmentMode: assessmentMode || 'detailed',
      phq9: {
        score: phq9.score,
        answers: phq9.answers,
        severity: phq9.severity,
      },
      gad7: {
        score: gad7.score,
        answers: gad7.answers,
        severity: gad7.severity,
      },
    };

    // Add pss10 and dass21 only if provided (detailed mode)
    if (pss10) {
      questionnaireData.pss10 = {
        score: pss10.score,
        answers: pss10.answers,
        severity: pss10.severity,
      };
    }

    if (dass21) {
      questionnaireData.dass21 = {
        depression: {
          score: dass21.depression.score,
          severity: dass21.depression.severity,
        },
        anxiety: {
          score: dass21.anxiety.score,
          severity: dass21.anxiety.severity,
        },
        stress: {
          score: dass21.stress.score,
          severity: dass21.stress.severity,
        },
        answers: dass21.answers,
      };
    }

    const questionnaire = new QuestionnaireModel(questionnaireData);

    await questionnaire.save();

    return res.send({
      status: 1,
      message: "Questionnaire saved successfully",
      data: questionnaire,
    });
  } catch (e) {
    return res.status(500).send({
      status: 0,
      message: "Error saving questionnaire",
      error: e.message,
    });
  }
};

const generateAIReport = async (req, res) => {
  try {
    const { questionnaireId } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).send({
        status: 0,
        message: "User not authenticated",
      });
    }

    if (!questionnaireId) {
      return res.status(400).send({
        status: 0,
        message: "Questionnaire ID is required",
      });
    }

    // Find the questionnaire
    const questionnaire = await QuestionnaireModel.findOne({
      _id: questionnaireId,
      userId: userId,
    });

    if (!questionnaire) {
      return res.status(404).send({
        status: 0,
        message: "Questionnaire not found",
      });
    }

    // Prepare assessment data for AI
    const assessmentData = {
      phq9Score: questionnaire.phq9.score,
      phq9Severity: questionnaire.phq9.severity,
      gad7Score: questionnaire.gad7.score,
      gad7Severity: questionnaire.gad7.severity,
      assessmentMode: questionnaire.assessmentMode || 'detailed',
    };

    // Add detailed mode data if available
    if (questionnaire.pss10) {
      assessmentData.pss10Score = questionnaire.pss10.score;
      assessmentData.pss10Severity = questionnaire.pss10.severity;
    }

    if (questionnaire.dass21) {
      assessmentData.dassDepression = questionnaire.dass21.depression.score;
      assessmentData.dassDepressionSeverity = questionnaire.dass21.depression.severity;
      assessmentData.dassAnxiety = questionnaire.dass21.anxiety.score;
      assessmentData.dassAnxietySeverity = questionnaire.dass21.anxiety.severity;
      assessmentData.dassStress = questionnaire.dass21.stress.score;
      assessmentData.dassStressSeverity = questionnaire.dass21.stress.severity;
    }

    // Generate AI report
    const aiReport = await generateMentalHealthReport(assessmentData);

    // Update questionnaire with AI report
    questionnaire.aiReport = aiReport;
    await questionnaire.save();

    return res.send({
      status: 1,
      message: "AI report generated successfully",
      data: {
        questionnaireId: questionnaire._id,
        aiReport: aiReport,
      },
    });
  } catch (e) {
    console.error("Error generating AI report:", e);
    return res.status(500).send({
      status: 0,
      message: "Error generating AI report",
      error: e.message,
    });
  }
};

const getUserQuestionnaires = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).send({
        status: 0,
        message: "User not authenticated",
      });
    }

    const questionnaires = await QuestionnaireModel.find({ userId })
      .sort({ completedAt: -1 })
      .limit(50);

    return res.send({
      status: 1,
      message: "Questionnaires retrieved successfully",
      data: questionnaires,
    });
  } catch (e) {
    return res.status(500).send({
      status: 0,
      message: "Error retrieving questionnaires",
      error: e.message,
    });
  }
};

const getLatestQuestionnaire = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).send({
        status: 0,
        message: "User not authenticated",
      });
    }

    const questionnaire = await QuestionnaireModel.findOne({ userId })
      .sort({ completedAt: -1 });

    if (!questionnaire) {
      return res.send({
        status: 0,
        message: "No questionnaire found",
        data: null,
      });
    }

    return res.send({
      status: 1,
      message: "Latest questionnaire retrieved successfully",
      data: questionnaire,
    });
  } catch (e) {
    return res.status(500).send({
      status: 0,
      message: "Error retrieving latest questionnaire",
      error: e.message,
    });
  }
};

module.exports = {
  saveQuestionnaire,
  generateAIReport,
  getUserQuestionnaires,
  getLatestQuestionnaire,
};


