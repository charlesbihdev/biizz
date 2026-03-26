/**
 * A simple registry to manage the mapping between temporary blob URLs 
 * and the actual File objects in a Tiptap editor session.
 */
class FileRegistry {
  private registry = new Map<string, File>();

  /**
   * Adds a file to the registry and returns a temporary blob URL.
   */
  addFile(file: File): string {
    const blobUrl = URL.createObjectURL(file);
    this.registry.set(blobUrl, file);
    return blobUrl;
  }

  /**
   * Retrieves a File object by its temporary blob URL.
   */
  getFile(blobUrl: string): File | undefined {
    return this.registry.get(blobUrl);
  }

  /**
   * Checks if a URL is a temporary blob URL from this registry.
   */
  isBlobUrl(url: string): boolean {
    return url.startsWith('blob:') && this.registry.has(url);
  }

  /**
   * Removes a file from the registry and revokes its blob URL.
   */
  removeFile(blobUrl: string): void {
    if (this.registry.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl);
      this.registry.delete(blobUrl);
    }
  }

  /**
   * Clears the entire registry.
   */
  clear(): void {
    this.registry.forEach((_, blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });
    this.registry.clear();
  }
}

export const fileRegistry = new FileRegistry();
