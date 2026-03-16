'use client'

import { useState, useRef } from 'react'
import { Camera, X, Check, Loader2, Sparkles } from 'lucide-react'
import { extractProductDetailsWithAI } from '@/app/actions/ai-product'
import { createProduct } from '@/app/actions/products'
import toast from 'react-hot-toast'

interface AIScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AIScannerModal({ isOpen, onClose, onSuccess }: AIScannerModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [status, setStatus] = useState<'idle' | 'scanning' | 'reviewing' | 'saving'>('idle')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [extractedData, setExtractedData] = useState<any>(null)

    if (!isOpen) return null

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Create preview
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64Data = reader.result as string
            setPreviewUrl(base64Data)
            setStatus('scanning')
            
            try {
                const response = await extractProductDetailsWithAI(base64Data)
                if (response.success && response.data) {
                    setExtractedData({
                        name: response.data.productName || '',
                        description: response.data.description || '',
                        price: response.data.mrp || 0,
                        mrp: response.data.mrp || 0,
                        stock: 10,
                        weight: response.data.netQuantityOrWeight || '',
                        expiryDate: response.data.expiryDate || '',
                        manufacturerDetails: response.data.manufacturerDetails || '',
                        countryOfOrigin: response.data.countryOfOrigin || '',
                        ageGroup: response.data.ageGroup || '',
                        material: response.data.material || '',
                    })
                    setStatus('reviewing')
                    toast.success('AI successfully extracted product data!')
                } else {
                    toast.error(response.error || 'Failed to extract data')
                    setStatus('idle')
                }
            } catch (err: any) {
                toast.error('AI Error: ' + err.message)
                setStatus('idle')
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('saving')
        
        try {
            const formData = new FormData()
            formData.append('name', extractedData.name)
            
            const complianceMarkup = `\n\n---\n**Compliance Details:**\n- **Manufacturer:** ${extractedData.manufacturerDetails || 'N/A'}\n- **Country of Origin:** ${extractedData.countryOfOrigin || 'N/A'}\n- **Age Group:** ${extractedData.ageGroup || 'N/A'}\n- **Material:** ${extractedData.material || 'N/A'}\n- **Expiry Date:** ${extractedData.expiryDate || 'N/A'}`
            
            formData.append('description', `${extractedData.description}${complianceMarkup}`)
            formData.append('price', extractedData.price.toString())
            formData.append('mrp', extractedData.mrp.toString())
            formData.append('stock', extractedData.stock.toString())
            formData.append('images', JSON.stringify([]))
            formData.append('tags', extractedData.weight ? `Weight: ${extractedData.weight}` : '')
            formData.append('category_id', '') // Default or unassigned
            formData.append('is_enabled', 'true')
            formData.append('display_section', 'none')
            formData.append('badge', 'none')

            const result = await createProduct(formData)
            if (result.success) {
                toast.success('Product created successfully!')
                onSuccess()
                onClose()
            } else {
                toast.error(result.message || 'Failed to create product')
                setStatus('reviewing')
            }
        } catch (error: any) {
            toast.error(error.message)
            setStatus('reviewing')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Sparkles size={18} /></div>
                        <h2 className="text-lg font-bold text-slate-800">Add by AI Scanner</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {status === 'idle' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <Camera size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Scan Box Packaging</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Snap a photo of the product packaging. Our AI will automatically extract the name, MRP, weight, and expiry date.</p>
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleCapture}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Camera size={18} /> Open Scanner
                            </button>
                        </div>
                    )}

                    {status === 'scanning' && (
                        <div className="text-center py-10">
                            <div className="relative w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden border-2 border-indigo-200">
                                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/40 to-transparent translate-y-full animate-[scan_2s_ease-in-out_infinite]" />
                            </div>
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800">AI is Analyzing...</h3>
                            <p className="text-sm text-slate-500">Extracting product details</p>
                        </div>
                    )}

                    {(status === 'reviewing' || status === 'saving') && extractedData && (
                        <form onSubmit={handleSave} className="space-y-4 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl mb-6">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm">Extraction Complete</h4>
                                    <p className="text-xs text-green-600 mt-0.5">Please review the details before saving.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Product Name</label>
                                    <input type="text" value={extractedData.name} onChange={e => setExtractedData({...extractedData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">MRP (₹)</label>
                                        <input type="number" value={extractedData.mrp} onChange={e => setExtractedData({...extractedData, mrp: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Selling Price (₹)</label>
                                        <input type="number" value={extractedData.price} onChange={e => setExtractedData({...extractedData, price: Number(e.target.value)})} className="w-full border-indigo-300 bg-indigo-50 rounded-lg px-3 py-2 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Weight/Vol</label>
                                        <input type="text" value={extractedData.weight} onChange={e => setExtractedData({...extractedData, weight: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Expiry</label>
                                        <input type="text" value={extractedData.expiryDate} onChange={e => setExtractedData({...extractedData, expiryDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Manufacturer Details</label>
                                    <input type="text" value={extractedData.manufacturerDetails || ''} onChange={e => setExtractedData({...extractedData, manufacturerDetails: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Made by Acme Corp, Address..." />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                                    <textarea value={extractedData.description} onChange={e => setExtractedData({...extractedData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-indigo-100 outline-none" />
                                </div>
                            </div>

                            <button type="submit" disabled={status === 'saving'} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                {status === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                Confirm & Save Product
                            </button>
                        </form>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    50% { transform: translateY(100%); }
                    100% { transform: translateY(-100%); }
                }
            `}</style>
        </div>
    )
}
