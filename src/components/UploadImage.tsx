"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";

const UploadComponent = () => {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      await addDoc(collection(db, "images"), {
        userId: user.uid,
        cloudinaryPublicId: data.public_id,
        imageUrl: data.secure_url,
        uploadDate: new Date(),
        isDone: false,
      });

      setImageUrl(data.secure_url);
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
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={uploadImage}>Upload</button>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Uploaded Image"
          width={300}
          height={300}
          style={{ objectFit: "cover" }}
        />
      )}
    </div>
  );
};

export default UploadComponent;
