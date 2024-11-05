import React, { useState } from 'react';

function UploadModal({ toggleUploadModal }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
    const validFiles = files.filter(file => file.name.endsWith('.txt'));

    if (uploadedFiles.length + validFiles.length > 3) {
      alert("You can only upload up to 3 files.");
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
        <h3>Drag & Drop your files here</h3>
        <p>Or select up to 3 files (only .txt allowed)</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".txt"
          style={{ display: 'block', margin: '20px auto' }}
        />

        <div className="uploaded-files">
          <h4>Uploaded Files:</h4>
          <ul>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} <span className="remove-file" onClick={() => removeFile(index)}>x</span>
                </li>
              ))
            ) : (
              <li>No files uploaded yet</li>
            )}
          </ul>
        </div>

        <div className="modal-buttons">
          <button onClick={clearFiles} className="exit-modal">Exit</button>
          <button onClick={handleUpload} className="upload-modal-button">Upload</button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
