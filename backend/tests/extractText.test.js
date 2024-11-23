const { extractTextFromDocx, extractTextFromPdf, extractTextFromPptx } = require('../services/extractText');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const JSZip = require('jszip');
const xml2js = require('xml2js');

jest.mock('mammoth');
jest.mock('pdf-parse', () => jest.fn());
jest.mock('jszip');
jest.mock('xml2js');

describe('extractText.js', () => {
  describe('extractTextFromDocx', () => {
    it('should extract text from a valid .docx buffer', async () => {
      const mockBuffer = Buffer.from('mock docx content');
      const mockResult = { value: 'Extracted text from docx' };
      mammoth.extractRawText.mockResolvedValueOnce(mockResult);

      const result = await extractTextFromDocx(mockBuffer);
      expect(result).toBe('Extracted text from docx');
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer: mockBuffer });
    });

    it('should handle errors from the mammoth library', async () => {
      const mockBuffer = Buffer.from('mock docx content');
      mammoth.extractRawText.mockRejectedValueOnce(new Error('Mammoth error'));

      await expect(extractTextFromDocx(mockBuffer)).rejects.toThrow('Mammoth error');
    });

    it('should handle docx with complex formatting', async () => {
        const mockBuffer = Buffer.from('mock docx content');
        const mockResult = { 
          value: 'Text with\nmultiple\nlines and formatting',
          messages: [{ type: 'warning', message: 'Unsupported formatting found' }]
        };
        mammoth.extractRawText.mockResolvedValueOnce(mockResult);
  
        const result = await extractTextFromDocx(mockBuffer);
        expect(result).toBe('Text with\nmultiple\nlines and formatting');
    });
  
    it('should handle empty docx files', async () => {
        const mockBuffer = Buffer.from('mock empty docx');
        const mockResult = { value: '' };
        mammoth.extractRawText.mockResolvedValueOnce(mockResult);
  
        const result = await extractTextFromDocx(mockBuffer);
        expect(result).toBe('');
    });
  
    it('should handle large docx files', async () => {
        const mockBuffer = Buffer.from('mock large docx');
        const longText = 'A'.repeat(1000000); // 1MB of text
        const mockResult = { value: longText };
        mammoth.extractRawText.mockResolvedValueOnce(mockResult);
  
        const result = await extractTextFromDocx(mockBuffer);
        expect(result).toBe(longText);
        expect(result.length).toBe(1000000);
    });
  });

  describe('extractTextFromPdf', () => {
    it('should extract text from a valid .pdf buffer', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const mockData = { text: 'Line 1\nLine 2\n\nLine 3' };
      pdfParse.mockResolvedValueOnce(mockData);

      const result = await extractTextFromPdf(mockBuffer);
      expect(result).toBe('Line 1 Line 2 Line 3');
      expect(pdfParse).toHaveBeenCalledWith(mockBuffer);
    });

    it('should handle errors from the pdf-parse library', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      pdfParse.mockRejectedValueOnce(new Error('PDF parse error'));
      console.error = jest.fn(); // Mock console.error

      await expect(extractTextFromPdf(mockBuffer)).rejects.toThrow('Failed to extract text from PDF: PDF parse error');
      expect(console.error).toHaveBeenCalledWith('PDF extraction error:', expect.any(Error));
    });
  });

  describe('extractTextFromPptx', () => {
    let mockZip;
    let mockParser;
    
    beforeEach(() => {
        // Reset mocks before each test
        mockZip = {
            loadAsync: jest.fn(),
            file: jest.fn()
        };
        mockParser = {
            parseStringPromise: jest.fn()
        };
        
        JSZip.mockImplementation(() => mockZip);
        xml2js.Parser.mockImplementation(() => mockParser);
    });

    it('should extract text from a valid .pptx buffer', async () => {
        const mockBuffer = Buffer.from('mock pptx content');
        const mockSlideContent = `<?xml version="1.0" encoding="UTF-8"?>
            <p:sld xmlns:p="presentation" xmlns:a="drawing">
                <p:cSld>
                    <p:spTree>
                        <p:sp>
                            <p:txBody>
                                <a:p>
                                    <a:r>
                                        <a:t>Slide 1 Text</a:t>
                                    </a:r>
                                </a:p>
                            </p:txBody>
                        </p:sp>
                    </p:spTree>
                </p:cSld>
            </p:sld>`;

        // Mock the zip contents
        mockZip.loadAsync.mockResolvedValueOnce();
        mockZip.files = {
            'ppt/slides/slide1.xml': {},
            'ppt/slides/slide2.xml': {},
            'other/file.xml': {}
        };
        mockZip.file.mockImplementation(() => ({
            async: jest.fn().mockResolvedValue(mockSlideContent)
        }));

        // Mock the XML parsing result
        mockParser.parseStringPromise.mockResolvedValue({
            'p:sld': {
                'p:cSld': [{
                    'p:spTree': [{
                        'p:sp': [{
                            'p:txBody': [{
                                'a:p': [{
                                    'a:r': [{
                                        'a:t': ['Slide 1 Text']
                                    }]
                                }]
                            }]
                        }]
                    }]
                }]
            }
        });

        const result = await extractTextFromPptx(mockBuffer);
        
        expect(JSZip).toHaveBeenCalled();
        expect(mockZip.loadAsync).toHaveBeenCalledWith(mockBuffer);
        expect(mockParser.parseStringPromise).toHaveBeenCalled();
        expect(result).toContain('Slide 1 Text');
    });

    it('should handle empty slides', async () => {
        const mockBuffer = Buffer.from('mock pptx content');
        
        mockZip.loadAsync.mockResolvedValueOnce();
        mockZip.files = {
            'ppt/slides/slide1.xml': {}
        };
        mockZip.file.mockImplementation(() => ({
            async: jest.fn().mockResolvedValue('<p:sld></p:sld>')
        }));

        mockParser.parseStringPromise.mockResolvedValue({
            'p:sld': {
                'p:cSld': [{
                    'p:spTree': [{
                        'p:sp': []
                    }]
                }]
            }
        });

        const result = await extractTextFromPptx(mockBuffer);
        expect(result).toBe('');
    });

    it('should handle multiple slides and concatenate their text', async () => {
        const mockBuffer = Buffer.from('mock pptx content');
        
        mockZip.loadAsync.mockResolvedValueOnce();
        mockZip.files = {
            'ppt/slides/slide1.xml': {},
            'ppt/slides/slide2.xml': {}
        };
        mockZip.file.mockImplementation(() => ({
            async: jest.fn().mockResolvedValue('<p:sld></p:sld>')
        }));

        // Mock different content for each slide
        mockParser.parseStringPromise
            .mockResolvedValueOnce({
                'p:sld': {
                    'p:cSld': [{
                        'p:spTree': [{
                            'p:sp': [{
                                'p:txBody': [{
                                    'a:p': [{
                                        'a:r': [{
                                            'a:t': ['Slide 1 Content']
                                        }]
                                    }]
                                }]
                            }]
                        }]
                    }]
                }
            })
            .mockResolvedValueOnce({
                'p:sld': {
                    'p:cSld': [{
                        'p:spTree': [{
                            'p:sp': [{
                                'p:txBody': [{
                                    'a:p': [{
                                        'a:r': [{
                                            'a:t': ['Slide 2 Content']
                                        }]
                                    }]
                                }]
                            }]
                        }]
                    }]
                }
            });

        const result = await extractTextFromPptx(mockBuffer);
        expect(result).toBe('Slide 1 Content\n\n---\n\nSlide 2 Content');
    });

    it('should handle errors during extraction', async () => {
        const mockBuffer = Buffer.from('mock pptx content');
        mockZip.loadAsync.mockRejectedValueOnce(new Error('Failed to load ZIP'));

        await expect(extractTextFromPptx(mockBuffer))
            .rejects
            .toThrow('Failed to extract text from PPTX: Failed to load ZIP');
    });

    it('should handle malformed XML content', async () => {
        const mockBuffer = Buffer.from('mock pptx content');
        
        mockZip.loadAsync.mockResolvedValueOnce();
        mockZip.files = {
            'ppt/slides/slide1.xml': {}
        };
        mockZip.file.mockImplementation(() => ({
            async: jest.fn().mockResolvedValue('malformed xml')
        }));

        mockParser.parseStringPromise.mockRejectedValueOnce(new Error('XML Parse Error'));

        await expect(extractTextFromPptx(mockBuffer))
            .rejects
            .toThrow('Failed to extract text from PPTX: XML Parse Error');
    });
});
});
