import './DailyProblem.css';
import { makeSubmissionAndGetToken, getSubmission } from '../api/judge0-api';
import { GET_SUBMISSION_DELAY } from '../constants';

async function runCode() {
  const languageId = parseInt(document.getElementById('language').value);
  const code = document.getElementById('code').value;
  const stdin = document.getElementById('stdin').value;
  const outputDiv = document.getElementById('output');
  
  if (!code.trim()) {
    outputDiv.textContent = 'Please enter some code to run.';
    return;
  }
  
  outputDiv.textContent = 'Setting up...';
  
  try {
    // Submit without expectedOutput (pass null)
    const submission = await submitCodeToJudge0(languageId, code, stdin, null, outputDiv);
    // Update UI with the result
    updateUIWithSubmissionResult(submission, null, outputDiv, true);
  } catch (error) {
    console.error('Error running code:', error);
    outputDiv.textContent = '⚠️ Server Error: ' + error.message + '\n\nThis is not a problem with your code. Please try again.';
  }
}

async function submitCode() {
  const languageId = parseInt(document.getElementById('language').value);
  const code = document.getElementById('code').value;
  const stdin = document.getElementById('stdin').value; // change this to test input
  const outputDiv = document.getElementById('output');
  
  if (!code.trim()) {
    outputDiv.textContent = 'Please enter some code to submit.';
    return;
  }
  
  outputDiv.textContent = 'Submitting code...';
  
  try {
    // Submit with empty expectedOutput
    const submission = await submitCodeToJudge0(languageId, code, stdin, '', outputDiv);
    // Update UI with the result
    updateUIWithSubmissionResult(submission, '', outputDiv, false);
  } catch (error) {
    console.error('Error submitting code:', error);
    outputDiv.textContent = '⚠️ Server Error: ' + error.message + '\n\nThis is not a problem with your code. Please try again.';
  }
}

// Function that handles the actual Judge0 submission logic
async function submitCodeToJudge0(languageId, code, stdin, expectedOutput, outputDiv) {
  outputDiv.textContent = 'Uploading your code...';

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
      outputDiv.textContent = 'In Queue...';
      await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
      continue;
    }
    if (statusCode === 2) {
      outputDiv.textContent = 'Processing...';
      await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
      continue;
    }
    
    // Return the final submission result
    return submission;
  }
}

// Function that handles UI updates based on submission result
function updateUIWithSubmissionResult(submission, expectedOutput, outputDiv, isRunCode) {
  const statusCode = submission.status.id;
  
  let output = "";
  if (submission.stdout !== null) {
    output = atob(submission.stdout);
  }

  // Get execution time
  const executionTime = submission.time ? `${submission.time}s` : 'N/A';
  const memoryUsed = submission.memory ? `${submission.memory}KB` : 'N/A';

  let resultText = "";
  if (statusCode === 3) {
    if (!isRunCode) {
      resultText = "✅ Accepted\n\n";
    }
    resultText += "Output:\n" + output;
  } else if (statusCode === 4) {
    if (!isRunCode) {
      resultText = "❌ Wrong Answer\n\nYour output:\n" + output;
      resultText += "\n\nExpected output:\n" + expectedOutput;
    } else {
      resultText = "Output:\n" + output;
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
  
  outputDiv.textContent = resultText;
}

export default function DailyProblem() {
  return (
    <div className="dailyProblem">
      <h1 className="">Daily Problem</h1>


      <div className="form-group">
        <label htmlFor="language">Select Language:</label>
        <select id="language">
          <option value="92">Python 3.11.2</option>
          <option value="54">C++ (GCC 9.2.0)</option>
          <option value="91">Java (JDK 17.0.6)</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="code">Code:</label>
        <textarea id="code" placeholder="Enter your code here..."></textarea>
      </div>
      
      <div className="form-group">
        <label htmlFor="stdin">Input (stdin):</label>
        <textarea id="stdin" placeholder="Enter input here (optional)..."></textarea>
      </div>
      
      <div className="button-group">
        <button className="run-button" onClick={() => runCode()}>Run Code</button>
        <button className="submit-button" onClick={() => submitCode()}>Submit</button>
      </div>
      
      <div className="output" id="output">Output will appear here...</div>
    </div>
  )
}