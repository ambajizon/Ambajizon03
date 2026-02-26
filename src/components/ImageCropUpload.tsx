'use client'

import React, { useState, useRef } from 'react'
import ReactCrop, { type Crop, type PixelCrop, type PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { UploadCloud, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { uploadImage } from '@/lib/uploadImage'

interface ImageCropUploadProps {
    label: string
    aspectRatio: number
    value?: string | null
    onChange: (url: string) => void
    disabled?: boolean
    folder?: string
    recommendedSize?: string
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function ImageCropUpload({
    label,
    aspectRatio,
    value,
    onChange,
    disabled = false,
    folder = 'ambajizon/general',
    recommendedSize
}: ImageCropUploadProps) {
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined)
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '')
                setIsModalOpen(true)
            })
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, aspectRatio))
    }

    const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        canvas.width = crop.width * scaleX
        canvas.height = crop.height * scaleY
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return null
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height,
        )

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob)
                },
                'image/jpeg',
                1
            )
        })
    }

    const handleUploadCroppedImage = async () => {
        if (!completedCrop || !imgRef.current) return

        setIsUploading(true)
        setError('')

        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop)
            if (!blob) throw new Error('Failed to crop image')

            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadImage(formData, folder)

            if (result.success && result.url) {
                onChange(result.url)
                setIsModalOpen(false)
            } else {
                setError(result.error || 'Upload failed')
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setIsUploading(false)
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemove = () => {
        onChange('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {recommendedSize && <span className="text-xs text-gray-500">Recommended: {recommendedSize}</span>}
            </div>

            <div className={`relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100 ${aspectRatio === 1 ? 'min-h-[200px]' : 'min-h-[150px]'}`}>
                {isUploading && !isModalOpen ? (
                    <div className="flex flex-col items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : value && !isModalOpen ? (
                    <div className="relative h-full w-full p-4 flex items-center justify-center">
                        <div className={`relative overflow-hidden rounded-md border shadow-sm flex items-center justify-center bg-gray-200 ${aspectRatio === 1 ? 'w-32 h-32' : 'w-full aspect-[3/1]'}`}>
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={handleRemove}
                            disabled={disabled || isUploading}
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-sm hover:bg-red-600 transition-colors z-10"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-8">
                        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-blue-600 hover:underline">Click to upload</span>
                        <span className="mt-1 text-xs text-gray-400">or drag and drop</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={onSelectFile}
                            disabled={disabled || isUploading}
                        />
                    </label>
                )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

            {/* Crop Modal Overlay */}
            {isModalOpen && !!imgSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon size={20} className="text-blue-600" />
                                Crop Your {label.includes('Logo') ? 'Logo' : 'Banner'}
                            </h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 flex flex-col items-center justify-center">
                            {recommendedSize && (
                                <p className="text-sm text-gray-500 mb-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
                                    Target ratio: {aspectRatio}:1 • Recommended: {recommendedSize}
                                </p>
                            )}
                            <div className="max-w-full max-h-[50vh] overflow-hidden border-2 border-dashed border-gray-300 rounded-lg bg-black/5 shadow-inner">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(pixelCrop: PixelCrop, percentCrop: PercentCrop) => setCrop(percentCrop)}
                                    onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                                    aspect={aspectRatio}
                                    className="max-h-[50vh]"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        className="max-h-[50vh] object-contain"
                                    />
                                </ReactCrop>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 font-medium flex items-center gap-1">
                                {aspectRatio === 1 ? 'Drag handles to resize square' : 'Drag handles to resize wide banner'}
                            </p>
                        </div>

                        <div className="p-4 border-t bg-white flex justify-end gap-3 items-center">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isUploading}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Choose Different
                            </button>
                            <button
                                type="button"
                                onClick={handleUploadCroppedImage}
                                disabled={isUploading || !completedCrop?.width || !completedCrop?.height}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition active:scale-95"
                            >
                                {isUploading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                ) : (
                                    <>Use This</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
