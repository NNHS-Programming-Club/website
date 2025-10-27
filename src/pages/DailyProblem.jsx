import React, { useState, useEffect, useRef } from 'react';
import './DailyProblem.css';
import { uploadToJudge0 } from '../api/judge0-api';
import CodeEditor from '../components/DailyProblem/CodeEditor';
import ResizeBar from '../components/DailyProblem/ResizeBar';
import { getDailyProblem } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Add to your imports
import { app } from '../firebase/firebase'; // Ensure you are importing the initialized Firebase app

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

  const formatSubmissionResult = (submission, testCaseNum) => {
    const statusCode = submission.status.id;

    let resultText = "";
    if (statusCode === 3) {
      resultText = "✅ Correct Answer";
    } else if (statusCode === 4) {
      resultText = "❌ Wrong Answer";
    } else if (statusCode === 5) {
      resultText = "⏰ Time Limit Exceeded";
    } else if (statusCode === 6) {
      resultText = "🔨 Compilation Error";
    } else if (statusCode >= 7) {
      resultText = "💥 Runtime Error";
    }

    return resultText;
  };

  // Helper function to format submission result
  const formatRunResult = (submission) => {
    const statusCode = submission.status.id;

    let resultText = "";
    if (statusCode === 6) {
      resultText = "🔨 Compilation Error\n\n" + atob(submission.compile_output);
    } else if (statusCode >= 7) {
      resultText = "💥 " + submission.status.description + "\n\nError:\n" + atob(submission.stderr);
    } else {
      resultText = "Output:\n" + atob(submission.stdout);
    }

    // Add execution time and memory info
    const executionTime = submission.time ? `${submission.time}s` : 'N/A';
    const memoryUsed = submission.memory ? `${submission.memory}KB` : 'N/A';
    resultText += `\n\nExecution Time: ${executionTime}`;
    resultText += `\nMemory Used: ${memoryUsed}`;

    return resultText;
  };

  // Event handlers
  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Please enter some code to run.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput('Uploading and running...');

    try {
      const submission = await uploadToJudge0(parseInt(language), code, stdin, null);
      const resultText = formatRunResult(submission);
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
    setOutput('Fetching test cases...');

    try {
      // 1. Fetch test cases JSON from Firebase Storage using the Storage SDK
      let testCases = [];
      if (!dailyProblem?.testCasesStorageUrl) {
        throw new Error('No test cases URL found for this problem.');
      }
      // Extract path (after bucket name)
      const storageUrl = dailyProblem.testCasesStorageUrl;
      // E.g. from https://storage.googleapis.com/nnhs-programming-club-website.appspot.com/test-cases/123.json get 'test-cases/123.json'
      const match = storageUrl.match(/googleapis.com\/[^/]+\/(.+)/);
      const filePath = match ? match[1] : null;
      if (!filePath) throw new Error('Could not parse test cases path from URL.');
      const storage = getStorage(app);
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch test cases JSON from storage.');
      testCases = await res.json(); // [{in:..., out:...}, ...]
      if (!Array.isArray(testCases) || testCases.length === 0) throw new Error('No test cases available.');

      // 2. Run the submission for each test case in order
      setOutput(`Running ${testCases.length} test cases...\n\n`)
      let testsPassed = 0;
      for (let i = 0; i < testCases.length; ++i) {
        const t = testCases[i];
        let submission;
        try {
          submission = await uploadToJudge0(parseInt(language), code, t.in, t.out);
          if (submission.status.id == 3) { testsPassed++; }
          setOutput(prev => prev + `Test Case #${i+1}: ${formatSubmissionResult(submission, t.out, false)}\n`);
        } catch (err) {
          setOutput(prev => prev + `Test Case #${i+1}: ⚠️ Server Error\n`);
        }
      }

      setOutput(prev => prev + `Passed ${testsPassed} out of ${testCases.length} test cases.\n`)

      // TODO add submission stats to firebase

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