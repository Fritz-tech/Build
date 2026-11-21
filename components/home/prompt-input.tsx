"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Sparkles,
  Loader2,
} from "lucide-react";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "video" | "document" | "other";
}

interface PromptInputProps {
  onSubmit: (prompt: string, files: AttachedFile[]) => void;
  /** Controlled external prompt value (e.g. from suggestion chips). */
  externalPrompt?: string;
  /** Called after the external prompt is consumed so the parent can clear it. */
  onExternalPromptConsumed?: () => void;
  /** When true, shows a loading spinner and disables input. */
  isLoading?: boolean;
}

function getFileType(file: File): AttachedFile["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type.includes("pdf") ||
    file.type.includes("document") ||
    file.type.includes("text")
  )
    return "document";
  return "other";
}

function getFileIcon(type: AttachedFile["type"]) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    case "video":
      return <Film className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PromptInput({
  onSubmit,
  externalPrompt,
  onExternalPromptConsumed,
  isLoading = false,
}: PromptInputProps) {
  const [prompt, setPrompt] = React.useState("");
  const [files, setFiles] = React.useState<AttachedFile[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Accept external prompt (from suggestion chips)
  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
      onExternalPromptConsumed?.();
      // Focus the textarea so the user can edit or just hit Enter
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [externalPrompt, onExternalPromptConsumed]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected) return;

      const newFiles: AttachedFile[] = Array.from(selected).map((file) => {
        const type = getFileType(file);
        const preview =
          type === "image" ? URL.createObjectURL(file) : undefined;
        return {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          preview,
          type,
        };
      });

      setFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    },
    []
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() && files.length === 0) return;
    onSubmit(prompt, files);
    setPrompt("");
    setFiles([]);
  }, [prompt, files, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative rounded-2xl border bg-white shadow-sm transition-all duration-200
          ${
            isFocused
              ? "border-violet-300 shadow-lg shadow-violet-100/50 ring-4 ring-violet-50"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }
        `}
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-4">
            {files.map((f) => (
              <div
                key={f.id}
                className="group relative flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
              >
                {f.preview ? (
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-400 border border-gray-100">
                    {getFileIcon(f.type)}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-[120px] text-xs font-medium text-gray-700">
                    {f.file.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatFileSize(f.file.size)}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe the app you want to build..."
          rows={3}
          className="w-full resize-none border-0 bg-transparent px-4 pt-4 pb-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <span className="text-[11px] text-gray-300 ml-1">
              Attach files, images, or documents
            </span>
          </div>

          <Button
            size="default"
            className={`
              rounded-xl px-4 text-sm font-semibold transition-all duration-200
              ${
                (prompt.trim() || files.length > 0) && !isLoading
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
            disabled={(!prompt.trim() && files.length === 0) || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Building…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Build
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-gray-400">
        Press{" "}
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200">
          Enter
        </kbd>{" "}
        to send ·{" "}
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200">
          Shift + Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
