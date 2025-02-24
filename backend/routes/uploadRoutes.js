// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { processFile, splitIntoChunks } = require('../services/fileProcessingService');
const {
    extractTextFromDocx,
    extractTextFromDoc,
    extractTextFromPdf,
    extractTextFromPptx,
} = require('../services/extractText');
const { v4: uuidv4 } = require('uuid');

const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');

const Extractor = new WordExtractor();
const router = express.Router();

const vectorStore = require('../services/vectorStoreService');

// Set up multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt, .docx, .pdf, and .pptx files are allowed'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 3,  // Maximum number of files
        fields: 10 // Maximum number of non-file fields
    }
});

// Add the route handler
router.post('/', upload.array('files', 3), async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    try {
        for (const file of files) {
            let content;
            const documentId = uuidv4();

            try {
                if (file.mimetype === 'text/plain') {
                    content = file.buffer.toString('utf-8');
                } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    content = await extractTextFromDocx(file.buffer);
                } else if (file.mimetype === 'application/pdf') {
                    content = await extractTextFromPdf(file.buffer);
                } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                    content = await extractTextFromPptx(file.buffer);
                }

                if (!content) {
                    throw new Error(`Failed to extract content from ${file.originalname}`);
                }

                const chunks = await splitIntoChunks(content);
                console.log(`Processing ${chunks.length} chunks from ${file.originalname}`);

                for (let i = 0; i < chunks.length; i++) {
                    const metadata = {
                        documentId,
                        fileName: file.originalname,
                        mimeType: file.mimetype,
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        uploadDate: new Date().toISOString()
                    };

                    await processFile(Buffer.from(chunks[i]), metadata);
                }

            } catch (extractError) {
                console.error(`Error processing ${file.originalname}:`, extractError);
                throw extractError;
            }
        }

        res.status(200).json({ success: true, message: 'Files processed and stored successfully.' });
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).json({ 
            message: 'Error processing files',
            error: error.message 
        });
    }
});

module.exports = router;
