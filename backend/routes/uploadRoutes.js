// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { splitIntoChunks } = require('../services/fileProcessingService');
const {
    extractTextFromDocx,
    extractTextFromPdf,
    extractTextFromPptx,
} = require('../services/extractText');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const vectorStore = require('../services/vectorStoreService');

// ─── MIME TYPE CONFIG ─────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

// ─── MULTER ───────────────────────────────────────────────────────────────────

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt, .docx, .pdf, and .pptx files are allowed'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 3,
        fields: 10,
    },
});

// ─── TEXT EXTRACTION ──────────────────────────────────────────────────────────

async function extractText(file) {
    switch (file.mimetype) {
        case 'text/plain':
            return file.buffer.toString('utf-8');

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return extractTextFromDocx(file.buffer);

        case 'application/pdf':
            return extractTextFromPdf(file.buffer);

        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return extractTextFromPptx(file.buffer);

        default:
            throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
}

// ─── UPLOAD ROUTE ─────────────────────────────────────────────────────────────

router.post('/', upload.array('files', 3), async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    const results = [];

    for (const file of files) {
        const documentId = uuidv4();

        try {
            // 1. Extract raw text from the file buffer
            const content = await extractText(file);

            if (!content || content.trim().length < 50) {
                console.warn(`Skipping ${file.originalname} — no usable text extracted`);
                results.push({ file: file.originalname, success: false, reason: 'no_text' });
                continue;
            }

            // 2. Chunk the extracted text once
            const chunks = await splitIntoChunks(content);
            console.log(`Processing ${chunks.length} chunks from ${file.originalname}`);

            if (chunks.length === 0) {
                console.warn(`No chunks generated for ${file.originalname}`);
                results.push({ file: file.originalname, success: false, reason: 'no_chunks' });
                continue;
            }

            // 3. Store each chunk directly — no re-processing
            for (let i = 0; i < chunks.length; i++) {
                const metadata = {
                    documentId,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    chunkIndex: i,
                    totalChunks: chunks.length,
                    uploadDate: new Date().toISOString(),
                };

                await vectorStore.storeMemory(chunks[i], metadata);
            }

            results.push({ file: file.originalname, success: true, chunks: chunks.length });

        } catch (error) {
            console.error(`Error processing ${file.originalname}:`, error);
            // Don't throw — continue processing remaining files
            results.push({ file: file.originalname, success: false, reason: error.message });
        }
    }

    // Return partial success if some files failed
    const anySuccess = results.some(r => r.success);
    const allSuccess = results.every(r => r.success);

    res.status(anySuccess ? 200 : 500).json({
        success: allSuccess,
        partial: anySuccess && !allSuccess,
        results,
    });
});

module.exports = router;