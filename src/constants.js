const JUDGE_API_URL = 'http://localhost:8080';
const JUDGE_POLL_DELAY = 500;

const monacoLanguageMap = {
  python3: 'python',
  cpp: 'cpp',
  java: 'java'
}

// Languages the judge can run; the others are only listed in the selector.
const SUPPORTED_LANGUAGES = ['python3'];

export {JUDGE_API_URL, JUDGE_POLL_DELAY, monacoLanguageMap, SUPPORTED_LANGUAGES };
