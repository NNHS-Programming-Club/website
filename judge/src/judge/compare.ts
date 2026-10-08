// Ignores trailing whitespace on each line and blank lines at the end.
export function outputsMatch(actual: string, expected: string): boolean {
  const a = normalize(actual);
  const b = normalize(expected);
  return a.length === b.length && a.every((line, i) => line === b[i]);
}

function normalize(text: string): string[] {
  const lines = text.split(/\r\n|\r|\n/).map((line) => line.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}
