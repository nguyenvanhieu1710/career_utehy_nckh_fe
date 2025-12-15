export type FileType = "users" | "categories" | "jobs" | "companies" | "cv";

export interface UploadedFileInfo {
  status: "success";
  file_url: string;
  file_path: string;
  relative_path: string;
  original_name: string;
  file_size: number;
  file_type: FileType;
  upload_date: string;
}

export interface FailedFileInfo {
  filename: string;
  error: string;
}

export interface SingleUploadResponse {
  status: "success";
  file_url: string;
  file_path: string;
  relative_path: string;
  original_name: string;
  file_size: number;
  file_type: FileType;
  upload_date: string;
}

export interface MultipleUploadResponse {
  status: "success" | "partial_success";
  uploaded_files: UploadedFileInfo[];
  failed_files: FailedFileInfo[];
  total_uploaded: number;
  total_failed: number;
}

export interface FileInfoResponse {
  file_path: string;
  file_url: string;
  relative_path: string;
  file_size: number;
  created_at: string;
  modified_at: string;
  exists: boolean;
}

export interface DeleteFileResponse {
  status: "success" | "error";
  message: string;
  file_path?: string;
}

export interface UploadConfig {
  max_file_size: number;
  max_files_per_request: number;
  allowed_extensions: string[];
  allowed_mime_types: string[];
  valid_file_types: FileType[];
  image_optimization: {
    enabled: boolean;
    max_width: number;
    quality: number;
  };
}

// Upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

// Upload state management
export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress;
  error?: string;
  result?: SingleUploadResponse | MultipleUploadResponse;
}

// File validation
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Upload options
export interface UploadOptions {
  fileType: FileType;
  optimize?: boolean;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: SingleUploadResponse) => void;
  onError?: (error: string) => void;
}

// Multiple upload options
export interface MultipleUploadOptions {
  fileType: FileType;
  optimize?: boolean;
  maxFiles?: number;
  onProgress?: (progress: UploadProgress) => void;
  onFileSuccess?: (result: UploadedFileInfo, index: number) => void;
  onFileError?: (error: FailedFileInfo, index: number) => void;
  onComplete?: (result: MultipleUploadResponse) => void;
}

// File preview
export interface FilePreview {
  file: File;
  url: string;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: UploadProgress;
  result?: UploadedFileInfo;
  error?: string;
}

// Drag and drop
export interface DragDropState {
  isDragOver: boolean;
  isDragActive: boolean;
  files: File[];
}

// Image cropping (for future use)
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropOptions {
  aspect?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  cropArea?: CropArea;
}

// Upload error types
export type UploadErrorType =
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "UPLOAD_FAILED"
  | "NETWORK_ERROR"
  | "PERMISSION_DENIED"
  | "FILE_NOT_FOUND"
  | "VALIDATION_ERROR";

export interface UploadError {
  type: UploadErrorType;
  message: string;
  details?: Record<string, unknown>;
}

// Utility types
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface BaseUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

// Component prop types
export interface FileUploadProps extends BaseUploadProps {
  fileType: FileType;
  onUpload?: (result: SingleUploadResponse) => void;
  onError?: (error: UploadError) => void;
  showProgress?: boolean;
  showPreview?: boolean;
}

export interface MultipleFileUploadProps extends BaseUploadProps {
  fileType: FileType;
  onUpload?: (result: MultipleUploadResponse) => void;
  onError?: (error: UploadError) => void;
  showProgress?: boolean;
  showPreview?: boolean;
}

export interface DragDropUploadProps extends BaseUploadProps {
  fileType: FileType;
  onDrop?: (files: File[]) => void;
  onUpload?: (result: SingleUploadResponse | MultipleUploadResponse) => void;
  onError?: (error: UploadError) => void;
  children?: React.ReactNode;
}
