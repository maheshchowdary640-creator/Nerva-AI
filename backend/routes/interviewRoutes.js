const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/interviewController');

// Multer memory storage configuration for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported!'), false);
    }
  }
});

// User onboarding route
router.post('/users', controller.getOrCreateUser);

// Resume upload route (extracts text)
router.post('/upload-resume', upload.single('resume'), controller.uploadResume);

// Generate questions from resume & JD
router.post('/generate-questions', controller.generateQuestions);

// Evaluate candidate's answers
router.post('/evaluate-answers', controller.evaluateAnswers);

// Generate downloadable PDF report
router.post('/generate-report', controller.generateReport);

// Get all historic interviews for a user
router.get('/interviews', controller.getUserInterviews);

// Get detailed analysis of a single interview
router.get('/interviews/:id', controller.getInterviewById);

module.exports = router;
