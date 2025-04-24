"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth"; // Adjust path as needed
import Image from "next/image";

const ProfilePage: React.FC = () => {
  const { user } = useAuth(); // Get user from context
  interface ImageData {
    id: string;
    imageUrl: string;
    altText?: string;
    uploadedAt: Timestamp | string;
    userId: string;
    [key: string]: string | Timestamp | undefined;
  }

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImages = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const imagesRef = collection(db, "images");
        const q = query(imagesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedImages = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            imageUrl: data.imageUrl as string,
            altText: data.altText as string | undefined,
            uploadedAt: data.uploadedAt as Timestamp,
            userId: data.userId as string,
            ...data,
          };
        });
        setImages(fetchedImages as ImageData[]);
      } catch (err) {
        console.error("Error fetching user images:", err);
        setError("Failed to load uploaded images.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserImages();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">Please log in to view your profile.</div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Loading profile data...</div>;
  }

  const formatDate = (dateValue: Timestamp | string) => {
    if (!dateValue) return "N/A";
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue.toDate();
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16">
      <div className="flex flex-col md:flex-row items-center mb-8">
        <div className="w-32 h-32 rounded-full mr-0 md:mr-8 mb-4 md:mb-0 bg-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold border-4 border-gray-200">
          {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">
            {user.username || "User Name"}
          </h1>
          <p className="text-gray-600 mb-4">
            {user.email || "No email provided"}
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
            Edit Profile
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Uploaded Images</h2>
        {error && (
          <p className="text-red-500 mb-4">Error loading images: {error}</p>
        )}
        {!error && images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <Image
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    `Uploaded image by ${user.displayName || "user"}`
                  }
                  width={300}
                  height={192}
                  className="w-full h-48 object-cover group-hover:opacity-80 transition duration-200"
                  onError={(e) => {
                    // Handle error with placeholder
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.src =
                      "https://via.placeholder.com/300x200?text=Image+Error";
                  }}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Uploaded: {formatDate(image.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <p className="text-gray-500">
              You haven&apos;t uploaded any images yet.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
