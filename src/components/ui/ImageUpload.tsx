import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void
  value?: string | null // URL for existing image
  error?: string
  className?: string
  maxSizeMB?: number
}

export function ImageUpload({
  onFileSelect,
  value,
  error,
  className,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image size must be less than ${maxSizeMB}MB.`)
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    onFileSelect(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cleanup object URL on unmount or previewUrl change
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Update preview if value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setPreviewUrl(value)
    }
  }, [value])

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative w-full h-48 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : error
              ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800',
          previewUrl ? 'border-transparent bg-slate-100 dark:bg-slate-800' : ''
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Change
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={removeImage}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <span className="material-symbols-outlined text-[40px] text-slate-400 mb-2">
              cloud_upload
            </span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Click or drag image to upload
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SVG, PNG, JPG or GIF (max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
