"use server"

import { getServerSession } from "next-auth"
import cloudinary from "@/lib/cloudinary"
import { authOptions } from "@/lib/auth"

interface CloudinaryUploadResult {
	secure_url: string
	public_id: string
}

export async function uploadImageToCloudinary(formData: FormData) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return { success: false as const, message: "Authentication required", url: null as string | null }
		}

		const file = formData.get("file") as File | null
		if (!file) {
			return { success: false as const, message: "No file provided", url: null as string | null }
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
		if (!validTypes.includes(file.type)) {
			return {
				success: false as const,
				message: "Invalid file type. Please upload JPG, PNG, or WebP images.",
				url: null as string | null,
			}
		}

		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			return {
				success: false as const,
				message: "File size too large. Please upload images smaller than 5MB.",
				url: null as string | null,
			}
		}

		const buffer = Buffer.from(await file.arrayBuffer())

		const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: "tipmark/profile-pictures",
					transformation: [
						{ width: 500, height: 500, crop: "fill", gravity: "face" },
						{ quality: "auto:good" },
						{ format: "auto" },
					],
					timeout: 60000,
				},
				(error, result) => {
					if (error) {
						console.error("Cloudinary upload error:", error)
						reject(error)
					} else if (result) {
						resolve(result as CloudinaryUploadResult)
					} else {
						reject(new Error("Upload failed - no result returned"))
					}
				},
			)
			uploadStream.end(buffer)
		})

		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(
				() => reject(new Error("Upload timeout — try a smaller image")),
				90000,
			)
		})

		const result = await Promise.race([uploadPromise, timeoutPromise])

		return {
			success: true as const,
			message: "Image uploaded successfully",
			url: result.secure_url,
			publicId: result.public_id,
		}
	} catch (error) {
		console.error("Error uploading image:", error)
		return {
			success: false as const,
			message: "Failed to upload image. Please try again.",
			url: null as string | null,
		}
	}
}

export async function deleteImageFromCloudinary(publicId: string) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return { success: false as const, message: "Authentication required" }
		}

		await cloudinary.uploader.destroy(publicId)
		return { success: true as const, message: "Image deleted successfully" }
	} catch (error) {
		console.error("Error deleting image:", error)
		return { success: false as const, message: "Failed to delete image" }
	}
}
