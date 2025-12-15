"use client";

import { useState, useCallback } from "react";
import { uploadService } from "@/services/upload";
import {
  FileType,
  SingleUploadResponse,
  MultipleUploadResponse,
  UploadProgress,
  UploadState,
  FileValidationResult,
  UploadOptions,
  MultipleUploadOptions,
} from "@/types/upload";

interface UseUploadOptions {
  fileType: FileType;
  onSuccess?: (result: SingleUploadResponse | MultipleUploadResponse) => void;
  onError?: (error: string) => void;
  autoUpload?: boolean;
}

export function useUpload(options: UseUploadOptions) {
  const { fileType, onSuccess, onError, autoUpload = false } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationResults, setValidationResults] = useState<
    FileValidationResult[]
  >([]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
    });
    setSelectedFiles([]);
    setValidationResults([]);
  }, []);

  // Validate files
  const validateFiles = useCallback((files: File[]): FileValidationResult[] => {
    const results = files.map((file) => uploadService.validateFile(file));
    setValidationResults(results);
    return results;
  }, []);

  // Upload single file
  const uploadSingle = useCallback(
    async (
      file?: File,
      uploadOptions?: Partial<UploadOptions>
    ): Promise<SingleUploadResponse | null> => {
      const targetFile = file || selectedFiles[0];
      if (!targetFile) {
        const error = "No file selected";
        onError?.(error);
        return null;
      }

      setState((prev) => ({ ...prev, isUploading: true, error: undefined }));

      try {
        const result = await uploadService.uploadSingle(targetFile, fileType, {
          ...uploadOptions,
          onProgress: (progress: UploadProgress) => {
            setState((prev) => ({ ...prev, progress }));
            uploadOptions?.onProgress?.(progress);
          },
        });

        setState((prev) => ({
          ...prev,
          isUploading: false,
          result,
          progress: {
            loaded: result.file_size,
            total: result.file_size,
            percentage: 100,
          },
        }));

        onSuccess?.(result);
        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
        return null;
      }
    },
    [selectedFiles, fileType, onSuccess, onError]
  );

  // Upload multiple files
  const uploadMultiple = useCallback(
    async (
      files?: File[],
      uploadOptions?: Partial<MultipleUploadOptions>
    ): Promise<MultipleUploadResponse | null> => {
      const targetFiles = files || selectedFiles;
      if (targetFiles.length === 0) {
        const error = "No files selected";
        onError?.(error);
        return null;
      }

      setState((prev) => ({ ...prev, isUploading: true, error: undefined }));

      try {
        const result = await uploadService.uploadMultiple(
          targetFiles,
          fileType,
          {
            ...uploadOptions,
            onProgress: (progress: UploadProgress) => {
              setState((prev) => ({ ...prev, progress }));
              uploadOptions?.onProgress?.(progress);
            },
          }
        );

        setState((prev) => ({
          ...prev,
          isUploading: false,
          result,
          progress: {
            loaded: result.uploaded_files.reduce(
              (sum, f) => sum + f.file_size,
              0
            ),
            total: result.uploaded_files.reduce(
              (sum, f) => sum + f.file_size,
              0
            ),
            percentage: 100,
          },
        }));

        onSuccess?.(result);
        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
        return null;
      }
    },
    [selectedFiles, fileType, onSuccess, onError]
  );

  // Select files
  const selectFiles = useCallback(
    (files: File[]) => {
      setSelectedFiles(files);
      const results = validateFiles(files);

      // Auto upload if enabled and all files are valid
      if (autoUpload && results.every((r) => r.isValid)) {
        if (files.length === 1) {
          uploadSingle(files[0]);
        } else {
          uploadMultiple(files);
        }
      }
    },
    [autoUpload, validateFiles, uploadSingle, uploadMultiple]
  );

  // Get file preview URL
  const getPreviewUrl = useCallback((file: File): string => {
    return uploadService.createPreviewUrl(file);
  }, []);

  // Revoke preview URL
  const revokePreviewUrl = useCallback((url: string): void => {
    uploadService.revokePreviewUrl(url);
  }, []);

  return {
    // State
    ...state,
    selectedFiles,
    validationResults,

    // Actions
    selectFiles,
    uploadSingle,
    uploadMultiple,
    reset,
    validateFiles,

    // Utilities
    getPreviewUrl,
    revokePreviewUrl,

    // Computed
    hasValidFiles:
      validationResults.length > 0 && validationResults.every((r) => r.isValid),
    hasErrors: validationResults.some((r) => !r.isValid),
    canUpload:
      !state.isUploading &&
      selectedFiles.length > 0 &&
      validationResults.every((r) => r.isValid),
  };
}

// Hook for user avatar upload specifically
export function useUserAvatarUpload(userId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(
    async (file: File, optimize: boolean = true) => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      try {
        // Import userAPI dynamically to avoid circular dependency
        const { userAPI } = await import("@/services/user");

        const result = await userAPI.uploadAvatar(userId, file, optimize);
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        return result.data;
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { detail?: string } } }).response
                ?.data?.detail ||
              (error instanceof Error ? error.message : "Upload failed")
            : error instanceof Error
            ? error.message
            : "Upload failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [userId]
  );

  const removeAvatar = useCallback(async () => {
    setIsUploading(true);
    setError(null);

    try {
      const { userAPI } = await import("@/services/user");
      const result = await userAPI.removeAvatar(userId);
      return result.data;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail ||
            (error instanceof Error ? error.message : "Remove failed")
          : error instanceof Error
          ? error.message
          : "Remove failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [userId]);

  const validateFile = useCallback(async (file: File) => {
    const { userAPI } = await import("@/services/user");
    return userAPI.validateAvatarFile(file);
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadAvatar,
    removeAvatar,
    validateFile,
    reset: () => {
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    },
  };
}

// Hook for category avatar upload specifically
export function useCategoryAvatarUpload(categoryId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(
    async (file: File, optimize: boolean = true) => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      try {
        // Import categoryAPI dynamically to avoid circular dependency
        const { categoryAPI } = await import("@/services/category");

        const result = await categoryAPI.uploadAvatar(
          categoryId,
          file,
          optimize
        );
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        return result.data;
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { detail?: string } } }).response
                ?.data?.detail ||
              (error instanceof Error ? error.message : "Upload failed")
            : error instanceof Error
            ? error.message
            : "Upload failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [categoryId]
  );

  const removeAvatar = useCallback(async () => {
    setIsUploading(true);
    setError(null);

    try {
      const { categoryAPI } = await import("@/services/category");
      const result = await categoryAPI.removeAvatar(categoryId);
      return result.data;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail ||
            (error instanceof Error ? error.message : "Remove failed")
          : error instanceof Error
          ? error.message
          : "Remove failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [categoryId]);

  const validateFile = useCallback(async (file: File) => {
    const { categoryAPI } = await import("@/services/category");
    return categoryAPI.validateAvatarFile(file);
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadAvatar,
    removeAvatar,
    validateFile,
    reset: () => {
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    },
  };
}
