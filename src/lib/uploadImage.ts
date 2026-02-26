'use server'

import cloudinary from '@/lib/cloudinary'

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export async function uploadImage(formData: FormData, folder: string = 'ambajizon/uploads'): Promise<UploadResult> {
    try {
        const file = formData.get('file') as File
        if (!file) throw new Error('No file uploaded')

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new Promise((resolve) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        resolve({ success: false, error: 'Upload failed' })
                        return
                    }

                    if (!result) {
                        resolve({ success: false, error: 'Upload failed - no result' })
                        return
                    }

                    resolve({ success: true, url: result.secure_url })
                }
            ).end(buffer)
        })
    } catch (error) {
        console.error('Upload action error:', error)
        return { success: false, error: 'Upload failed' }
    }
}
