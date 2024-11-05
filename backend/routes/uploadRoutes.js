// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processFile } = require('../services/fileProcessingService');

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  },
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
});

router.post('/upload', upload.array('files', 3), async (req, res) => {
    const files = req.files;
  
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }
  
    try {
      // Process each file
      for (const file of files) {
        const content = file.buffer.toString('utf-8');
        await processFile(content);
      }
  
      res.status(200).json({ message: 'Files processed and stored successfully.' });
    } catch (error) {
      console.error('Error processing files:', error);
      res.status(500).json({ message: 'Error processing files' });
    }
  });

module.exports = router;
