import React, { useState } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const CustomAlert = ({ children }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
    <strong className="font-bold">Error!</strong>
    <span className="block sm:inline"> {children}</span>
  </div>
);

const ResumeUpload = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [steps, setSteps] = useState([
    { name: 'Extract Text', complete: false },
    { name: 'Extract Factors', complete: false },
    { name: 'Match Text', complete: false },
  ]);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const uploadFiles = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post('http://localhost:5000/extract_text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSessionId(response.data.session_id);
      updateStep('Extract Text', true);
      await extractFactors(response.data.session_id);
    } catch (err) {
      setError('Error uploading files: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractFactors = async (sessionId) => {
    try {
      await axios.post(`http://localhost:5000/extract_factors?session_id=${sessionId}`);
      updateStep('Extract Factors', true);
      await matchText(sessionId);
    } catch (err) {
      setError('Error extracting factors: ' + err.message);
    }
  };

  const matchText = async (sessionId) => {
    try {
      await axios.post(`http://localhost:5000/match_text?session_id=${sessionId}`);
      updateStep('Match Text', true);
    } catch (err) {
      setError('Error matching text: ' + err.message);
    }
  };

  const updateStep = (stepName, complete) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.name === stepName ? { ...step, complete } : step
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resume Upload and Processing</h1>
      <input
        type="file"
        onChange={handleFileChange}
        multiple
        accept=".pdf"
        className="mb-4"
      />
      <button
        onClick={uploadFiles}
        disabled={loading || files.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Upload and Process'}
      </button>

      {loading && (
        <div className="mt-4 flex items-center">
          <Upload className="animate-spin mr-2" />
          <span>Processing files...</span>
        </div>
      )}

      {error && <CustomAlert>{error}</CustomAlert>}

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Processing Steps</h2>
        {steps.map((step, index) => (
          <div key={index} className="flex items-center mb-2">
            {step.complete ? (
              <CheckCircle className="text-green-500 mr-2" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" />
            )}
            <span>{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeUpload;