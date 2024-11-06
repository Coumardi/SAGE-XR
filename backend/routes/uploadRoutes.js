// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { processFile } = require('../services/fileProcessingService');

const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');
const pptx2json = require('pptx2json');

const Extractor = new WordExtractor();
const router = express.Router();

// Set up multer for handling file uploads
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'text/plain',                                      // .txt
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword',                              // .doc
        'application/pdf',                                 // .pdf
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
      ];
  
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only .txt, .doc, .docx, .pdf, and .pptx files are allowed'));
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // Set a file size limit (2MB for testing)
});

router.post('/upload', upload.array('files', 3), async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    try {
        for (const file of files) {
            let content;

            if (file.mimetype === 'text/plain') {
                // Handle .txt files
                content = file.buffer.toString('utf-8');
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // Handle .docx files
                content = await extractTextFromDocx(file.buffer);
            } else if (file.mimetype === 'application/msword') {
                // Handle .doc files
                content = await extractTextFromDoc(file.buffer);
            } else if (file.mimetype === 'application/pdf') {
                // Handle .pdf files
                content = await extractTextFromPdf(file.buffer);
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                // Handle .pptx files
                content = await extractTextFromPptx(file.buffer);
            } else {
                return res.status(400).json({ message: 'Unsupported file type.' });
            }

            // Process the extracted content
            await processFile(content);
        }

        res.status(200).json({ message: 'Files processed and stored successfully.' });
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).json({ message: 'Error processing files' });
    }
});

module.exports = router;
