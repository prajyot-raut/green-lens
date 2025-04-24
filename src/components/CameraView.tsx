"use client";

import { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa"; // Import camera icon

interface CameraViewProps {
  onCapture: (blob: Blob, width: number, height: number) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    if (!isCameraActive) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert("Camera not initialized.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
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
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline // Add playsInline for better mobile compatibility
        muted
        className="w-full h-full object-cover" // Ensure video covers the container
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <button
          className="bg-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
          onClick={takePicture}
          aria-label="Take Picture"
        >
          <FaCamera size={30} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default CameraView;
