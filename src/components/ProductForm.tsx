'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories, getSubcategories, createProduct, updateProduct, createCategory, type Category, type Subcategory, type Product } from '@/app/actions/products'
import MultiImageUpload from '@/components/MultiImageUpload'
import ImageCropUpload from '@/components/ImageCropUpload'
import { Loader2, ArrowLeft, Check, Package, DollarSign, ListTree, Eye, Plus, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ProductFormProps {
    initialData?: Product
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])

    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(!initialData)
    const [step, setStep] = useState(1)

    // New Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryImage, setNewCategoryImage] = useState('')
    const [creatingCategory, setCreatingCategory] = useState(false)

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        images: initialData?.images || [] as string[],
        price: initialData?.price?.toString() || '',
        mrp: initialData?.mrp?.toString() || '',
        stock: initialData?.stock?.toString() || '1',
        tags: initialData?.tags?.join(', ') || '',
        category_id: initialData?.category_id || '',
        subcategory_id: initialData?.subcategory_id || '',
        badge: initialData?.badge || 'none',
        display_section: initialData?.display_section || 'none',
        is_enabled: initialData !== undefined ? initialData.is_enabled : true
    })

    const loadDeps = async () => {
        const [cats, subs] = await Promise.all([getCategories(), getSubcategories()])
        setCategories(cats)
        setSubcategories(subs)
        setLoading(false)
    }

    useEffect(() => {
        loadDeps()
    }, [])

    useEffect(() => {
        if (formData.category_id) {
            setFilteredSubcategories(subcategories.filter(s => s.category_id === formData.category_id))
        } else {
            setFilteredSubcategories([])
        }
    }, [formData.category_id, subcategories])

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName) return
        setCreatingCategory(true)

        const data = new FormData()
        data.append('name', newCategoryName)
        if (newCategoryImage) {
            data.append('image_url', newCategoryImage)
        }
        data.append('sort_order', '0')
        data.append('is_enabled', 'true')

        const result = await createCategory(data)
        if (result.success && result.category) {
            await loadDeps()
            setFormData(prev => ({ ...prev, category_id: result.category.id }))
            setIsCategoryModalOpen(false)
            setNewCategoryName('')
            setNewCategoryImage('')
        } else {
            alert(result.message || 'Failed to create category')
        }
        setCreatingCategory(false)
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!formData.name || !formData.category_id || !formData.price) {
            alert('Please fill in required fields: Name, Category, Price')
            return
        }

        if (parseInt(formData.stock) < 1) {
            alert('Stock must be at least 1')
            return
        }

        setSaving(true)
        const data = new FormData()
        data.append('name', formData.name)
        data.append('description', formData.description)
        data.append('images', JSON.stringify(formData.images))
        data.append('price', formData.price)
        data.append('mrp', formData.mrp)
        data.append('stock', formData.stock)
        data.append('tags', formData.tags)
        data.append('category_id', formData.category_id)
        if (formData.subcategory_id) data.append('subcategory_id', formData.subcategory_id)
        data.append('badge', formData.badge)
        data.append('display_section', formData.display_section)
        data.append('is_enabled', formData.is_enabled.toString())

        let result
        if (initialData) {
            result = await updateProduct(initialData.id, data)
        } else {
            result = await createProduct(data)
        }

        setSaving(false)

        if (result.success) {
            router.push('/dashboard/products')
            router.refresh()
        } else {
            alert(result.message)
        }
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 4))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>

    const renderProgressBar = () => (
        <div className="bg-white px-4 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between relative shadow-sm z-30 sticky top-0 md:top-0 rounded-b-[24px] mb-6">
            <div className="absolute top-1/2 left-10 md:left-14 right-10 md:right-14 h-1.5 bg-gray-100 -z-10 -translate-y-1/2 rounded-full" />
            <div
                className="absolute top-1/2 left-10 md:left-14 h-1.5 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[
                { s: 1, icon: <Package size={16} strokeWidth={2.5} />, label: 'Info' },
                { s: 2, icon: <DollarSign size={16} strokeWidth={2.5} />, label: 'Pricing' },
                { s: 3, icon: <ListTree size={16} strokeWidth={2.5} />, label: 'Category' },
                { s: 4, icon: <Eye size={16} strokeWidth={2.5} />, label: 'Visibility' },
            ].map(({ s, icon, label }) => (
                <div key={s} onClick={() => setStep(s)} className={`flex flex-col items-center gap-2 cursor-pointer transition-colors ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-[14px] transition-all duration-300 ${step > s ? 'bg-primary text-white border-2 border-primary shadow-[0_4px_12px_rgba(26,35,126,0.3)]' : step === s ? 'bg-white text-primary border-2 border-primary ring-4 ring-primary/10 shadow-sm' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                        {step > s ? <Check size={20} strokeWidth={3} /> : icon}
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">{label}</span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto pb-24 relative">
            {/* INLINE CATEGORY MODAL */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <ListTree size={24} className="text-primary" />
                                Create New Category
                            </h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-100 p-2 rounded-full hover:bg-gray-50 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCategory} className="p-6 space-y-6">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Category Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="e.g. Traditional Wear"
                                />
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <ImageCropUpload
                                    label="Category Thumbnail"
                                    aspectRatio={1}
                                    recommendedSize="500x500px (1:1 Ratio)"
                                    value={newCategoryImage}
                                    onChange={(url) => setNewCategoryImage(url)}
                                    folder="ambajizon/categories"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-6 pt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="flex-1 max-w-[120px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={creatingCategory}
                                    disabled={creatingCategory || !newCategoryName}
                                    className="flex-1 shadow-sm"
                                >
                                    Save & Select
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 px-4 py-3 md:pt-6 pb-2">
                <Link href="/dashboard/products" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-[24px] md:text-[28px] font-black text-gray-900 tracking-tight leading-none">
                    {initialData ? 'Edit Product' : 'Add Product'}
                </h1>
            </div>

            {renderProgressBar()}

            <div className="px-4">
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                    {/* Step 1: Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-[18px] font-black text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="e.g. Premium Silk Saree"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm resize-none"
                                    placeholder="Product details, material, care instructions..."
                                />
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Images</label>
                                <MultiImageUpload
                                    label="Upload up to 5 images"
                                    values={formData.images}
                                    onChange={urls => setFormData({ ...formData, images: urls })}
                                    folder="ambajizon/products"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-[18px] font-black text-gray-900 border-b border-gray-100 pb-3">Pricing & Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Selling Price (₹) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-[16px] pl-8 pr-4 h-[52px] text-[15px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Original MRP (₹)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.mrp}
                                            onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-[16px] pl-8 pr-4 h-[52px] text-[15px] font-bold text-gray-500 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    {formData.price && formData.mrp && parseFloat(formData.price) < parseFloat(formData.mrp) && (
                                        <p className="text-[11px] font-bold text-success mt-2 uppercase tracking-wide">
                                            {Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)}% Discount Will Be Shown
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Stock Quantity <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Category */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-[18px] font-black text-gray-900 border-b border-gray-100 pb-3">Organization</h2>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">Category <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="text-primary hover:text-blue-700 text-[12px] font-bold flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md transition-colors"
                                    >
                                        <Plus size={14} strokeWidth={3} /> Create New Category
                                    </button>
                                </div>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-bold text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer appearance-none"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Subcategory</label>
                                <select
                                    value={formData.subcategory_id}
                                    onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-bold text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={!formData.category_id}
                                >
                                    <option value="">None</option>
                                    {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="Comma separated (e.g. winter, new)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Visibility */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-[18px] font-black text-gray-900 border-b border-gray-100 pb-3">Visibility & Status</h2>

                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-[16px] cursor-pointer" onClick={() => setFormData({ ...formData, is_enabled: !formData.is_enabled })}>
                                <div>
                                    <span className="text-[15px] font-bold text-gray-900 block">Product Enabled</span>
                                    <span className="text-[13px] text-gray-500 font-medium">Visible to customers in the catalog</span>
                                </div>
                                <div className={`relative inline-flex h-7 w-[50px] shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${formData.is_enabled ? 'bg-success' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${formData.is_enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Highlight Badge</label>
                                    <select
                                        value={formData.badge}
                                        onChange={e => setFormData({ ...formData, badge: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-bold text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer appearance-none"
                                    >
                                        <option value="none">None</option>
                                        <option value="new">New Arrival</option>
                                        <option value="hot">Trending / Hot</option>
                                        <option value="sale">On Sale</option>
                                        <option value="limited">Limited Edition</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Home Display Section</label>
                                    <select
                                        value={formData.display_section}
                                        onChange={e => setFormData({ ...formData, display_section: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 h-[52px] text-[15px] font-bold text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer appearance-none"
                                    >
                                        <option value="none">None (Catalog Only)</option>
                                        <option value="home">Featured Home</option>
                                        <option value="flash_sale">Flash Sale</option>
                                        <option value="sales_zone">Sales Zone</option>
                                        <option value="exclusive">Exclusive Collection</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="flex gap-3 justify-between mt-6">
                    {step > 1 ? (
                        <Button type="button" variant="secondary" onClick={prevStep} className="h-[52px] w-[120px] rounded-[16px] text-[15px]">
                            Back
                        </Button>
                    ) : (
                        <Link href="/dashboard/products" className="w-[120px]">
                            <Button type="button" variant="secondary" className="h-[52px] w-full rounded-[16px] text-[15px]">
                                Cancel
                            </Button>
                        </Link>
                    )}

                    {step < 4 ? (
                        <Button type="button" variant="primary" onClick={nextStep} className="h-[52px] flex-1 md:w-[200px] md:flex-none rounded-[16px] text-[15px] flex items-center gap-1.5 shadow-sm">
                            Next Step <ChevronRight size={18} strokeWidth={3} />
                        </Button>
                    ) : (
                        <Button type="button" variant="primary" isLoading={saving} onClick={handleSubmit} className="h-[52px] flex-1 md:w-[240px] md:flex-none rounded-[16px] text-[15px] shadow-sm bg-gradient-to-r from-primary to-blue-700 border-none relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            {initialData ? 'Update Product' : 'Create Product'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
