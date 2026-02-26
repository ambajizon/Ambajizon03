'use client'

import { useState } from 'react'
import { UploadCloud, Loader2, X, Plus } from 'lucide-react'
import { uploadImage } from '@/lib/uploadImage'
import Image from 'next/image'

interface MultiImageUploadProps {
    label: string
    values: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
    folder?: string
    maxFiles?: number
}

export default function MultiImageUpload({
    label,
    values = [],
    onChange,
    disabled,
    folder = 'ambajizon/products',
    maxFiles = 5
}: MultiImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (values.length + files.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} images.`)
            return
        }

        setLoading(true)
        setError('')

        const newUrls: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                // Simple validation
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    setError('File too large (max 5MB)')
                    continue
                }

                const formData = new FormData()
                formData.append('file', file)

                const result = await uploadImage(formData, folder)

                if (result.success && result.url) {
                    newUrls.push(result.url)
                }
            }

            onChange([...values, ...newUrls])
        } catch (err) {
            setError('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = (urlToRemove: string) => {
        onChange(values.filter((url) => url !== urlToRemove))
    }

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {values.map((url, index) => (
                    <div key={url + index} className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Product" className="h-full w-full object-cover" />
                        <button
                            onClick={() => handleRemove(url)}
                            disabled={disabled}
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {values.length < maxFiles && (
                    <label className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        ) : (
                            <>
                                <Plus className="h-6 w-6 text-gray-400" />
                                <span className="mt-1 text-xs text-gray-500">Add Image</span>
                            </>
                        )}
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={disabled || loading}
                        />
                    </label>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-400">
                {values.length} / {maxFiles} images
            </p>
        </div>
    )
}
