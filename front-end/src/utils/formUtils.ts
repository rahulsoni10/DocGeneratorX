export interface FormValues {
  prompt: string;
}

export const validateForm = (_: FormValues, templateName: string) => {
  const errors: { prompt?: string; templateName?: string } = {};

  if (!templateName) {
    errors.templateName = "Select a template";
  }

  return errors;
};

export const createFormData = (
  prompt: string,
  architectureFiles: File[],
  templateName: string,
  promptFiles: File[]
) => {
  const formData = new FormData();
  formData.append("prompt", prompt.trim());
  architectureFiles.forEach((file) => formData.append("architecture", file));
  formData.append("template", templateName);
  promptFiles.forEach((file) => formData.append("prompt", file));
  return formData;
};

export const validateArchitectureFiles = (files: File[]) => {
  const validExtensions = [".png", ".svg", ".jpg", ".jpeg"];
  return files.filter(
    (file) =>
      !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
};
