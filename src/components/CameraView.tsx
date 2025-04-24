"use client";

import { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa"; // Import camera icon
import { MdErrorOutline } from "react-icons/md"; // Import error icon

interface CameraViewProps {
  onCapture: (blob: Blob, width: number, height: number) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null); // State for camera errors

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true; // Flag to check if component is still mounted

    const startCamera = async () => {
      setCameraError(null); // Reset error on attempt
      try {
        // Ensure we are in a secure context (HTTPS or localhost)
        if (
          !(
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
          )
        ) {
          throw new Error(
            "Camera access requires a secure connection (HTTPS)."
          );
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Prefer back camera first
          audio: false,
        });

        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for the video metadata to load to ensure dimensions are available
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) {
              setIsCameraActive(true);
            }
          };
        } else if (stream) {
          // If component unmounted before ref was ready, stop the stream
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera.";
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            errorMessage = "Camera permission denied. Please allow access.";
          } else if (err.name === "NotFoundError") {
            errorMessage = "No camera found on this device.";
          } else {
            errorMessage = `Error: ${err.message}`;
          }
        }
        if (isMounted) {
          setCameraError(errorMessage);
          setIsCameraActive(false);
        }
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      isMounted = false; // Mark component as unmounted
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Release the stream from the video element
      }
      setIsCameraActive(false); // Reset state on unmount
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert("Camera not initialized.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Ensure video dimensions are valid before capturing
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("Camera is not ready or video dimensions are invalid.");
      console.warn(
        "Attempted capture with invalid video dimensions:",
        video.videoWidth,
        video.videoHeight
      );
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          onCapture(blob, video.videoWidth, video.videoHeight);
        }
      }, "image/png");
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {" "}
      {/* Add background color */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-20 p-4 text-center">
          <MdErrorOutline size={40} className="text-red-500 mb-3" />
          <p className="text-white font-semibold">Camera Error</p>
          <p className="text-gray-300 text-sm mt-1">{cameraError}</p>
          <p className="text-gray-400 text-xs mt-3">
            Please check browser permissions and ensure you are using HTTPS.
          </p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline // Add playsInline for better mobile compatibility
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isCameraActive ? "opacity-100" : "opacity-0" // Fade in video when active
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />
      {/* Only show button if camera is active and no error */}
      {isCameraActive && !cameraError && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
          <button
            className="bg-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center active:bg-gray-200" // Add active state
            onClick={takePicture}
            aria-label="Take Picture"
          >
            <FaCamera size={30} className="text-gray-700" />
          </button>
        </div>
      )}
      {/* Optional: Loading indicator while camera starts */}
      {!isCameraActive && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <p className="text-white text-lg">Starting Camera...</p>
        </div>
      )}
    </div>
  );
};

export default CameraView;
