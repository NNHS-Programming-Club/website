const JUDGE_API_URL = process.env.REACT_APP_JUDGE_API_URL;
const JUDGE_POLL_DELAY = 500;

const monacoLanguageMap = {
  python3: 'python',
  cpp: 'cpp',
  java: 'java'
}

export {JUDGE_API_URL, JUDGE_POLL_DELAY, monacoLanguageMap };
