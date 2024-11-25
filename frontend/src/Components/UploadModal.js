import React, { useState } from 'react';

function UploadModal({ toggleUploadModal }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const MAX_FILES = 3;

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(
      (file) =>
        file.name.endsWith('.txt') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pptx')     
    );

    const filesAdded = uploadedFiles.length + validFiles.length;
    
    if (filesAdded > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} files. You've exceeded by ${filesAdded - MAX_FILES} ${filesAdded - MAX_FILES === 1 ? 'file' : 'files'}.`);
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    toggleUploadModal();
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== indexToRemove));
  };

  const getUploadStatusMessage = () => {
    const remainingFiles = MAX_FILES - uploadedFiles.length;
    
    if (uploadedFiles.length === 0) {
      return `You can select up to ${MAX_FILES} files`;
    } else if (remainingFiles === 0) {
      return "Maximum number of files reached";
    } else {
      return `You can add ${remainingFiles} more ${remainingFiles === 1 ? 'file' : 'files'}`;
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Files uploaded successfully');
        toggleUploadModal();
      } else {
        const result = await response.json();
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload files.');
    }
  };

  return (
    <div className="upload-modal">
      <div className="modal-content" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <h3>Choose files or drag them here</h3>
        <p>{getUploadStatusMessage()}</p>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".txt, .pdf, .docx, .pptx"
          style={{ display: 'block', margin: '20px auto' }}
        />

        <div className="uploaded-files">
          <div className="icon-container">
            <i className="fa-solid fa-download"></i>
          </div>

          <h4>Uploaded Files:</h4>
          <ul>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} <span className="remove-file" onClick={() => removeFile(index)}>×</span>
                </li>
              ))
            ) : (
              <li>No files uploaded yet</li>
            )}
          </ul>
        </div>

        <div className="modal-buttons">
          <button onClick={clearFiles} className="exit-modal-button">Exit</button>
          <button 
            onClick={handleUpload} 
            className="upload-modal-button"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;