import React, { useState } from "react";
import axios from "axios";
import "../Styles/DropBox.css";

const DropboxApp = ({ setImage_url, image_url }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function handleUpload(event) {
    event.preventDefault();
    setUploading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append("file", file);

    let dropBox = "/api/dropbox/upload";
    try {
      const response = await axios.post(dropBox, formData);

      const data = response.data;

      let oldimage = data.url;

      const image = oldimage.replace("dl=0", "raw=1");

      if (image) {
        setImage_url(image);
        setUploadSuccess(true); // Set upload success state
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  return (
    <div className="dropbox-container">
      <form className="dropboxForm" onSubmit={handleUpload}>
        <input
          type="file"
          name="file"
          id="file"
          className="fileInput"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {!file && (
          <label htmlFor="file" className="uploadLabel">
            Choose a file
          </label>
        )}
        {file && (
          <div className="fileDiv">
            <p className="fileUrl">Upload {file.name}?</p>
          </div>
        )}

        {uploadSuccess ? (
          <p style={{ color: "green" }}>Picture Uploaded successfully!</p>
        ) : (
          <>
            {file && (
              <button
                className="uploadButton"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default DropboxApp;
