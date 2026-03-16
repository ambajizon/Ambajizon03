'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, Camera } from 'lucide-react'
import { extractProductDetailsWithAI } from '@/app/actions/ai-product'
import toast from 'react-hot-toast'

interface AIFillButtonProps {
    onDataReceived: (data: any) => void
    className?: string
}

export default function AIFillButton({ onDataReceived, className = "" }: AIFillButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isScanning, setIsScanning] = useState(false)

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsScanning(true)
        const toastId = toast.loading('AI is scanning packaging...')
        
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Data = reader.result as string
                
                const response = await extractProductDetailsWithAI(base64Data)
                if (response.success && response.data) {
                    onDataReceived(response.data)
                    toast.success('Product details extracted successfully!', { id: toastId })
                } else {
                    toast.error(response.error || 'Failed to extract data', { id: toastId })
                }
                setIsScanning(false)
                if (fileInputRef.current) fileInputRef.current.value = '' // Reset input
            }
            reader.readAsDataURL(file)
        } catch (err: any) {
            toast.error('AI Error: ' + err.message, { id: toastId })
            setIsScanning(false)
        }
    }

    return (
        <div className={`relative ${className}`}>
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleCapture}
            />
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
                {isScanning ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Camera size={14} />
                        Auto-Fill with AI
                    </>
                )}
            </button>
        </div>
    )
}
