'use client'

import { useState } from 'react'
import { UploadCloud, Loader2, X } from 'lucide-react'
import { uploadImage } from '@/lib/uploadImage'
import Image from 'next/image'

interface ImageUploadProps {
    label: string
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
    folder?: string
}

export default function ImageUpload({ label, value, onChange, disabled, folder = 'ambajizon/general' }: ImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Simple validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File too large (max 5MB)')
            return
        }

        setLoading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadImage(formData, folder)

        if (result.success && result.url) {
            onChange(result.url)
        } else {
            setError(result.error || 'Upload failed')
        }

        setLoading(false)
    }

    const handleRemove = () => {
        onChange('')
    }

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>

            <div className="relative flex min-h-[150px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : value ? (
                    <div className="relative h-full w-full p-2">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md">
                            {/* Using standard img tag for simplicity if domain not allowed in next.config, 
                     but updated to Next/Image if domain is available */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
                        </div>
                        <button
                            onClick={handleRemove}
                            disabled={disabled}
                            type="button"
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6">
                            <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                            <span className="mt-1 text-xs text-gray-400">SVG, PNG, JPG or GIF (max 5MB)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={disabled}
                            />
                        </label>
                    </>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
