
/**
 * Simple utility to generate unique IDs without external dependencies
 */
export const generateId = (): string => {
  // Generate a timestamp component
  const timestamp = Date.now().toString(36);
  
  // Generate a random component
  const randomStr = Math.random().toString(36).substring(2, 10);
  
  // Combine them for a unique ID
  return `${timestamp}-${randomStr}`;
};
