import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadModal from './UploadModal';

// Mock fetch globally
global.fetch = jest.fn();

describe('UploadModal', () => {
  const mockToggleUploadModal = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    expect(screen.getByText('Choose files or drag them here')).toBeInTheDocument();
    expect(screen.getByText('You can select up to 3 files')).toBeInTheDocument();
    expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
  });

  test('handles valid file upload', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('hello.txt')).toBeInTheDocument();
    expect(screen.getByText('You can add 2 more files')).toBeInTheDocument();
  });

  test('filters out invalid file types', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const validFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const invalidFile = new File(['image'], 'image.jpg', { type: 'image/jpeg' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [validFile, invalidFile] } });
    
    expect(screen.getByText('hello.txt')).toBeInTheDocument();
    expect(screen.queryByText('image.jpg')).not.toBeInTheDocument();
  });

  test('prevents uploading more than maximum files', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const files = [
      new File(['1'], '1.txt', { type: 'text/plain' }),
      new File(['2'], '2.txt', { type: 'text/plain' }),
      new File(['3'], '3.txt', { type: 'text/plain' }),
      new File(['4'], '4.txt', { type: 'text/plain' })
    ];
    
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { files: files } });
    
    expect(alertMock).toHaveBeenCalledWith('You can only upload up to 3 files. You\'ve exceeded by 1 file.');
  });

  test('removes file when clicking remove button', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('×'));
    
    expect(screen.queryByText('hello.txt')).not.toBeInTheDocument();
    expect(screen.getByText('You can select up to 3 files')).toBeInTheDocument();
  });

  test('handles successful file upload submission', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    }));

    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Upload'));
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Files uploaded successfully');
      expect(mockToggleUploadModal).toHaveBeenCalled();
    });
  });

  test('handles failed file upload submission', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const errorMessage = 'Upload failed';
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage })
    }));

    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Upload'));
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(`Error: ${errorMessage}`);
    });
  });

  test('handles drag and drop', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const modalContent = screen.getByText('Choose files or drag them here').parentElement;
    
    fireEvent.drop(modalContent, {
      dataTransfer: {
        files: [file]
      },
      preventDefault: () => {},
      stopPropagation: () => {}
    });
    
    expect(screen.getByText('hello.txt')).toBeInTheDocument();
  });

  test('clears files and closes modal when clicking exit', () => {
    render(<UploadModal toggleUploadModal={mockToggleUploadModal} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByDisplayValue('');
    
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Exit'));
    
    expect(mockToggleUploadModal).toHaveBeenCalled();
  });
});