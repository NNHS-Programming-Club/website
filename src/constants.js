const GET_SUBMISSION_DELAY = 500;

const codeLanguageMap = {
  cpp: 54, // (GCC 9.2.0)
  python: 92, // (Python 3.11.2)
  java: 91 // (JDK 17.0.6)
}

const monacoLanguageMap = {
  '92': 'python',
  '54': 'cpp',
  '91': 'java'
}

export { GET_SUBMISSION_DELAY, codeLanguageMap, monacoLanguageMap };