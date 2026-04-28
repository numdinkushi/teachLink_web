'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useCamera } from '@/hooks/useCamera';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  initialImageUrl?: string;
}

export default function ImageUploader({ onImageSelect, initialImageUrl }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { captureImage, isLoading: isCapturing, error: captureError } = useCamera();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    setCameraError(null);
    try {
      const imageDataUrl = await captureImage();
      if (imageDataUrl) {
        // Convert base64 to File object
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `camera-image-${Date.now()}.png`, { type: 'image/png' });
        
        setPreviewUrl(imageDataUrl);
        onImageSelect(file);
      }
    } catch (err) {
      setCameraError('Failed to capture image');
      console.error('Camera error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile preview"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={previewUrl.startsWith('data:')}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
          <span className="text-white opacity-0 hover:opacity-100 transition-opacity text-sm">
            Change Photo
          </span>
        </div>
      </div>
      
      {/* Camera Button */}
      <button
        onClick={handleCameraClick}
        disabled={isCapturing || isCameraLoading}
        className={`mt-2 flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-blue-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {isCapturing ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16l-1.5-1.5"></path>
            <path d="M12 8l1.5 1.5"></path>
          </svg>
        )}
      </button>
      
      {cameraError && (
        <p className="mt-1 text-sm text-red-600">{cameraError}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <p className="mt-2 text-sm text-gray-500">Click to upload a new profile photo</p>
    </div>
  );
}
