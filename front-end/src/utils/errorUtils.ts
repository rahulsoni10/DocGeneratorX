export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to complete operation";
};
