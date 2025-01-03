export function gradeResponse(
  expected: string,
  actual: string,
  graderType: string
): number {
  if (graderType === "exactMatch") {
    return actual.trim() === expected.trim() ? 1 : 0;
  }

  if (graderType === "partialMatch") {
    // simple example: check if expected is contained in actual
    return actual.includes(expected) ? 1 : 0;
  }

  // fallback
  return 0;
}
