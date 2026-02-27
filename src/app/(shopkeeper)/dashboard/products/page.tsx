'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Filter, Package, ChevronDown, ChevronRight, X } from 'lucide-react'
import { getProducts, updateProduct, deleteProduct, getCategories, type Product, type Category } from '@/app/actions/products'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [toggling, setToggling] = useState<string | null>(null)
    const [showCategorySheet, setShowCategorySheet] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [prods, cats] = await Promise.all([getProducts(), getCategories()])
        setProducts(prods)
        setCategories(cats)
        setLoading(false)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this product?')) return
        const result = await deleteProduct(id)
        if (result.success) {
            loadData()
        } else {
            alert(result.message)
        }
    }

    const toggleStatus = async (product: Product, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setToggling(product.id)
        try {
            const updatedProducts = products.map(p =>
                p.id === product.id ? { ...p, is_enabled: !p.is_enabled } : p
            )
            setProducts(updatedProducts)

            const formData = new FormData()
            formData.append('name', product.name)
            formData.append('description', product.description || '')
            formData.append('images', JSON.stringify(product.images || []))
            formData.append('price', product.price.toString())
            if (product.mrp) formData.append('mrp', product.mrp.toString())
            formData.append('category_id', product.category_id || '')
            formData.append('subcategory_id', product.subcategory_id || '')
            formData.append('stock', product.stock.toString())
            formData.append('tags', (product.tags || []).join(','))
            formData.append('badge', product.badge || 'none')
            formData.append('display_section', product.display_section || 'none')
            formData.append('is_enabled', (!product.is_enabled).toString())

            const result = await updateProduct(product.id, formData)
            if (!result.success) {
                setProducts(products)
                alert(result.message)
            }
        } finally {
            setToggling(null)
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter
        return matchesSearch && matchesCategory
    })

    const activeCategoryName = categoryFilter === 'all'
        ? 'All Categories'
        : categories.find(c => c.id === categoryFilter)?.name || 'All Categories'

    // Pastel bg for image containers — cycles through colours
    const imageBgs = ['bg-orange-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-pink-50', 'bg-yellow-50']

    return (
        <div className="max-w-4xl mx-auto pb-28">

            {/* ═══════════════════════════════════════════════════════
                MOBILE HEADER EXTENSION — dark bg with embedded search
                Hidden on desktop (lg:hidden) because desktop uses the
                native Tailwind header above
            ════════════════════════════════════════════════════════ */}
            <div className="lg:hidden -mx-3 -mt-3 bg-indigo-900 px-4 pt-3 pb-4 mb-0">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-[16px] font-black text-white tracking-tight">
                            Products
                            <span className="ml-2 text-[11px] text-indigo-300 font-bold bg-indigo-800/60 px-1.5 py-0.5 rounded-full">{products.length}</span>
                        </h1>
                    </div>
                    <Link href="/dashboard/products/create">
                        <button className="flex items-center gap-1.5 bg-white text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm active:scale-95 transition-transform">
                            <Plus size={14} strokeWidth={3} />
                            Add
                        </button>
                    </Link>
                </div>

                {/* Embedded white search pill inside dark header */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 border-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                MOBILE CATEGORY FILTER — flat list-item row
            ═══════════════════════════════════════════ */}
            <div className="lg:hidden -mx-3 bg-white border-b border-slate-100 mb-2">
                <button
                    onClick={() => setShowCategorySheet(true)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                    <div className="flex items-center gap-2">
                        <Filter size={15} className="text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-700">{activeCategoryName}</span>
                        {categoryFilter !== 'all' && (
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">Active</span>
                        )}
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Category Bottom Sheet (mobile) */}
            {showCategorySheet && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setShowCategorySheet(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <h3 className="text-[14px] font-black text-slate-800">Filter by Category</h3>
                            <button onClick={() => setShowCategorySheet(false)} className="text-slate-400 p-1"><X size={18} /></button>
                        </div>
                        <div className="py-2 pb-8">
                            {[{ id: 'all', name: 'All Categories' }, ...categories].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategoryFilter(cat.id); setShowCategorySheet(false) }}
                                    className={`w-full px-4 py-3 text-left text-[13px] font-semibold flex items-center justify-between ${categoryFilter === cat.id ? 'text-primary bg-primary/5' : 'text-slate-700'}`}
                                >
                                    {cat.name}
                                    {categoryFilter === cat.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════
                DESKTOP: Header + Filter (unchanged)
            ═════════════════════════════════ */}
            <div className="hidden lg:flex items-center justify-between mb-4 mt-2 px-1">
                <h1 className="text-[22px] font-black text-gray-900 tracking-tight">
                    Products
                    <span className="text-[13px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full ml-2">{products.length}</span>
                </h1>
                <Link href="/dashboard/products/create">
                    <Button variant="primary" className="h-9 px-4 rounded-xl gap-1.5 shadow-sm text-[13px] active:scale-95 transition-transform">
                        <Plus size={15} strokeWidth={3} />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Desktop search + filter row */}
            <div className="hidden lg:flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-[42px] bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="relative w-48 shrink-0">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={15} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-8 h-[42px] bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* ═══════════════════════
                PRODUCT LIST
            ═══════════════════════ */}
            {loading ? (
                <div className="p-10 text-center text-gray-400 text-sm font-medium">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200 mx-1 mt-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="text-slate-300" size={22} />
                    </div>
                    <p className="text-slate-800 font-bold text-[15px]">No products found</p>
                    <p className="text-[13px] text-slate-400 mt-1">Try a different filter or search term.</p>
                </div>
            ) : (
                <>
                    {/* ──── MOBILE CARD LIST ──── */}
                    <div className="space-y-2.5 lg:hidden px-1 pt-1">
                        {filteredProducts.map((product, idx) => {
                            const imgBg = imageBgs[idx % imageBgs.length]
                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 p-3 transition-all hover:shadow-md hover:border-slate-200"
                                >
                                    {/* Image in uniform bounding box */}
                                    <Link href={`/dashboard/products/${product.id}`} className={`w-20 h-20 shrink-0 rounded-xl ${imgBg} overflow-hidden flex items-center justify-center`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <ImageIcon size={22} strokeWidth={1.5} className="text-slate-300" />
                                        )}
                                    </Link>

                                    {/* Product info */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/dashboard/products/${product.id}`} className="block">
                                            <h3 className="text-[13px] font-bold text-slate-900 truncate leading-tight">{product.name}</h3>
                                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                                <span className="font-black text-slate-900 text-[14px]">₹{product.price.toLocaleString()}</span>
                                                {product.mrp && <span className="text-[11px] text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>}
                                                {product.mrp && product.price < product.mrp && (
                                                    <span className="text-[9px] font-black text-green-700 bg-green-50 px-1 py-0.5 rounded uppercase tracking-wider">
                                                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                                                    </span>
                                                )}
                                            </div>
                                            {/* Category + Badge pills */}
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {product.categories?.name && (
                                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        {product.categories.name}
                                                    </span>
                                                )}
                                                {product.badge && product.badge !== 'none' && (
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        {product.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Single inline bottom row: stock · toggle · actions */}
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                            {/* Stock dot + label */}
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-400' : 'bg-red-500'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                                                    {product.stock > 10 ? `In Stock (${product.stock})` : product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of stock'}
                                                </span>
                                            </div>

                                            {/* Toggle + edit/delete inline */}
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={(e) => toggleStatus(product, e)}
                                                    disabled={toggling === product.id}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${product.is_enabled ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${product.is_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                <Link href={`/dashboard/products/${product.id}`} className="text-slate-400 hover:text-blue-600 active:scale-95 transition-all p-1 rounded-lg hover:bg-blue-50">
                                                    <Edit size={13} strokeWidth={2} />
                                                </Link>
                                                <button onClick={(e) => handleDelete(product.id, e)} className="text-slate-400 hover:text-red-500 active:scale-95 transition-all p-1 rounded-lg hover:bg-red-50">
                                                    <Trash2 size={13} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* ──── DESKTOP TABLE (unchanged) ──── */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                                    <th className="p-3 pl-5 font-bold w-[52px]">Image</th>
                                    <th className="p-3 font-bold">Product Name</th>
                                    <th className="p-3 font-bold">Category</th>
                                    <th className="p-3 font-bold">Price</th>
                                    <th className="p-3 font-bold">Stock</th>
                                    <th className="p-3 font-bold">Status</th>
                                    <th className="p-3 text-right pr-5 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-3 pl-5 align-middle">
                                            <Link href={`/dashboard/products/${product.id}`} className="w-11 h-11 block rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-0.5" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon size={14} strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <Link href={`/dashboard/products/${product.id}`} className="block group-hover:text-primary transition-colors">
                                                <h3 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">{product.name}</h3>
                                                {product.badge && product.badge !== 'none' && (
                                                    <span className="inline-block mt-0.5 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">{product.badge}</span>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{product.categories?.name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <span className="font-black text-slate-800 text-[13px]">₹{product.price.toLocaleString()}</span>
                                            {product.mrp && <span className="block text-[11px] text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>}
                                        </td>
                                        <td className="p-3 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-400' : 'bg-red-500'}`} />
                                                <span className={`text-[11px] font-bold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>{product.stock}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <button
                                                onClick={(e) => toggleStatus(product, e)}
                                                disabled={toggling === product.id}
                                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-60 ${product.is_enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ${product.is_enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="p-3 text-right pr-5 align-middle">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/dashboard/products/${product.id}`} className="text-slate-400 hover:text-blue-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-blue-50">
                                                    <Edit size={14} strokeWidth={2} />
                                                </Link>
                                                <button onClick={(e) => handleDelete(product.id, e)} className="text-slate-400 hover:text-red-500 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-red-50">
                                                    <Trash2 size={14} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
