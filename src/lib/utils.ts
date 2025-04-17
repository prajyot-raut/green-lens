function mapAuthErrorMessage(code: string): string {
  const errorMessages: { [key: string]: string } = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-disabled": "This user account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/email-already-in-use": "This email is already in use.",
    "auth/invalid-credential": "The provided credential is invalid.",
    "auth/auth/missing-password": "Password is required.",
  };

  return (
    errorMessages[code] || "An unexpected error occurred. Please try again."
  );
}

export { mapAuthErrorMessage };
