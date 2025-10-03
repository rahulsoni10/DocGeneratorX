// GSOP Package File Names Constants
export const GSOP_2028_FILES = {
  FILE_1: "Best Practice 2032 \u201CTemplate for IT Infrastructure Service Specification\u201D.docx",
  FILE_2: "Best Practice 2062 \u201CTemplate for IT Infrastructure Service Qualification Report\u201D.docx",
  FILE_3: "Template 3 - Additional Service Document.docx",
  FILE_4: "Template 4 - Process Flow Template.docx",
  FILE_5: "Template 5 - Quality Assurance Document.docx"
} as const;

export const GSOP_2003_FILES = {
  FILE_1: "GSOP 2003 Template 1.docx",
  FILE_2: "GSOP 2003 Template 2.docx",
  FILE_3: "GSOP 2003 Template 3.docx",
  FILE_4: "GSOP 2003 Template 4.docx"
} as const;

// Mapping package names to their available files
export const GSOP_PACKAGE_FILES = {
  "GSOP_2028": GSOP_2028_FILES,
  "GSOP_2003": GSOP_2003_FILES
} as const;

// Type for package names
export type GSOPPackageName = keyof typeof GSOP_PACKAGE_FILES;

// Helper function to get file list for a package
export const getFilesForPackage = (packageName: GSOPPackageName): string[] => {
  return Object.values(GSOP_PACKAGE_FILES[packageName]);
};

// Helper function to get file display names (without .docx extension)
export const getFileDisplayNames = (packageName: GSOPPackageName): { value: string; label: string }[] => {
  const files = getFilesForPackage(packageName);
  return files.map((file, index) => ({
    value: file,
    label: `${index + 1}. ${file.replace('.docx', '')}`
  }));
};