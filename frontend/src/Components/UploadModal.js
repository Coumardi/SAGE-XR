import React, { useState } from 'react';

function UploadModal({ toggleUploadModal }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Handle file selection (from file explorer)
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
  };

  // Handle drag-and-drop files
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  // Function to add files with a 3-file limit and .txt restriction
  const addFiles = (files) => {
    const validFiles = files.filter(file => file.name.endsWith('.txt'));

    if (uploadedFiles.length + validFiles.length > 3) {
      alert("You can only upload up to 3 files.");
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const clearFiles = () => {
    setUploadedFiles([]);  // Clear all uploaded files
    toggleUploadModal();  // Close modal
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = () => {
    // Placeholder for the actual upload function that you'll define later
    console.log('Uploading files:', uploadedFiles);
    toggleUploadModal();
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

        {/* Display uploaded file names with "X" to remove */}
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

        {/* Upload and Exit buttons */}
            <div className="modal-buttons">
            <button onClick={clearFiles} className="exit-modal">Exit</button>
          <button onClick={handleUpload} className="upload-modal-button">Upload</button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
