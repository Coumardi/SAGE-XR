// services/extractText.js
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const xml2js = require('xml2js');

const extractor = new WordExtractor();

// Extract text from .docx files
async function extractTextFromDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

// Extract text from .pdf files
async function extractTextFromPdf(buffer) {
    try {
        const data = await pdfParse(buffer);

        // Split text by lines to preserve structure and add spaces between lines
        const extractedText = data.text
            .split('\n')           // Split by line breaks
            .map(line => line.trim()) // Trim whitespace on each line
            .filter(line => line)     // Remove any empty lines
            .join(' ')               // Join lines with a space for natural flow

        return extractedText;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

// Extract text from .pptx files
async function extractTextFromPptx(buffer) {
    try {
        const zip = new JSZip();
        await zip.loadAsync(buffer);
        
        // Get all slide XML files
        const slideFiles = Object.keys(zip.files).filter(name => 
            name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        );
        
        const parser = new xml2js.Parser();
        const slides = [];
        
        // Process each slide
        for (const slideFile of slideFiles) {
            const slideXml = await zip.file(slideFile).async('text');
            const result = await parser.parseStringPromise(slideXml);
            
            // Extract text from slide
            const texts = [];
            const slideContent = result['p:sld']['p:cSld'][0];
            
            if (slideContent['p:spTree'] && slideContent['p:spTree'][0]['p:sp']) {
                slideContent['p:spTree'][0]['p:sp'].forEach(shape => {
                    if (shape['p:txBody']) {
                        shape['p:txBody'][0]['a:p'].forEach(paragraph => {
                            if (paragraph['a:r']) {
                                paragraph['a:r'].forEach(run => {
                                    if (run['a:t']) {
                                        texts.push(run['a:t'].join(''));
                                    }
                                });
                            }
                        });
                    }
                });
            }
            
            if (texts.length > 0) {
                slides.push(texts.join('\n'));
            }
        }
        
        return slides.join('\n\n---\n\n');
    } catch (error) {
        throw new Error(`Failed to extract text from PPTX: ${error.message}`);
    }
}



module.exports = {
    extractTextFromDocx,
    extractTextFromPdf,
    extractTextFromPptx,
};
