import { fileRegistry } from './tiptap-file-registry';

interface PreparedContent {
  content: string;
  files: File[];
}

/**
 * Prepares Tiptap HTML content for a single-request transactional upload.
 * 
 * Instead of uploading images immediately, it collects all local files (blob URLs)
 * and replaces them with placeholders that the backend will resolve.
 * 
 * @param html Original Tiptap HTML content
 * @returns Object containing the placeholder-replaced HTML and the array of files to upload
 */
export function prepareTiptapContent(html: string): PreparedContent {
  if (!html) return { content: html, files: [] };

  // Find all <img> tags with blob: sources
  const blobUrlRegex = /src="(blob:[^"]+)"/g;
  const matches = [...html.matchAll(blobUrlRegex)];

  if (matches.length === 0) return { content: html, files: [] };

  const files: File[] = [];
  const processedBlobUrls = new Set<string>();
  let updatedHtml = html;

  matches.forEach((match) => {
    const blobUrl = match[1];
    
    // Avoid processing the same blob URL multiple times (e.g. if the same image is inserted twice)
    if (processedBlobUrls.has(blobUrl)) return;
    
    const file = fileRegistry.getFile(blobUrl);
    if (file) {
      const placeholder = `__IMAGE_ID_${files.length}__`;
      files.push(file);
      processedBlobUrls.add(blobUrl);
      
      // Replace ALL occurrences of this blob URL with the indexed placeholder
      updatedHtml = updatedHtml.replaceAll(blobUrl, placeholder);
    }
  });

  return { content: updatedHtml, files };
}
