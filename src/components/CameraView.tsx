"use client";

import { useState, useRef, useEffect } from "react";

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
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-screen object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <button
        className="absolute bottom-0.5 left-1/2 -translate-x-1/2"
        onClick={takePicture}
      >
        Take Picture
      </button>
    </div>
  );
};

export default CameraView;
