import React from 'react';


function FileInput({ addFiles }) {
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

  return (
    <div
      className="file-input-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h3>Choose a file or Drag it here</h3>
      <p>Select up to 3 files</p>

      {/* Custom button to trigger file input */}
      <button
        onClick={() => document.getElementById('file-input').click()}
        className="custom-file-button"
        type="button"
      >
        Choose File
      </button>

      {/* Hidden file input */}
      <input
        id="file-input"
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".txt, .pdf, .docx, .pptx"
        style={{ display: 'none' }} // Hidden by default
      />
    </div>
  );
}

export default FileInput;
