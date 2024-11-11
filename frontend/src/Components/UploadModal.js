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

  // Function to add files with a 3-file limit 
  const addFiles = (files) => {
    const validFiles = files.filter(
      (file) =>

        file.name.endsWith('.txt')||
        file.name.endsWith('.pdf')||
        file.name.endsWith('.docx')||
        file.name.endsWith('.pptx')     

    );

    const filesAdded= uploadedFiles.length + validFiles.lenght;
    const maxFiles = 3;

    if (filesAdded > maxFiles) {
      alert(`You can only upload up to 3 files. you have added ${filesAdded-maxFiles}`);
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
        <h3>Choose a file or Drag it here</h3>
        <p>
          {uploadedFiles.length>0

          ? `you can add up to ${3 - uploadedFiles.length} more files`
          : `select up to 3 files`
          }
          
        </p>
        

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".txt, .pdf, .docx, .pptx"
          style={{ display: 'block', margin: '20px auto' }}
        />

        {/* Display uploaded file names with "X" to remove */}
        <div className="uploaded-files">
        <div className="icon-container">
        <i className="fa-solid fa-download" ></i>
        </div>

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
            <button onClick={clearFiles} className="exit-modal-button">Exit</button>
          <button onClick={handleUpload} className="upload-modal-button">Upload</button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
