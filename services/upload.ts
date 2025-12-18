import api from "@/cores/api";
import {
  FileType,
  SingleUploadResponse,
  MultipleUploadResponse,
  FileInfoResponse,
  DeleteFileResponse,
  UploadConfig,
  UploadProgress,
  UploadOptions,
  MultipleUploadOptions,
  FileValidationResult,
  UploadErrorType,
} from "@/types/upload";

// Custom error class
export class UploadError extends Error {
  public type: UploadErrorType;
  public details?: Record<string, unknown>;

  constructor(
    type: UploadErrorType,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "UploadError";
    this.type = type;
    this.details = details;
  }
}

export class UploadService {
  private baseURL = "/upload";

  /**
   * Upload a single file
   */
  async uploadSingle(
    file: File,
    fileType: FileType,
    options: Partial<UploadOptions> = {}
  ): Promise<SingleUploadResponse> {
    const { optimize = true, onProgress } = options;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new UploadError("VALIDATION_ERROR", validation.errors.join(", "));
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("optimize", optimize.toString());

    try {
      const response = await api.post<SingleUploadResponse>(
        `${this.baseURL}/single/${fileType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress: UploadProgress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                ),
              };
              onProgress(progress);
            }
          },
        }
      );

      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const uploadError = this.handleError(error);
      if (options.onError) {
        options.onError(uploadError.message);
      }
      throw uploadError;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    fileType: FileType,
    options: Partial<MultipleUploadOptions> = {}
  ): Promise<MultipleUploadResponse> {
    const { optimize = true, maxFiles = 10, onProgress, onComplete } = options;

    // Validate files count
    if (files.length > maxFiles) {
      throw new UploadError(
        "VALIDATION_ERROR",
        `Maximum ${maxFiles} files allowed`
      );
    }

    // Validate each file
    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new UploadError(
          "VALIDATION_ERROR",
          `${file.name}: ${validation.errors.join(", ")}`
        );
      }
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("optimize", optimize.toString());

    try {
      const response = await api.post<MultipleUploadResponse>(
        `${this.baseURL}/multiple/${fileType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress: UploadProgress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                ),
              };
              onProgress(progress);
            }
          },
        }
      );

      if (onComplete) {
        onComplete(response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const uploadError = this.handleError(error);
      throw uploadError;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<FileInfoResponse> {
    try {
      const response = await api.get<FileInfoResponse>(
        `${this.baseURL}/file-info`,
        {
          params: { file_path: filePath },
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<DeleteFileResponse> {
    try {
      const response = await api.delete<DeleteFileResponse>(
        `${this.baseURL}/file`,
        {
          params: { file_path: filePath },
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Get upload configuration
   */
  async getConfig(): Promise<UploadConfig> {
    try {
      const response = await api.get<UploadConfig>(`${this.baseURL}/config`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Serve/get file URL
   */
  getFileUrl(filePath: string): string {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

    // If it already starts with uploads/, return as is
    if (cleanPath.startsWith("uploads/")) {
      return `/${cleanPath}`;
    }

    // Otherwise, prepend uploads/
    return `/uploads/${cleanPath}`;
  }

  /**
   * Validate a single file
   */
  validateFile(file: File): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Default constraints
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File size (${this.formatFileSize(
          file.size
        )}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`
      );
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type "${
          file.type
        }" is not allowed. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    // Check file extension
    const extension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(
        `File extension must be one of: ${allowedExtensions.join(", ")}`
      );
    }

    // Warnings for large files
    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      warnings.push("Large file size may result in slower upload");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Create file preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke file preview URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Handle upload errors
   */
  private handleError(error: unknown): UploadError {
    let type: UploadErrorType = "UPLOAD_FAILED";
    let message = "Upload failed";

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status: number; data?: { detail?: string } };
      };

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        switch (status) {
          case 400:
            type = "VALIDATION_ERROR";
            message = data?.detail || "Invalid request";
            break;
          case 401:
            type = "PERMISSION_DENIED";
            message = "Authentication required";
            break;
          case 403:
            type = "PERMISSION_DENIED";
            message = "Permission denied";
            break;
          case 404:
            type = "FILE_NOT_FOUND";
            message = "File not found";
            break;
          case 413:
            type = "FILE_TOO_LARGE";
            message = "File too large";
            break;
          default:
            message = data?.detail || `Server error (${status})`;
        }
      }
    } else if (error && typeof error === "object" && "request" in error) {
      type = "NETWORK_ERROR";
      message = "Network error - please check your connection";
    } else if (error instanceof Error) {
      message = error.message || "Unknown error occurred";
    }

    return new UploadError(type, message);
  }
}

// Export singleton instance
export const uploadService = new UploadService();

// Export individual methods for convenience
export const uploadAPI = {
  single: (file: File, fileType: FileType, options?: Partial<UploadOptions>) =>
    uploadService.uploadSingle(file, fileType, options),

  multiple: (
    files: File[],
    fileType: FileType,
    options?: Partial<MultipleUploadOptions>
  ) => uploadService.uploadMultiple(files, fileType, options),

  getInfo: (filePath: string) => uploadService.getFileInfo(filePath),

  delete: (filePath: string) => uploadService.deleteFile(filePath),

  getConfig: () => uploadService.getConfig(),

  validate: (file: File) => uploadService.validateFile(file),

  getUrl: (filePath: string) => uploadService.getFileUrl(filePath),

  formatSize: (bytes: number) => uploadService.formatFileSize(bytes),

  createPreview: (file: File) => uploadService.createPreviewUrl(file),

  revokePreview: (url: string) => uploadService.revokePreviewUrl(url),
};
