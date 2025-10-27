import { GET_SUBMISSION_DELAY } from '../constants';

export async function makeSubmissionAndGetToken(languageId, code, stdin, expectedOutput) {
  const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
  
  // Build the request body
  const requestBody = {
    language_id: languageId,
    source_code: btoa(code),
    stdin: btoa(stdin)
  };
  
  // Only add expected_output if it's not null
  if (expectedOutput !== null) {
    requestBody.expected_output = btoa(expectedOutput);
  }
  
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': '874336a58emshfde54b9863aac5ep1db748jsnaf983ceada89',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    return result.token;
  } catch (error) {
    console.error('API Error - Submission failed:', error);
    throw new Error('Unable to submit your code to the execution server. Please try again.');
  }
}

export async function getSubmission(token) {
  const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '874336a58emshfde54b9863aac5ep1db748jsnaf983ceada89',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('API Error - Failed to get submission result:', error);
    throw new Error('Unable to retrieve your code execution results. Please try again.');
  }
}

// Function that handles the actual Judge0 submission logic
export async function uploadToJudge0(languageId, code, stdin, expectedOutput) {
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
      await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
      continue;
    }
    if (statusCode === 2) {
      await new Promise(resolve => setTimeout(resolve, GET_SUBMISSION_DELAY));
      continue;
    }

    // Return the final submission result
    return submission;
  }
};