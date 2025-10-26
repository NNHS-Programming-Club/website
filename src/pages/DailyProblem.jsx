import React, { useState, useEffect, useRef } from 'react';
import './DailyProblem.css';
import { makeSubmissionAndGetToken, getSubmission } from '../api/judge0-api';
import { GET_SUBMISSION_DELAY } from '../constants';
import CodeEditor from '../components/DailyProblem/CodeEditor';
import ResizeBar from '../components/DailyProblem/ResizeBar';
import { getDailyProblem } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

export default function DailyProblem() {
  // State management
  const [language, setLanguage] = useState('92'); // Default to Python
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('Output will appear here...');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Daily problem state
  const [dailyProblem, setDailyProblem] = useState(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState(null);

  // Panel sizing state
  const [leftPanelWidth, setLeftPanelWidth] = useState(500);
  const [codeEditorHeight, setCodeEditorHeight] = useState(400);

  // Refs for resize targets
  const problemDescRef = useRef(null);
  const codeEditorContainerRef = useRef(null);

  const { userLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Calculate constraints based on window size percentages
  const getLeftPanelConstraints = () => {
    const windowWidth = window.innerWidth;
    // console.log("Window width: ", windowWidth);
    return {
      minSize: windowWidth * 0.2, // 20% of window width
      maxSize: windowWidth * 0.7   // 70% of window width
    };
  };

  const getCodeEditorConstraints = () => {
    const windowHeight = window.innerHeight;
    const navbarHeight = 100; // Approximate navbar height
    const margins = 32; // Total margins and padding
    const availableHeight = windowHeight - navbarHeight - margins;
    console.log("max Height: ", availableHeight*0.85);
    
    return {
      minSize: availableHeight * 0.15, // 15% of available height
      maxSize: availableHeight * 0.85   // 85% of available height
    };
  };

  // Fetch daily problem on component mount
  useEffect(() => {
    const fetchDailyProblem = async () => {
      try {
        setIsLoadingProblem(true);
        setProblemError(null);
        const problem = await getDailyProblem();
        setDailyProblem(problem);
      } catch (error) {
        console.error('Error fetching daily problem:', error);
        setProblemError(error.message);
      } finally {
        setIsLoadingProblem(false);
      }
    };

    fetchDailyProblem();
  }, []);

  // Handle window resize to update constraints
  useEffect(() => {
    const handleWindowResize = () => {
      // Recalculate constraints when window resizes
      const leftConstraints = getLeftPanelConstraints();
      const codeEditorConstraints = getCodeEditorConstraints();
      
      // Ensure current sizes are within new constraints
      setLeftPanelWidth(prev => Math.max(leftConstraints.minSize, Math.min(leftConstraints.maxSize, prev)));
      setCodeEditorHeight(prev => Math.max(codeEditorConstraints.minSize, Math.min(codeEditorConstraints.maxSize, prev)));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

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
      {!authLoading && !userLoggedIn && (
        <div className="overlay-blur">
          <div className="overlay-center-content">
            <h2>You must be logged in to access the Daily Problem page.</h2>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      )}
      <div 
        ref={problemDescRef}
        className="problemDesc"
        style={{ width: `${leftPanelWidth}px` }}
      >
        {isLoadingProblem ? (
          <div>
            <h2>Loading today's problem...</h2>
            <p>Please wait while we fetch your daily challenge.</p>
          </div>
        ) : problemError ? (
          <div>
            <h2>Error Loading Problem</h2>
            <p>Sorry, we couldn't load today's problem: {problemError}</p>
            <p>Please try refreshing the page.</p>
          </div>
        ) : dailyProblem ? (
          <div>
            <h2>{dailyProblem.title}</h2>
            <p><strong>Contest:</strong> USACO {dailyProblem.year} {dailyProblem.month} Contest, {dailyProblem.division}</p>
            <p><strong>Problem Number:</strong> {dailyProblem['problem-number']}</p>
            <div style={{ marginTop: '20px' }}>
              <h3>Problem Description</h3>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {dailyProblem.description}
              </div>
            </div>
            {dailyProblem.url && (
              <div style={{ marginTop: '20px' }}>
                <p><strong>Original Problem:</strong> <a href={dailyProblem.url} target="_blank" rel="noopener noreferrer">View on USACO Website</a></p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2>No Problem Available</h2>
            <p>Sorry, no problem is available at the moment.</p>
          </div>
        )}
      </div>

      <ResizeBar 
        direction="vertical" 
        onResize={setLeftPanelWidth}
        minSize={getLeftPanelConstraints().minSize}
        maxSize={getLeftPanelConstraints().maxSize}
        targetElement={problemDescRef.current}
      />

        <div className="rightColumn">
          <CodeEditor
            ref={codeEditorContainerRef}
            value={code}
            onChange={setCode}
            languageId={language}
            height={`${codeEditorHeight}px`}
          />

          <ResizeBar 
            direction="horizontal" 
            onResize={setCodeEditorHeight}
            minSize={getCodeEditorConstraints().minSize}
            maxSize={getCodeEditorConstraints().maxSize}
            targetElement={codeEditorContainerRef.current}
          />

          <div className="bottomRight">
            <div className="form-group inputContainer">
              <label htmlFor="stdin">Input (stdin):</label>
              <br />
              <textarea
                id="stdin"
                placeholder="Enter input here (optional)..."
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />

              <div className="controls-group">
                <div className="languageSelector">
                  <label htmlFor="language">Language:</label>
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
                
                <div className="button-group">
                  <button
                    className="btn btn-secondary"
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>

            <div className="outputContainer">
              <pre>{output}</pre>
              {error && (
                <div className="error-message">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}