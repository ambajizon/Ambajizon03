'use client'

import { useState } from 'react'
import { UploadCloud, X, Loader2, FileSpreadsheet, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'
import { bulkInsertProducts } from '@/app/actions/products'
import toast from 'react-hot-toast'

interface BulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success'>('idle')
    const [parsedData, setParsedData] = useState<any[]>([])

    if (!isOpen) return null

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setStatus('parsing')
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const mappedProducts = results.data.map((row: any) => ({
                    name: row.Name || row.name || 'Unnamed Product',
                    description: row.Description || row.description || '',
                    price: parseFloat(row.Price || row.price || '0'),
                    mrp: parseFloat(row.MRP || row.mrp || row.Price || row['Original Price'] || '0'),
                    stock: parseInt(row.Stock || row.stock || row.Quantity || '10'),
                    category_id: null, // Left null inherently unless they match exact UUIDs
                    subcategory_id: null,
                    images: [],
                    tags: row.Tags ? row.Tags.split(',').map((t: string) => t.trim()) : [],
                    badge: 'none',
                    display_section: 'none',
                    is_enabled: true
                }))
                
                setParsedData(mappedProducts)
                setStatus('idle') // Show preview before confirm
            },
            error: (error) => {
                toast.error('Failed to parse CSV: ' + error.message)
                setStatus('idle')
            }
        })
    }

    const handleConfirmUpload = async () => {
        if (parsedData.length === 0) return
        setStatus('uploading')

        try {
            const result = await bulkInsertProducts(parsedData)
            if (result.success) {
                toast.success(result.message)
                setStatus('success')
                setTimeout(() => {
                    onSuccess()
                    onClose()
                }, 1500)
            } else {
                toast.error(result.message)
                setStatus('idle')
            }
        } catch (error: any) {
            toast.error('Upload Error: ' + error.message)
            setStatus('idle')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><FileSpreadsheet size={18} /></div>
                        <h2 className="text-lg font-bold text-slate-800">Bulk Product Upload</h2>
                    </div>
                    {status !== 'success' && (
                        <button onClick={onClose} disabled={status === 'uploading'} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-6 overflow-y-auto">
                    {status === 'success' ? (
                        <div className="text-center py-12 animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Upload Successful!</h3>
                            <p className="text-slate-500 text-sm">{parsedData.length} products have been added to your catalog.</p>
                        </div>
                    ) : (
                        <>
                            {parsedData.length === 0 ? (
                                <div className="text-center py-6">
                                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 transition-colors hover:border-green-300 hover:bg-green-50/50 relative group">
                                        <input 
                                            type="file" 
                                            accept=".csv" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                            onChange={handleFileUpload}
                                            disabled={status === 'parsing'}
                                        />
                                        <div className="w-16 h-16 bg-white text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            {status === 'parsing' ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1">Upload CSV Target</h3>
                                        <p className="text-slate-500 text-xs max-w-[200px] mx-auto">Drop your CSV file here, or click to browse files. Must include Name and Price columns.</p>
                                    </div>
                                    <a href="#" className="inline-block mt-4 text-xs font-bold text-green-600 hover:underline">Download Sample CSV Template</a>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-bottom-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-slate-800">Preview Data</h3>
                                        <span className="bg-green-100 text-green-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">{parsedData.length} Rows</span>
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 max-h-[200px] overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 shadow-sm">
                                                <tr>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Product Name</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Price</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {parsedData.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[150px]">{row.name}</td>
                                                        <td className="px-3 py-2 text-slate-600">₹{row.price}</td>
                                                        <td className="px-3 py-2 text-slate-600">{row.stock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {parsedData.length > 5 && (
                                            <div className="bg-slate-50 text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                                                + {parsedData.length - 5} MORE ROWS
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setParsedData([])} 
                                            disabled={status === 'uploading'}
                                            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleConfirmUpload} 
                                            disabled={status === 'uploading'}
                                            className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            {status === 'uploading' ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                            {status === 'uploading' ? 'Importing Data...' : 'Confirm Upload'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
