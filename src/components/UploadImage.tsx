"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, GeoPoint, Timestamp } from "firebase/firestore";
import Image from "next/image";
import CameraView from "./CameraView";
import useLocation from "@/hooks/useLocation";
import { FaRedo, FaUpload } from "react-icons/fa"; // Import icons
import { useRouter } from "next/navigation";

const UploadImage = () => {
  const { user } = useAuth();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const { latitude, longitude, error: locationError } = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState(""); // State for the description
  const router = useRouter();

  const handleImageCapture = (blob: Blob, width: number, height: number) => {
    setImageBlob(blob);
    setImgWidth(width);
    setImgHeight(height);
    setIsUploading(false);
    setUploadProgress(0);
    setDescription(""); // Reset description on new capture
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
            description: description, // Add description here
            isDone: false,
          });

          setImageBlob(null);
          setIsUploading(false);
          setUploadProgress(0);
          setDescription(""); // Reset description after successful upload

          router.push("/profile");
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 overflow-hidden">
      {!imageBlob && (
        <div className="absolute inset-0">
          <CameraView onCapture={handleImageCapture} />
        </div>
      )}

      {imageBlob && (
        <div className="absolute inset-0 h-full w-full flex flex-col">
          {" "}
          {/* Use flex-col */}
          {/* Image Preview Container */}
          <div className="relative flex-grow">
            {" "}
            {/* Allow image to take up space */}
            <Image
              key={imageBlob.size}
              src={URL.createObjectURL(imageBlob)}
              alt="Captured Preview"
              className="object-cover h-full w-full"
              width={imgWidth}
              height={imgHeight}
              priority
            />
          </div>
          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-30 p-4">
              {" "}
              {/* Increase z-index */}
              <div className="w-full max-w-md bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-white text-xl font-semibold mt-3">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          {/* Controls and Description Area (only when not uploading) */}
          {!isUploading && (
            <div className="bg-white p-4 z-20 absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-4 shadow-lg rounded-t-lg">
              {" "}
              {/* Container for controls */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)..."
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isUploading}
              />
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => {
                    setImageBlob(null);
                    setIsUploading(false);
                    setUploadProgress(0);
                    setDescription(""); // Reset description on retake
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded-full focus:outline-none focus:shadow-outline shadow-lg flex items-center justify-center"
                  aria-label="Retake Picture"
                  disabled={isUploading}
                >
                  <FaRedo size={24} />
                </button>
                <button
                  onClick={uploadImage}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded-full focus:outline-none focus:shadow-outline shadow-lg flex items-center justify-center disabled:opacity-50"
                  aria-label="Upload Picture"
                  disabled={isUploading || !latitude || !longitude}
                >
                  <FaUpload size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadImage;
