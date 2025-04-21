import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadModal from '../src/Components/UploadModal';

// Mock child components
jest.mock('../src/Components/FileInput', () => {
  return function MockFileInput({ addFiles }) {
    const handleAddFiles = (type) => {
      if (type === 'invalid') {
        addFiles([new File(['test'], 'test.invalid', { type: 'text/plain' })]);
      } else {
        addFiles([new File(['test'], 'test.txt', { type: 'text/plain' })]);
      }
    };

    return (
      <div data-testid="file-input">
        <button onClick={() => handleAddFiles('valid')}>Mock Add File</button>
        <button onClick={() => handleAddFiles('invalid')} data-testid="add-invalid-file">Add Invalid File</button>
      </div>
    );
  };
});

jest.mock('../src/Components/UploadedFilesList', () => {
  return function MockUploadedFilesList({ uploadedFiles, removeFile }) {
    return (
      <div data-testid="uploaded-files-list">
        {uploadedFiles.map((file, index) => (
          <div key={index}>
            {file.name}
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../src/Components/ModalButtons', () => {
  return function MockModalButtons({ onExit, onCommit, commitButtonRef }) {
    return (
      <div data-testid="modal-buttons">
        <button onClick={onExit} data-testid="exit-button">Exit</button>
        <button onClick={onCommit} ref={commitButtonRef} data-testid="commit-button">Commit</button>
      </div>
    );
  };
});

describe('UploadModal Component', () => {
  const mockToggleUploadModal = jest.fn();
  const mockSetUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders upload modal with child components', () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('uploaded-files-list')).toBeInTheDocument();
    expect(screen.getByTestId('modal-buttons')).toBeInTheDocument();
  });

  test('adds files when FileInput component calls addFiles', () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    fireEvent.click(screen.getByText('Mock Add File'));
    
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  test('removes files when UploadedFilesList component calls removeFile', () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add a file first
    fireEvent.click(screen.getByText('Mock Add File'));
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    
    // Remove the file
    fireEvent.click(screen.getByText('Remove'));
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  test('calls toggleUploadModal when Exit button is clicked', () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    fireEvent.click(screen.getByTestId('exit-button'));
    expect(mockToggleUploadModal).toHaveBeenCalled();
  });

  test('handles successful file upload', async () => {
    // Mock a successful response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Files uploaded successfully' })
      })
    );
    
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add a file
    fireEvent.click(screen.getByText('Mock Add File'));
    
    // Click the Commit button
    fireEvent.click(screen.getByTestId('commit-button'));
    
    // Wait for the upload to complete and modal to close
    await waitFor(() => {
      expect(mockToggleUploadModal).toHaveBeenCalled();
    });
    
    // Wait for the success message to be set
    await waitFor(() => {
      expect(mockSetUploadSuccess).toHaveBeenCalledWith(true);
    });
  });

  test('handles failed file upload', async () => {
    // Mock a failed response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Upload failed' })
      })
    );
    
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add a file
    fireEvent.click(screen.getByText('Mock Add File'));
    
    // Click the Commit button
    fireEvent.click(screen.getByTestId('commit-button'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error: Upload failed/)).toBeInTheDocument();
    });
    
    // Check if toggleUploadModal was not called
    expect(mockToggleUploadModal).not.toHaveBeenCalled();
    
    // Check if setUploadSuccess was not called
    expect(mockSetUploadSuccess).not.toHaveBeenCalled();
  });

  test('handles network error during file upload', async () => {
    // Mock a network error
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add a file
    fireEvent.click(screen.getByText('Mock Add File'));
    
    // Click the Commit button
    fireEvent.click(screen.getByTestId('commit-button'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to upload files')).toBeInTheDocument();
    });
    
    // Check if toggleUploadModal was not called
    expect(mockToggleUploadModal).not.toHaveBeenCalled();
    
    // Check if setUploadSuccess was not called
    expect(mockSetUploadSuccess).not.toHaveBeenCalled();
  });

  test('validates file types', async () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add an invalid file
    fireEvent.click(screen.getByTestId('add-invalid-file'));
    
    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Some files were not uploaded due to invalid format.')).toBeInTheDocument();
    });
  });

  test('validates maximum number of files', () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add three files (maximum allowed)
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Mock Add File'));
    }
    
    // Try to add one more file
    fireEvent.click(screen.getByText('Mock Add File'));
    
    // Check if the error message is displayed
    expect(screen.getByText(/You can only upload up to 3 files/)).toBeInTheDocument();
  });

  test('clears error messages when files are cleared', async () => {
    render(
      <UploadModal 
        toggleUploadModal={mockToggleUploadModal} 
        setUploadSuccess={mockSetUploadSuccess} 
      />
    );
    
    // Add an invalid file
    fireEvent.click(screen.getByTestId('add-invalid-file'));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Some files were not uploaded due to invalid format.')).toBeInTheDocument();
    });
    
    // Click the Exit button to clear files
    fireEvent.click(screen.getByTestId('exit-button'));
    
    // Verify error message is cleared
    await waitFor(() => {
      expect(screen.queryByText('Some files were not uploaded due to invalid format.')).not.toBeInTheDocument();
    });
  });
}); 