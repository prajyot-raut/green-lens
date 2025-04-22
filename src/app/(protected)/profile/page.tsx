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

const ProfilePage: React.FC = () => {
  const { user } = useAuth(); // Get user from context
  const [images, setImages] = useState<UserImage[]>([]);
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
        const fetchedImages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setImages(fetchedImages);
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
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-12 flex flex-col items-center md:flex-row md:items-start bg-white p-6 rounded-lg shadow-md">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={`${user.displayName || "User"}'s profile`}
            className="w-32 h-32 rounded-full mr-0 md:mr-8 mb-4 md:mb-0 object-cover border-4 border-gray-200"
          />
        )}
        {!user.photoURL && (
          <div className="w-32 h-32 rounded-full mr-0 md:mr-8 mb-4 md:mb-0 bg-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold border-4 border-gray-200">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">
            {user.displayName || "User Name"}
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
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <img
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    `Uploaded image by ${user.displayName || "user"}`
                  }
                  className="w-full h-48 object-cover group-hover:opacity-80 transition duration-200"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/300x200?text=Image+Error")
                  }
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
              You haven't uploaded any images yet.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
