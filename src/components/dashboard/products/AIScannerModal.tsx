'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Check, Loader2, Sparkles, Copy, RefreshCw, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { extractProductDetailsWithAI } from '@/app/actions/ai-product'
import { createProduct } from '@/app/actions/products'
import toast from 'react-hot-toast'

interface AIScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface Specifications {
    material: string
    color: string
    dimensions: string
    usage: string
    weight: string
    pack_of: string
}

// ── Image Compression (target 700 KB — base64 adds ~33% → ~950 KB on wire) ──
async function compressImage(
    file: File,
    maxSizeBytes = 716_800
): Promise<{ blob: Blob; originalMB: string; compressedMB: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const canvas = document.createElement('canvas')
            let { width, height } = img
            const maxDim = 1200
            if (width > maxDim || height > maxDim) {
                if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim }
                else { width = Math.round((width * maxDim) / height); height = maxDim }
            }
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(url)
            const originalMB = (file.size / 1_048_576).toFixed(2)
            let quality = 0.85
            const tryCompress = () => {
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Compression failed'))
                    if (blob.size <= maxSizeBytes || quality <= 0.30) {
                        resolve({ blob, originalMB, compressedMB: (blob.size / 1_048_576).toFixed(2) })
                    } else {
                        quality = parseFloat((quality - 0.05).toFixed(2))
                        tryCompress()
                    }
                }, 'image/jpeg', quality)
            }
            tryCompress()
        }
        img.onerror = () => reject(new Error('Image load failed'))
        img.src = url
    })
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonBlock({ lines = 1 }: { lines?: number }) {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded"
                    style={{ width: i === lines - 1 && lines > 1 ? '65%' : '100%' }} />
            ))}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIScannerModal({ isOpen, onClose, onSuccess }: AIScannerModalProps) {
    const galleryRef = useRef<HTMLInputElement>(null)
    const cameraRef = useRef<HTMLInputElement>(null)

    const [status, setStatus] = useState<'idle' | 'compressing' | 'converting' | 'scanning' | 'reviewing' | 'saving'>('idle')
    const [sourceModal, setSourceModal] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [currentFile, setCurrentFile] = useState<File | null>(null)
    const [compressionStats, setCompressionStats] = useState<string | null>(null)
    const [rawError, setRawError] = useState<string | null>(null)
    const [newKeyword, setNewKeyword] = useState('')

    // ── Individual editable fields ───────────────────────────────────────────
    const [productName, setProductName] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [description, setDescription] = useState('')
    const [keyFeatures, setKeyFeatures] = useState<string[]>([])
    const [specifications, setSpecifications] = useState<Specifications>({
        material: '', color: '', dimensions: '', usage: '', weight: '', pack_of: ''
    })
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])

    if (!isOpen) return null

    const isScanning = ['compressing', 'converting', 'scanning'].includes(status)
    const hasResults = status === 'reviewing' || status === 'saving'

    // ── Process image ────────────────────────────────────────────────────────
    const processImage = async (file: File) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowed.includes(file.type)) {
            toast.error('❌ Only JPG, PNG, or WebP images are allowed.')
            return
        }
        setCurrentFile(file)
        setRawError(null)
        setCompressionStats(null)
        // Instant preview
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target?.result as string)
        reader.readAsDataURL(file)

        // Compress
        setStatus('compressing')
        let compressedBlob: Blob
        try {
            const result = await compressImage(file)
            compressedBlob = result.blob
            setCompressionStats(`${result.originalMB} MB → ${result.compressedMB} MB ✅`)
        } catch (err: any) {
            toast.error('Compression failed: ' + err.message)
            setStatus('idle')
            return
        }

        // Convert to base64
        setStatus('converting')
        const compressedReader = new FileReader()
        compressedReader.onloadend = async () => {
            const dataUri = compressedReader.result as string
            setStatus('scanning')
            try {
                const response = await extractProductDetailsWithAI(dataUri)
                if (response.success && response.data) {
                    const d = response.data as any
                    setProductName(d.product_name ?? '')
                    setShortDescription(d.short_description ?? '')
                    setDescription(d.description ?? '')
                    setKeyFeatures(Array.isArray(d.key_features) ? d.key_features : [])
                    setSpecifications({
                        material: d.specifications?.material ?? 'Not specified',
                        color: d.specifications?.color ?? 'Not specified',
                        dimensions: d.specifications?.dimensions ?? 'Not specified',
                        usage: d.specifications?.usage ?? 'Not specified',
                        weight: d.specifications?.weight ?? 'Not specified',
                        pack_of: d.specifications?.pack_of ?? '1',
                    })
                    setSeoKeywords(Array.isArray(d.seo_keywords) ? d.seo_keywords : [])
                    setStatus('reviewing')
                    toast.success('✅ Scan complete!')
                } else {
                    setRawError(response.error || 'AI returned no valid data.')
                    setStatus('reviewing')
                    toast.error('AI parsing failed — review manually.')
                }
            } catch (err: any) {
                const msg = err.message || 'Scan failed'
                const userMsg = msg.includes('Body exceeded')
                    ? 'Image too large even after compression. Please use a smaller photo.'
                    : 'AI Error: ' + msg
                setRawError(userMsg)
                setStatus('reviewing')
                toast.error(userMsg)
            }
        }
        compressedReader.readAsDataURL(compressedBlob)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processImage(file)
    }, [])

    const handleRescan = () => {
        if (!currentFile) return
        setRawError(null)
        processImage(currentFile)
    }

    const handleCopyJSON = () => {
        const data = { product_name: productName, short_description: shortDescription, description, key_features: keyFeatures, specifications, seo_keywords: seoKeywords }
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        toast.success('📋 Copied JSON!')
    }

    const handleSave = async () => {
        setStatus('saving')
        try {
            const fullDesc = [
                description,
                '',
                '**Key Features:**',
                ...keyFeatures.map(f => `- ${f}`),
                '',
                `**Keywords:** ${seoKeywords.join(', ')}`
            ].join('\n')
            const formData = new FormData()
            formData.append('name', productName)
            formData.append('description', fullDesc)
            formData.append('price', '0')
            formData.append('mrp', '0')
            formData.append('stock', '10')
            formData.append('images', JSON.stringify([]))
            formData.append('tags', seoKeywords.slice(0, 5).join(','))
            formData.append('category_id', '')
            formData.append('is_enabled', 'true')
            formData.append('display_section', 'none')
            formData.append('badge', 'none')
            const result = await createProduct(formData)
            if (result.success) {
                toast.success('Product created!')
                onSuccess()
                onClose()
            } else {
                toast.error(result.message || 'Failed to create product')
                setStatus('reviewing')
            }
        } catch (err: any) {
            toast.error(err.message)
            setStatus('reviewing')
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Source choice sheet */}
            {sourceModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/45"
                    onClick={() => setSourceModal(false)}>
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-6 flex flex-col gap-3"
                        style={{ animation: 'slideUp 0.2s ease' }}
                        onClick={e => e.stopPropagation()}>
                        <p className="text-center text-sm font-semibold text-gray-500 mb-1">Add Product Image</p>
                        <button className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-indigo-50 hover:border-indigo-400 transition-colors text-left w-full"
                            onClick={() => { cameraRef.current?.click(); setSourceModal(false) }}>
                            <span className="text-3xl">📷</span>
                            <span>
                                <strong className="block text-gray-900 text-sm">Take a Photo</strong>
                                <small className="text-gray-500 text-xs">Use your device camera</small>
                            </span>
                        </button>
                        <button className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-indigo-50 hover:border-indigo-400 transition-colors text-left w-full"
                            onClick={() => { galleryRef.current?.click(); setSourceModal(false) }}>
                            <span className="text-3xl">🖼️</span>
                            <span>
                                <strong className="block text-gray-900 text-sm">Choose from Gallery</strong>
                                <small className="text-gray-500 text-xs">Pick an existing photo</small>
                            </span>
                        </button>
                        <button onClick={() => setSourceModal(false)} className="text-red-500 font-semibold text-sm py-2 mt-1">Cancel</button>
                    </div>
                </div>
            )}

            {/* Hidden inputs */}
            <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processImage(f) }} />
            <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processImage(f) }} />

            {/* Main modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>

                    {/* Header */}
                    <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Sparkles size={18} /></div>
                            <h2 className="text-base font-bold text-slate-800">AI Product Scanner</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {hasResults && (
                                <>
                                    <button onClick={handleRescan} title="Re-scan" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <RefreshCw size={15} />
                                    </button>
                                    <button onClick={handleCopyJSON} title="Copy JSON" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Copy size={15} />
                                    </button>
                                </>
                            )}
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">

                        {/* ── IDLE: Upload zone ── */}
                        {status === 'idle' && (
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                                onClick={() => setSourceModal(true)}
                                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ImagePlus size={28} />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Upload Product Image</h3>
                                <p className="text-slate-400 text-sm mb-4">Tap to choose or drag & drop<br /><span className="text-xs">JPG, PNG, WebP · Auto-compressed</span></p>
                                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                                    <ImagePlus size={14} /> Select Image
                                </div>
                            </div>
                        )}

                        {/* ── PROCESSING: Skeleton ── */}
                        {isScanning && (
                            <div className="space-y-4">
                                {previewUrl && (
                                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-slate-100" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-400/20 to-transparent animate-pulse" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                                    <Loader2 size={17} className="text-indigo-600 animate-spin shrink-0" />
                                    <p className="text-sm font-medium text-indigo-700">
                                        {status === 'compressing' ? 'Compressing image...'
                                            : status === 'converting' ? 'Preparing image...'
                                            : 'Scanning product with AI...'}
                                    </p>
                                </div>
                                <div className="border border-slate-100 rounded-xl p-4 space-y-4">
                                    {['Product Name', 'Short Description', 'Description', 'Key Features', 'Specifications', 'SEO Keywords'].map(label => (
                                        <div key={label}>
                                            <div className="h-2.5 w-20 bg-slate-200 rounded mb-2 animate-pulse" />
                                            <SkeletonBlock lines={label === 'Description' ? 3 : label === 'Key Features' ? 4 : label === 'Specifications' ? 3 : 1} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── REVIEW / SAVE: Result form ── */}
                        {hasResults && (
                            <div className="space-y-4">

                                {/* Status banner */}
                                {!rawError ? (
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                                        ✅ Scan complete — Review and edit before saving
                                    </div>
                                ) : (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                                        <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                            ❌ AI response could not be parsed. Review manually.
                                        </p>
                                        <textarea readOnly value={rawError} rows={3}
                                            className="w-full text-xs font-mono border border-red-200 rounded-lg p-2 bg-white text-red-700 resize-none" />
                                    </div>
                                )}

                                {/* Preview + compression stats */}
                                {previewUrl && (
                                    <div className="flex gap-3 items-start">
                                        <img src={previewUrl} alt="Product" className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0" />
                                        <div className="space-y-1.5">
                                            {compressionStats && (
                                                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                                                    🗜️ Compressed: <span className="font-semibold text-slate-700">{compressionStats}</span>
                                                </p>
                                            )}
                                            <button type="button" onClick={handleRescan}
                                                className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
                                                <RefreshCw size={11} /> Re-scan this image
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Product Name ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 8 }}>
                                        Product Name
                                    </p>
                                    <input
                                        value={productName}
                                        onChange={e => setProductName(e.target.value)}
                                        maxLength={100}
                                        placeholder="Product name..."
                                        style={{
                                            fontSize: 17, fontWeight: 700, color: '#111827',
                                            WebkitTextFillColor: '#111827', border: 'none',
                                            borderBottom: '2px solid #e5e7eb', borderRadius: 0,
                                            padding: '4px 0', width: '100%', background: 'transparent',
                                            lineHeight: 1.3, outline: 'none'
                                        }}
                                    />
                                    <p style={{ fontSize: 11, color: productName.length > 75 ? '#ef4444' : '#9ca3af', textAlign: 'right', marginTop: 4 }}>
                                        {productName.length}/80
                                    </p>
                                </div>

                                {/* ── Short Description ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 8 }}>
                                        Short Description
                                    </p>
                                    <input
                                        value={shortDescription}
                                        onChange={e => setShortDescription(e.target.value)}
                                        maxLength={160}
                                        placeholder="One-liner for search results..."
                                        style={{
                                            fontSize: 14, color: '#374151', fontStyle: 'italic',
                                            WebkitTextFillColor: '#374151', border: '1px solid #e5e7eb',
                                            borderRadius: 8, padding: '10px 12px', width: '100%', outline: 'none'
                                        }}
                                    />
                                    <p style={{ fontSize: 11, color: shortDescription.length > 140 ? '#ef4444' : '#9ca3af', textAlign: 'right', marginTop: 4 }}>
                                        {shortDescription.length}/150
                                    </p>
                                </div>

                                {/* ── Description ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 8 }}>
                                        Description
                                    </p>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Full product description..."
                                        style={{
                                            fontSize: 14, color: '#374151', lineHeight: 1.75,
                                            WebkitTextFillColor: '#374151', border: '1px solid #e5e7eb',
                                            borderRadius: 8, padding: '12px 14px', width: '100%',
                                            minHeight: 110, resize: 'vertical', fontFamily: 'inherit', outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* ── Key Features ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>
                                        Key Features
                                    </p>
                                    <ul className="space-y-2 list-none m-0 p-0">
                                        {keyFeatures.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2.5">
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0, display: 'inline-block' }} />
                                                <input
                                                    value={f}
                                                    onChange={e => {
                                                        const upd = [...keyFeatures]; upd[i] = e.target.value; setKeyFeatures(upd)
                                                    }}
                                                    placeholder={`Feature ${i + 1}`}
                                                    style={{
                                                        flex: 1, fontSize: 14, color: '#374151',
                                                        WebkitTextFillColor: '#374151', border: '1px solid #e5e7eb',
                                                        borderRadius: 8, padding: '7px 12px', outline: 'none'
                                                    }}
                                                />
                                                <button type="button"
                                                    onClick={() => setKeyFeatures(keyFeatures.filter((_, j) => j !== i))}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0">
                                                    <Trash2 size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button type="button"
                                        onClick={() => setKeyFeatures([...keyFeatures, ''])}
                                        style={{
                                            width: '100%', marginTop: 10, fontSize: 13, color: '#6366f1',
                                            background: 'none', border: '1.5px dashed #c7d2fe',
                                            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', textAlign: 'center'
                                        }}>
                                        + Add Feature
                                    </button>
                                </div>

                                {/* ── Specifications ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>
                                        Specifications
                                    </p>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {(Object.entries(specifications) as [keyof Specifications, string][]).map(([key, val]) => (
                                            <div key={key} className="flex flex-col gap-1">
                                                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <input
                                                    value={val}
                                                    onChange={e => setSpecifications({ ...specifications, [key]: e.target.value })}
                                                    placeholder="Not specified"
                                                    style={{
                                                        fontSize: 13, color: '#374151',
                                                        WebkitTextFillColor: '#374151', border: '1px solid #e5e7eb',
                                                        borderRadius: 6, padding: '7px 10px', outline: 'none', width: '100%'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── SEO Keywords ── */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>
                                        SEO Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {seoKeywords.map((kw, i) => (
                                            <span key={i} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                background: '#eef2ff', color: '#4338ca', fontSize: 12,
                                                fontWeight: 500, padding: '5px 10px', borderRadius: 999,
                                                border: '1px solid #c7d2fe'
                                            }}>
                                                {kw}
                                                <button onClick={() => setSeoKeywords(seoKeywords.filter((_, j) => j !== i))}
                                                    style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newKeyword}
                                            onChange={e => setNewKeyword(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    if (newKeyword.trim()) {
                                                        setSeoKeywords([...seoKeywords, newKeyword.trim().toLowerCase()])
                                                        setNewKeyword('')
                                                    }
                                                }
                                            }}
                                            placeholder="Add keyword (Enter)"
                                            style={{
                                                flex: 1, fontSize: 13, color: '#374151',
                                                WebkitTextFillColor: '#374151', border: '1px solid #e5e7eb',
                                                borderRadius: 8, padding: '7px 12px', outline: 'none'
                                            }}
                                        />
                                        <button type="button"
                                            onClick={() => {
                                                if (newKeyword.trim()) {
                                                    setSeoKeywords([...seoKeywords, newKeyword.trim().toLowerCase()])
                                                    setNewKeyword('')
                                                }
                                            }}
                                            className="px-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                                            <Plus size={15} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    {hasResults && (
                        <div className="px-5 py-4 border-t bg-slate-50 shrink-0 flex gap-2.5">
                            <button type="button" onClick={handleRescan}
                                className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-white transition-colors shrink-0">
                                <RefreshCw size={14} /> Re-scan
                            </button>
                            <button type="button" onClick={handleCopyJSON}
                                className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-white transition-colors shrink-0">
                                <Copy size={14} /> JSON
                            </button>
                            <button type="button" onClick={handleSave} disabled={status === 'saving'}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm">
                                {status === 'saving' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                {status === 'saving' ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    )
}
