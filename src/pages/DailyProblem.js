import React, { useState } from 'react';
import './DailyProblem.css';
import { makeSubmissionAndGetToken, getSubmission } from '../api/judge0-api';
import { GET_SUBMISSION_DELAY } from '../constants';
import CodeEditor from '../components/CodeEditor';

export default function DailyProblem() {
  // State management
  const [language, setLanguage] = useState('92'); // Default to Python
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('Output will appear here...');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format submission result
  const formatSubmissionResult = (submission, expectedOutput, isRunCode) => {
    const statusCode = submission.status.id;
    
    let outputText = "";
    if (submission.stdout !== null) {
      outputText = atob(submission.stdout);
    }

    // Get execution time
    const executionTime = submission.time ? `${submission.time}s` : 'N/A';
    const memoryUsed = submission.memory ? `${submission.memory}KB` : 'N/A';

    let resultText = "";
    if (statusCode === 3) {
      if (!isRunCode) {
        resultText = "✅ Accepted\n\n";
      }
      resultText += "Output:\n" + outputText;
    } else if (statusCode === 4) {
      if (!isRunCode) {
        resultText = "❌ Wrong Answer\n\nYour output:\n" + outputText;
        resultText += "\n\nExpected output:\n" + expectedOutput;
      } else {
        resultText = "Output:\n" + outputText;
      }
    } else if (statusCode === 5) {
      resultText = "⏰ Time Limit Exceeded";
    } else if (statusCode === 6) {
      resultText = "🔨 Compilation Error\n\n" + atob(submission.compile_output);
    } else if (statusCode >= 7) {
      resultText = "💥 " + submission.status.description + "\n\nError:\n" + atob(submission.stderr);
    }
    
    // Add execution time and memory info
    resultText += `\n\nExecution Time: ${executionTime}`;
    resultText += `\nMemory Used: ${memoryUsed}`;
    
    return resultText;
  };

  // Function that handles the actual Judge0 submission logic
  const submitCodeToJudge0 = async (languageId, code, stdin, expectedOutput) => {
    setOutput('Uploading your code...');

    let token = await makeSubmissionAndGetToken(languageId, code, stdin, expectedOutput);
    console.log("Submission token: ", token);
    
    if (!token) {
      throw new Error('Unable to submit your code to the execution server. Please check your connection and try again.');
    }
    
    while (true) {
      const submission = await getSubmission(token);
      console.log("Submission: ", submission);
      
      if (!submission) {
        throw new Error('Unable to retrieve your code execution results. The execution server may be temporarily unavailable.');
      }
      
      const statusCode = submission.status.id;
      
      // If still processing, show status and wait
      if (statusCode === 1) {
        setOutput('In Queue...');
        await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
        continue;
      }
      if (statusCode === 2) {
        setOutput('Processing...');
        await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
        continue;
      }
      
      // Return the final submission result
      return submission;
    }
  };

  // Event handlers
  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Please enter some code to run.');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    setOutput('Setting up...');
    
    try {
      const submission = await submitCodeToJudge0(parseInt(language), code, stdin, null);
      const resultText = formatSubmissionResult(submission, null, true);
      setOutput(resultText);
    } catch (error) {
      console.error('Error running code:', error);
      setError(error.message);
      setOutput('⚠️ Server Error: ' + error.message + '\n\nThis is not a problem with your code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setOutput('Please enter some code to submit.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setOutput('Submitting code...');
    
    try {
      const submission = await submitCodeToJudge0(parseInt(language), code, stdin, '');
      const resultText = formatSubmissionResult(submission, '', false);
      setOutput(resultText);
    } catch (error) {
      console.error('Error submitting code:', error);
      setError(error.message);
      setOutput('⚠️ Server Error: ' + error.message + '\n\nThis is not a problem with your code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dailyProblem">
      <h1>Daily Problem</h1>

      <div className="problemDesc">
        <h2>Problem Title</h2>
        <p>this is such a cool problem and you should totally solve it</p>
      </div>

      <div className="form-group">
        <select 
          id="language" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="92">Python 3.11.2</option>
          <option value="54">C++ (GCC 9.2.0)</option>
          <option value="91">Java (JDK 17.0.6)</option>
        </select>
      </div>
      
      <div style={{float: "left", width: "70%", marginRight: "8px"}} className="form-group">
        <label htmlFor="code">Code:</label>
        <CodeEditor 
          value={code}
          onChange={setCode}
          languageId={language}
          height="300px"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="stdin">Input (stdin):</label>
        <br />
        <textarea 
          id="stdin" 
          placeholder="Enter input here (optional)..."
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
        />
      </div>
      
      <div className="button-group">
        <button 
          className="run-button" 
          onClick={handleRunCode}
          disabled={isRunning || isSubmitting}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button 
          className="submit-button" 
          onClick={handleSubmitCode}
          disabled={isRunning || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      
      <div className="output">
        <pre>{output}</pre>
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}