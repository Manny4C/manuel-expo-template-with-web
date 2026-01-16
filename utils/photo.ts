import { CameraCapturedPicture } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase";

export async function resizePhoto(photo: CameraCapturedPicture) {
  const resizedPhoto = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ resize: { width: 700 } }], // Change width as needed (auto-scales height)
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
  );
  return resizedPhoto;
}

export async function uploadToFirebase(
  photo: CameraCapturedPicture | ImageManipulator.ImageResult,
  fileName: string,
) {
  if (!photo) return;

  try {
    // Fetch the file from URI and convert to Blob
    const response = await fetch(photo.uri);
    const blob = await response.blob();

    // Define storage reference
    const imageRef = storageRef(storage, fileName);

    // Upload the image
    return uploadBytes(imageRef, blob);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

export async function getPhotoUri(photoId: string) {
  try {
    return await getDownloadURL(storageRef(storage, photoId));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function uploadPhoto(
  userId: string,
  photoUri: string
): Promise<{ photoId: string; photoUri: string }> {
  const photoId = `${userId}-${Date.now()}.jpeg`;

  // Fetch the file from URI and convert to Blob
  const response = await fetch(photoUri);
  const blob = await response.blob();

  // Define storage reference
  const imageRef = storageRef(storage, photoId);

  // Upload the image
  await uploadBytes(imageRef, blob);

  // Get the download URL
  const downloadUrl = await getDownloadURL(imageRef);

  return { photoId, photoUri: downloadUrl };
}
