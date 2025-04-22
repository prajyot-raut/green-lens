"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, GeoPoint, Timestamp } from "firebase/firestore";
import Image from "next/image";
import CameraView from "./CameraView";
import useLocation from "@/hooks/useLocation";

const UploadImage = () => {
  const { user } = useAuth();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const { latitude, longitude, error: locationError } = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageCapture = (blob: Blob, width: number, height: number) => {
    setImageBlob(blob);
    setImgWidth(width);
    setImgHeight(height);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const uploadImage = async () => {
    if (!imageBlob || isUploading) {
      return;
    }

    if (locationError) {
      alert("Error getting location: " + locationError);
      return;
    }

    if (!latitude || !longitude) {
      alert("Could not get valid location coordinates.");
      return;
    }

    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", imageBlob, "capture.png");

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);

          if (data.error) {
            throw new Error(
              data.error.message || "Upload API returned an error."
            );
          }

          const coordinates = new GeoPoint(latitude, longitude);
          const timestamp = Timestamp.now();

          await addDoc(collection(db, "images"), {
            userId: user.uid,
            cloudinaryPublicId: data.public_id,
            imageUrl: data.secure_url,
            timestamp: timestamp,
            coordinates: coordinates,
            isDone: false,
          });

          alert("Image uploaded successfully!");
          setImageBlob(null);
        } catch (error: any) {
          console.error(
            "Error processing upload response or saving to Firestore:",
            error
          );
          alert(`Error after upload: ${error.message || "Unknown error"}`);
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      } else {
        console.error("Upload failed:", xhr.statusText, xhr.responseText);
        alert(
          `Upload failed: ${xhr.statusText || `Status code ${xhr.status}`}`
        );
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    xhr.onerror = () => {
      console.error("Upload failed: Network error.");
      alert("Upload failed due to a network error.");
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.open("POST", "/api/image/upload", true);
    xhr.send(formData);
  };

  return (
    <div className="absolute h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      {!imageBlob && (
        <div className="absolute">
          <CameraView onCapture={handleImageCapture} />
        </div>
      )}

      <div
        className={`absolute h-screen top-0 w-full ${
          imageBlob ? "block" : "hidden"
        }`}
      >
        {imageBlob && (
          <div className="relative h-full w-full">
            <Image
              key={imageBlob.size}
              src={URL.createObjectURL(imageBlob)}
              alt="Captured"
              className="object-cover h-screen w-full"
              width={imgWidth}
              height={imgHeight}
              priority
            />

            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10">
                <div className="w-3/4 max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-white text-lg font-semibold mt-2">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {!isUploading && (
              <div className="absolute bottom-4 left-1/2 flex gap-4 -translate-x-1/2 z-20">
                <button
                  onClick={() => {
                    setImageBlob(null);
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline text-lg shadow-lg"
                  disabled={isUploading}
                >
                  Retake
                </button>
                <button
                  onClick={uploadImage}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline text-lg shadow-lg disabled:opacity-50"
                  disabled={isUploading}
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
