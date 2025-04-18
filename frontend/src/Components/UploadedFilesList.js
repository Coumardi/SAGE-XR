import React from 'react';

function UploadedFilesList({ uploadedFiles, removeFile }) {
  return (
    <div className="uploaded-files">
      <div className="icon-container" data-testid="icon-container">
        <i className="fa-solid fa-download"></i>
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
  );
}

export default UploadedFilesList;
