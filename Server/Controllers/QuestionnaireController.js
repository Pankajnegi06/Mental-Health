const QuestionnaireModel = require("../Models/QuestionnaireSchema.js");

const saveQuestionnaire = async (req, res) => {
  try {
    const { phq9, gad7, pss10, dass21 } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).send({
        status: 0,
        message: "User not authenticated",
      });
    }

    if (!phq9 || !gad7 || !pss10 || !dass21) {
      return res.status(400).send({
        status: 0,
        message: "Incomplete questionnaire data",
      });
    }

    const questionnaire = new QuestionnaireModel({
      userId,
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
      pss10: {
        score: pss10.score,
        answers: pss10.answers,
        severity: pss10.severity,
      },
      dass21: {
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
      },
    });

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
  getUserQuestionnaires,
  getLatestQuestionnaire,
};

