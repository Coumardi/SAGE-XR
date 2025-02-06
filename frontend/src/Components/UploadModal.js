import React, { useState } from 'react';
import FileInput from './FileInput';
import UploadedFilesList from './UploadedFilesList';
import ModalButtons from './ModalButtons';

function UploadModal({ toggleUploadModal, setUploadSuccess }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadFailureMessage, setUploadFailureMessage] = useState('');

  const addFiles = (files) => {
    const validFiles = files.filter(
      (file) =>
        file.name.endsWith('.txt') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pptx') ||
        file.name.endsWith('.doc')
    );

    const invalidFiles = files.length - validFiles.length;
    const filesAdded = uploadedFiles.length + validFiles.length;
    const MAX_FILES = 3;

    if (filesAdded > MAX_FILES) {
      setErrorMessage(`You can only upload up to 3 files. You have added ${filesAdded - MAX_FILES} too many.`);
      return;
    }

    if (invalidFiles > 0) {
      setErrorMessage('Some files were not uploaded due to invalid format.');
    } else {
      setErrorMessage('');
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setErrorMessage('');
    setUploadFailureMessage('');
    toggleUploadModal();
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async (e) => {
    e.currentTarget.disabled = true;

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file.');
      e.currentTarget.disabled = true;
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        
        toggleUploadModal();          // First close the modal
        setTimeout(() => {
          setUploadSuccess(true);     // Then show success message
          setTimeout(() => {
            setUploadSuccess(false);  // Hide success message after 3 seconds
          }, 3000);
        }, 100);                      // Small delay to ensure modal closes first
      } else {
        const result = await response.json();
        setUploadFailureMessage(`Error: ${result.message}`);
        setTimeout(() => {
          setUploadFailureMessage('');
        }, 3000);
        e.currentTarget.disabled = false;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadFailureMessage('Failed to upload files');
      setTimeout(() => {
        setUploadFailureMessage('');
      }, 3000);
      e.currentTarget.disabled = false;
    }
  };

  return (
    <div className="upload-modal">
      <div className="modal-content">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {uploadFailureMessage && <p className="failure-message">{uploadFailureMessage}</p>} {/* Display failure message */}
        <FileInput addFiles={addFiles} />
        <UploadedFilesList uploadedFiles={uploadedFiles} removeFile={removeFile} />
        <ModalButtons
          clearFiles={clearFiles}
          handleUpload={handleUpload}
        />
      </div>
    </div>
  );
}

export default UploadModal;