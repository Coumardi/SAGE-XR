import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadedFilesList from '../src/Components/UploadedFilesList';

// Mock the FontAwesome icon
jest.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: {
    add: jest.fn()
  }
}));

describe('UploadedFilesList Component', () => {
  const mockRemoveFile = jest.fn();
  
  beforeEach(() => {
    // Clear mock function calls before each test
    mockRemoveFile.mockClear();
  });
  
  test('renders with empty file list', () => {
    render(<UploadedFilesList uploadedFiles={[]} removeFile={mockRemoveFile} />);
    
    // Check if the component renders with the correct text
    expect(screen.getByText('Uploaded Files:')).toBeInTheDocument();
    expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
  });
  
  test('renders with uploaded files', () => {
    const mockFiles = [
      { name: 'document1.pdf' },
      { name: 'document2.docx' },
      { name: 'document3.txt' }
    ];
    
    render(<UploadedFilesList uploadedFiles={mockFiles} removeFile={mockRemoveFile} />);
    
    // Check if all files are rendered
    mockFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
    
    // Check if "No files uploaded yet" is not rendered
    expect(screen.queryByText('No files uploaded yet')).not.toBeInTheDocument();
  });
  
  test('calls removeFile with correct index when remove button is clicked', () => {
    const mockFiles = [
      { name: 'document1.pdf' },
      { name: 'document2.docx' },
      { name: 'document3.txt' }
    ];
    
    render(<UploadedFilesList uploadedFiles={mockFiles} removeFile={mockRemoveFile} />);
    
    // Click the remove button for the second file
    const removeButtons = screen.getAllByText('x');
    fireEvent.click(removeButtons[1]);
    
    // Check if removeFile was called with the correct index
    expect(mockRemoveFile).toHaveBeenCalledWith(1);
    expect(mockRemoveFile).toHaveBeenCalledTimes(1);
  });
  
  test('renders download icon', () => {
    render(<UploadedFilesList uploadedFiles={[]} removeFile={mockRemoveFile} />);
    
    // Check if the download icon container is rendered
    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).toBeInTheDocument();
  });
  
  test('handles multiple remove actions correctly', () => {
    const mockFiles = [
      { name: 'document1.pdf' },
      { name: 'document2.docx' },
      { name: 'document3.txt' }
    ];
    
    render(<UploadedFilesList uploadedFiles={mockFiles} removeFile={mockRemoveFile} />);
    
    // Click the remove button for the first file
    const removeButtons = screen.getAllByText('x');
    fireEvent.click(removeButtons[0]);
    
    // Click the remove button for the third file
    fireEvent.click(removeButtons[2]);
    
    // Check if removeFile was called with the correct indices
    expect(mockRemoveFile).toHaveBeenCalledWith(0);
    expect(mockRemoveFile).toHaveBeenCalledWith(2);
    expect(mockRemoveFile).toHaveBeenCalledTimes(2);
  });
}); 