const AIQuiz = require('../models/AIQuiz');

// @route   GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await AIQuiz.find({ user: req.user._id })  // ✅ Changed Quiz → AIQuiz
      .select('-questions')
      .sort({ createdAt: -1 });

    res.status(200).json(quizzes);

  } catch (error) {
    console.error('getQuizzes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/quizzes/:id
const getQuiz = async (req, res) => {
  try {
    const quiz = await AIQuiz.findOne({  // ✅ Changed Quiz → AIQuiz
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(quiz);

  } catch (error) {
    console.error('getQuiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await AIQuiz.findOne({  // ✅ Changed Quiz → AIQuiz
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.deleteOne();

    res.status(200).json({ message: 'Quiz deleted successfully' });

  } catch (error) {
    console.error('deleteQuiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const quiz = await AIQuiz.findOne({  // ✅ Changed Quiz → AIQuiz
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) score++;

      return {
        question: question.question,
        selectedAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    // Save result to quiz
    quiz.results.push({
      score,
      totalQuestions: quiz.questions.length,
      takenAt: new Date()
    });
    await quiz.save();

    res.status(200).json({
      message: 'Quiz submitted successfully!',
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      results
    });

  } catch (error) {
    console.error('submitQuiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/quizzes/:id/results
const getQuizResults = async (req, res) => {
  try {
    const quiz = await AIQuiz.findOne({  // ✅ Changed Quiz → AIQuiz
      _id: req.params.id,
      user: req.user._id
    }).select('title results');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const results = quiz.results;
    const totalAttempts = results.length;

    if (totalAttempts === 0) {
      return res.status(200).json({
        title: quiz.title,
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        results: []
      });
    }

    const bestScore = Math.max(...results.map(r => 
      Math.round((r.score / r.totalQuestions) * 100)
    ));

    const averageScore = Math.round(
      results.reduce((sum, r) => 
        sum + Math.round((r.score / r.totalQuestions) * 100), 0
      ) / totalAttempts
    );

    res.status(200).json({
      title: quiz.title,
      totalAttempts,
      bestScore,
      averageScore,
      results
    });

  } catch (error) {
    console.error('getQuizResults error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
};