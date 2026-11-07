/**
 * Next.js 16 surfaces `console.error(Error)` as the red overlay even when the
 * promise was caught. Log permission issues as strings via warn instead.
 */

export function firestoreErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function isPermissionDenied(error: unknown): boolean {
  return firestoreErrorCode(error) === "permission-denied";
}

export function firestoreErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function logFirestoreIssue(context: string, error: unknown): void {
  const code = firestoreErrorCode(error) ?? "unknown";
  console.warn(`[${context}] ${code}: ${firestoreErrorMessage(error)}`);
}
