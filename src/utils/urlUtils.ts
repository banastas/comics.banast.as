// src/utils/urlUtils.ts
/**
 * Utility functions for handling virtual box names in URLs
 */

/**
 * Convert a virtual box name to a URL-safe slug
 * @param boxName - The original virtual box name
 * @returns URL-safe string
 */
export const createVirtualBoxSlug = (boxName: string): string => {
  return encodeURIComponent(
    boxName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')       // Remove non-alphanumeric chars except hyphens
      .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '')             // Remove leading hyphens
      .replace(/-+$/, '')             // Remove trailing hyphens
  );
};

/**
 * Convert a URL slug back to the original virtual box name
 * @param slug - The URL slug
 * @param allBoxNames - Array of all virtual box names to match against
 * @returns The original virtual box name or null if not found
 */
export const getVirtualBoxFromSlug = (slug: string, allBoxNames: string[]): string | null => {
  const decodedSlug = decodeURIComponent(slug);
  
  // First try direct match (for simple names)
  const directMatch = allBoxNames.find(name => 
    name.toLowerCase().replace(/\s+/g, '-') === decodedSlug.toLowerCase()
  );
  
  if (directMatch) return directMatch;
  
  // Then try fuzzy matching for more complex transformations
  const normalizedSlug = decodedSlug.toLowerCase().replace(/-/g, ' ');
  const fuzzyMatch = allBoxNames.find(name => 
    name.toLowerCase() === normalizedSlug
  );
  
  return fuzzyMatch || null;
};

/**
 * Generate virtual box URLs
 */
export const generateVirtualBoxUrl = (boxName: string): string => {
  return `/virtual-box/${createVirtualBoxSlug(boxName)}`;
};

/**
 * Check if a virtual box name needs URL encoding
 */
export const needsUrlEncoding = (boxName: string): boolean => {
  return boxName !== encodeURIComponent(boxName);
};

// Example usage:
// "My Comic Box #1" -> "my-comic-box-1"
// "Long-Box Collection" -> "long-box-collection"
// "Box with Special Characters!@#" -> "box-with-special-characters"