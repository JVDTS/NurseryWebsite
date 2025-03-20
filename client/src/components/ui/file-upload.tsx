import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

interface FileUploadProps extends Omit<DropzoneOptions, "children"> {
  className?: string;
  label?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  showPreview?: boolean;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      label,
      value,
      onChange,
      error,
      showPreview = true,
      ...props
    },
    ref
  ) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      multiple: false,
      ...props,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && onChange) {
          onChange(file);
        }
      },
    });

    // Create a preview URL for the file
    const previewUrl = value ? URL.createObjectURL(value) : null;

    // Clean up preview URL when component unmounts or file changes
    React.useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    const isPdf = value?.type === "application/pdf";

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div
          {...getRootProps()}
          ref={ref}
          className={cn(
            "border-input bg-background flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-sm text-muted-foreground transition hover:bg-primary/5",
            isDragActive && "border-primary/50 bg-primary/5",
            error && "border-destructive",
            className
          )}
        >
          <input {...getInputProps()} />
          {value ? (
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-sm text-primary">File selected</span>
              <span className="text-xs truncate max-w-full">{value.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span>{" "}
                or drag and drop
              </div>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {showPreview && value && isPdf && previewUrl && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
            <object
              data={previewUrl}
              type="application/pdf"
              className="w-full h-40 border rounded"
            >
              <p>
                Your browser does not support PDF preview.{" "}
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Download PDF
                </a>
              </p>
            </object>
          </div>
        )}
        {showPreview && value && !isPdf && previewUrl && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Preview not available for this file type</p>
            <p className="text-xs">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Download File
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";