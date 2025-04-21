"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";
import CameraView from "./CameraView";
import useLocation from "@/hooks/useLocation";

const UploadImage = () => {
  const { user } = useAuth();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const { latitude, longitude, error: locationError } = useLocation();

  const handleImageCapture = (blob: Blob, width: number, height: number) => {
    setImageBlob(blob);
    setImgWidth(width);
    setImgHeight(height);
  };

  const uploadImage = async () => {
    if (!imageBlob) {
      alert("No image to upload.");
      return;
    }

    if (locationError) {
      alert("Error getting location: " + locationError);
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
        <CameraView onCapture={handleImageCapture} />
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

            <div className="absolute bottom-1 left-1/2 flex gap-2 -translate-x-1/2">
              <input
                type="text"
                placeholder="Add info"
                className="shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={() => {
                  setImageBlob(null);
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Retake
              </button>
              <button
                onClick={uploadImage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
