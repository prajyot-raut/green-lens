"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";

const UploadImage = () => {
  const { user } = useAuth();
  //const [imageUrl, setImageUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob>();
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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

  const getLocation = async () => {
    let isSuccess = false;

    if (navigator.geolocation) {
      isSuccess = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            resolve(true);
          },
          (error) => {
            console.error("Error getting location:", error);
            alert("Error getting location: " + error.message);
            resolve(false);
          }
        );
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    return isSuccess;
  };

  const takePicture = async () => {
    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      alert("Camera not initialized.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setImgWidth(video.videoWidth);
    setImgHeight(video.videoHeight);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          setImageBlob(blob);
          const isLocationSuccess = await getLocation();

          if (!isLocationSuccess) {
            alert("Failed to get location.");
            return;
          }
        }
      }, "image/png");
    }
  };

  const uploadImage = async () => {
    if (!imageBlob) {
      alert("No image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageBlob, "capture.png");

    try {
      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!user) {
        alert("You must be logged in to upload images.");
        return;
      }

      await addDoc(collection(db, "images"), {
        userId: user.uid,
        cloudinaryPublicId: data.public_id,
        imageUrl: data.secure_url,
        uploadDate: new Date(),
        isDone: false,
        latitude: latitude,
        longitude: longitude,
      });

      //setImageUrl(data.secure_url);
      alert("Image uploaded successfully!");
    } catch (error: Error | unknown) {
      console.error("Error uploading image: ", error);
      alert(
        `Error uploading image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="absolute h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      <div className="absolute ">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-screen object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <button className="absolute bottom-1 left-1/2" onClick={takePicture}>
          Take Picture
        </button>
      </div>

      <div className="absolute h-screen top-0">
        {imageBlob && (
          <div>
            <Image
              key={imageBlob.size}
              src={URL.createObjectURL(imageBlob)}
              alt="Captured"
              className="object-cover h-screen w-full"
              width={imgWidth}
              height={imgHeight}
            />

            <div className="absolute bottom-1 left-1/2 flex gap-2">
              <button
                onClick={() => {
                  setImageBlob(undefined);
                }}
              >
                Retake
              </button>
              <button onClick={uploadImage}>Upload</button>
            </div>
          </div>
        )}
      </div>

      {/*     {imageUrl && (
        <Image
          src={imageUrl}
          alt="Uploaded Image"
          width={300}
          height={300}
          style={{ objectFit: "cover" }}
        />
      )} */}
    </div>
  );
};

export default UploadImage;
