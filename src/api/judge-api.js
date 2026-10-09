import { auth } from '../firebase/firebase';
import { JUDGE_API_URL, JUDGE_POLL_DELAY } from '../constants';

async function request(path, options = {}) {
  const headers = { ...options.headers };
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(JUDGE_API_URL + path, { ...options, headers });
  } catch (error) {
    console.error('Judge API request failed:', error);
    throw new Error('Unable to reach the judge server. Please try again.');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || `The judge server responded with status ${response.status}.`);
  }
  return body;
}

async function waitForResult(id, onProgress) {
  while (true) {
    const submission = await request(`/submissions/${id}`);

    if (onProgress && submission.result) {
      onProgress(submission.result);
    }
    if (submission.status === 'done') {
      return submission.result;
    }
    if (submission.status === 'error') {
      throw new Error('The judge server failed to process your code.');
    }

    await new Promise(resolve => setTimeout(resolve, JUDGE_POLL_DELAY));
  }
}

export async function runCode(code, stdin) {
  const { id } = await request('/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'run', language: 'python3', code, stdin })
  });

  return waitForResult(id);
}

// onProgress gets the result so far ({ total, cases }) on every poll.
export async function submitCode(code, cpid, onProgress) {
  const { id } = await request('/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'submit', language: 'python3', code, cpid })
  });

  return waitForResult(id, onProgress);
}
