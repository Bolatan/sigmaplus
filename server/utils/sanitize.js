export const sanitizeFilename = (filename) => {
  // This regex removes any characters that are not letters, numbers, spaces, or hyphens.
  return filename.replace(/[^a-zA-Z0-9 -]/g, '');
};
