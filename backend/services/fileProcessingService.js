// services/fileProcessingService.js

const vectorStore = require('./vectorStoreService');
const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CHARS_PER_TOKEN = 4;
const MAX_TOKENS_PER_CHUNK = 400;
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_CHUNK * CHARS_PER_TOKEN;
const MIN_CHUNK_CHARS = 50;

// ─── TEXT EXTRACTION ─────────────────────────────────────────────────────────

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const extractors = {
    // Documents
    '.pdf':  extractPDF,
    '.docx': extractDOCX,
    '.doc':  extractDOCX,
    '.pptx': extractPPTX,
    '.rtf':  extractPlainText,

    // Spreadsheets
    '.xlsx': extractSpreadsheet,
    '.xls':  extractSpreadsheet,
    '.xlsm': extractSpreadsheet,
    '.csv':  extractCSV,
    '.tsv':  extractCSV,

    // Data
    '.json':  extractJSON,
    '.jsonl': extractJSONL,

    // Images (OCR)
    '.jpg':  extractImageOCR,
    '.jpeg': extractImageOCR,
    '.png':  extractImageOCR,
    '.webp': extractImageOCR,
    '.tiff': extractImageOCR,

    // Plain text / code
    '.txt':  extractPlainText,
    '.md':   extractPlainText,
    '.log':  extractPlainText,
    '.html': extractPlainText,
    '.js':   extractPlainText,
    '.ts':   extractPlainText,
    '.py':   extractPlainText,
  };

  const extractor = extractors[ext];

  if (!extractor) {
    console.warn(`No extractor for "${ext}" — falling back to plain text`);
    return extractPlainText(filePath);
  }

  try {
    const text = await extractor(filePath);
    return sanitizeText(text);
  } catch (err) {
    throw new Error(`Extraction failed for ${path.basename(filePath)}: ${err.message}`);
  }
}

async function extractPDF(filePath) {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  // Scanned PDF fallback — attempt OCR if text is too sparse
  if (!data.text || data.text.trim().length < 50) {
    console.warn('PDF has little/no text — attempting OCR fallback');
    return extractImageOCR(filePath);
  }

  return data.text;
}

async function extractDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractPPTX(filePath) {
  const officeParser = require('officeparser');
  return new Promise((resolve, reject) => {
    officeParser.parseOffice(filePath, (data, err) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

async function extractSpreadsheet(filePath) {
  const xlsx = require('xlsx');
  const workbook = xlsx.readFile(filePath);
  const lines = [];

  for (const sheetName of workbook.SheetNames) {
    lines.push(`\n## Sheet: ${sheetName}\n`);
    const sheet = workbook.Sheets[sheetName];
    lines.push(xlsx.utils.sheet_to_csv(sheet));
  }

  return lines.join('\n');
}

async function extractCSV(filePath) {
  const Papa = require('papaparse');
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse(content, {
    delimiter: ext === '.tsv' ? '\t' : ',',
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .map(row => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' | '))
    .join('\n');
}

async function extractJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.stringify(JSON.parse(content), null, 2);
}

async function extractJSONL(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.stringify(JSON.parse(line)); } catch { return line; } })
    .join('\n');
}

async function extractImageOCR(filePath) {
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: m => process.stdout.write(`\rOCR: ${m.status} ${Math.round((m.progress || 0) * 100)}%`)
  });
  console.log(); // newline after OCR progress
  return text;
}

async function extractPlainText(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function sanitizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n\t]/g, ' ')
    .trim();
}

// ─── CHUNKING ─────────────────────────────────────────────────────────────────

async function splitIntoChunks(text) {
  const chunks = [];
  let currentChunk = '';

  // Recursive separators: paragraphs → sentences → words
  const separators = ['\n\n', '\n', /(?<=[.!?])\s+/, ' '];

  function splitBySeparator(str, separatorIndex) {
    if (separatorIndex >= separators.length) return [str];
    const sep = separators[separatorIndex];
    const parts = typeof sep === 'string'
      ? str.split(sep)
      : str.split(sep);
    return parts.flatMap(p =>
      p.trim().length > MAX_CHARS_PER_CHUNK
        ? splitBySeparator(p.trim(), separatorIndex + 1)
        : p.trim()
    ).filter(Boolean);
  }

  const sentences = splitBySeparator(text, 0);
  console.log(`Split text into ${sentences.length} segments`);

  const overlapSize = Math.floor(MAX_CHARS_PER_CHUNK * 0.15); // 15% overlap

  for (const sentence of sentences) {
    const tempChunk = currentChunk
      ? `${currentChunk} ${sentence}`
      : sentence;

    if (tempChunk.length > MAX_CHARS_PER_CHUNK) {
      if (currentChunk) {
        if (currentChunk.length >= MIN_CHUNK_CHARS) {
          console.log(`Pushing chunk of length: ${currentChunk.length}`);
          chunks.push(currentChunk.trim());
        }

        // Carry overlap into next chunk
        const words = currentChunk.split(' ');
        const overlapWords = [];
        let overlapLength = 0;
        for (let i = words.length - 1; i >= 0; i--) {
          if (overlapLength + words[i].length > overlapSize) break;
          overlapWords.unshift(words[i]);
          overlapLength += words[i].length + 1;
        }

        currentChunk = overlapWords.length
          ? `${overlapWords.join(' ')} ${sentence}`
          : sentence;
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk = tempChunk;
    }
  }

  if (currentChunk && currentChunk.trim().length >= MIN_CHUNK_CHARS) {
    console.log(`Pushing final chunk of length: ${currentChunk.length}`);
    chunks.push(currentChunk.trim());
  }

  console.log(`Created ${chunks.length} chunks`);
  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i + 1} length: ${chunk.length} characters (≈${Math.round(chunk.length / CHARS_PER_TOKEN)} tokens)`);
  });

  return chunks;
}

// ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────

async function processFile(filePathOrContent, metadata = {}) {
  try {
    let text;

    // Accepts either a file path (string) or raw buffer/content
    if (typeof filePathOrContent === 'string' && fs.existsSync(filePathOrContent)) {
      console.log(`Extracting text from file: ${filePathOrContent}`);
      text = await extractTextFromFile(filePathOrContent);
    } else {
      // Legacy: raw content passed directly (your existing usage)
      text = filePathOrContent.toString();
    }

    console.log(`Processing text of length: ${text.length}`);

    if (!text || text.trim().length < MIN_CHUNK_CHARS) {
      console.warn('File yielded no usable text — skipping');
      return { success: false, message: 'No usable text extracted', metadata };
    }

    const chunks = await splitIntoChunks(text);
    console.log(`Split content into ${chunks.length} chunks`);

    if (chunks.length === 0) {
      console.warn('No chunks generated — skipping vector store upsert');
      return { success: false, message: 'No chunks generated', metadata };
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkMetadata = {
        ...metadata,
        chunkIndex: i,
        totalChunks: chunks.length,
      };
      await vectorStore.storeMemory(chunks[i], chunkMetadata);
    }

    return {
      success: true,
      message: `Content split and stored in ${chunks.length} chunks`,
      metadata,
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

module.exports = { processFile, splitIntoChunks, extractTextFromFile };