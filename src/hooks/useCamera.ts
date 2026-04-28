import { useState, useCallback } from 'react';

interface UseCameraReturn {
  captureImage: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to handle camera access and image capture.
 * Returns a promise that resolves with a base64 encoded image string or null if cancelled.
 */
export function useCamera(): UseCameraReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureImage = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      // Request access to the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create a video element to display the camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', ''); // Required for iOS Safari

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Return a promise that resolves when the user clicks to capture
      const imageDataUrl = await new Promise<string | null>((resolve) => {
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Create a button to capture the image
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capture';
        captureButton.style.position = 'absolute';
        captureButton.style.top = '10px';
        captureButton.style.right = '10px';
        captureButton.style.padding = '8px 16px';
        captureButton.style.background = 'rgba(0,0,0,0.5)';
        captureButton.style.color = 'white';
        captureButton.style.border = 'none';
        captureButton.style.borderRadius = '4px';
        captureButton.style.cursor = 'pointer';

        // Create a container for the video and button
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.appendChild(video);
        container.appendChild(captureButton);

        // Add container to body
        document.body.appendChild(container);

        // Handle capture button click
        captureButton.onclick = () => {
          // Draw video frame to canvas
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
          // Clean up
          document.body.removeChild(container);
          stream.getTracks().forEach((track) => track.stop());
        };

        // Handle cancel (e.g., pressing Escape)
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            resolve(null);
            document.body.removeChild(container);
            stream.getTracks().forEach((track) => track.stop());
          }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup on resolve
        const cleanup = () => {
          document.removeEventListener('keydown', handleKeyDown);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        // If the promise is resolved by something else, clean up
        // We'll rely on the click and escape handlers for now.
      });

      return imageDataUrl;
    } catch (err) {
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { captureImage, isLoading, error };
}