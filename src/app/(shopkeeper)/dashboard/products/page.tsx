'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Filter, Package } from 'lucide-react'
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

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Products <span className="text-[14px] text-gray-400 font-bold align-middle bg-gray-100 px-2 py-0.5 rounded-full ml-1">{products.length}</span></h1>
                <Link href="/dashboard/products/create">
                    <Button variant="primary" className="h-10 px-4 rounded-xl gap-1.5 shadow-sm text-[13px] active:scale-95 transition-transform">
                        <Plus size={16} strokeWidth={3} />
                        <span className="hidden sm:inline">Add Product</span>
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 h-[52px] bg-white border border-gray-200 rounded-[16px] text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="relative w-full sm:w-48 shrink-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                        <Filter size={18} />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-11 pr-10 h-[52px] bg-white border border-gray-200 rounded-[16px] text-[14px] font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product List */}
            <div className="pt-2">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-[24px] border border-dashed border-gray-200 shadow-sm mt-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Package className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-900 font-bold text-[18px]">No products found</p>
                        <p className="text-[14px] text-gray-500 mt-1 font-medium">Try a different filter or search term.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="space-y-4 lg:hidden">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white p-4 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex items-start gap-4 transition-all hover:shadow-md hover:border-gray-200">
                                    {/* Product Image */}
                                    <Link href={`/dashboard/products/${product.id}`} className="w-[88px] h-[88px] shrink-0 rounded-[14px] bg-gray-50 overflow-hidden relative border border-gray-100 block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={24} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <Link href={`/dashboard/products/${product.id}`} className="block group">
                                            <h3 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{product.name}</h3>

                                            <div className="flex flex-wrap items-baseline gap-2 mt-1 blur-0">
                                                <span className="font-black text-gray-900 text-[16px] tracking-tight">₹{product.price.toLocaleString()}</span>
                                                {product.mrp && <span className="text-[12px] text-gray-400 line-through font-medium">₹{product.mrp.toLocaleString()}</span>}
                                                {product.mrp && product.price < product.mrp && (
                                                    <span className="text-[10px] font-black text-success bg-success-light/30 px-1.5 py-0.5 rounded-[4px] border border-success/10 uppercase tracking-widest ml-1">
                                                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-[6px] border border-gray-200 truncate max-w-[120px]">
                                                    {product.categories?.name || 'Uncategorized'}
                                                </span>
                                                {product.badge && product.badge !== 'none' && (
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-[6px] border border-blue-200 uppercase text-[10px] font-black tracking-widest shrink-0">
                                                        {product.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Bottom Action Row: Stock & Toggles */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ring-2 ${product.stock > 10 ? 'bg-success ring-success/20' : product.stock > 0 ? 'bg-orange-500 ring-orange-500/20' : 'bg-error ring-error/20'}`} />
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-orange-600' : 'text-error'}`}>
                                                    {product.stock > 10 ? `In Stock (${product.stock})` : product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of Stock'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => toggleStatus(product, e)}
                                                    disabled={toggling === product.id}
                                                    className={`relative inline-flex h-6 w-[42px] shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden ${product.is_enabled ? 'bg-success' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${product.is_enabled ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    <Link href={`/dashboard/products/${product.id}`} className="text-gray-400 hover:text-blue-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-blue-50">
                                                        <Edit size={16} strokeWidth={2.5} />
                                                    </Link>
                                                    <button onClick={(e) => handleDelete(product.id, e)} className="text-gray-400 hover:text-red-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-red-50">
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Data Table */}
                        <div className="hidden lg:block bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[12px] text-gray-500 font-bold uppercase tracking-widest">
                                        <th className="p-4 pl-6 font-bold w-[60px]">Image</th>
                                        <th className="p-4 font-bold">Product Name</th>
                                        <th className="p-4 font-bold">Category</th>
                                        <th className="p-4 font-bold">Price</th>
                                        <th className="p-4 font-bold">Stock</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 text-right pr-6 font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4 pl-6 align-middle">
                                                <Link href={`/dashboard/products/${product.id}`} className="w-[48px] h-[48px] block rounded-[10px] bg-gray-50 overflow-hidden relative border border-gray-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={16} strokeWidth={1.5} />
                                                        </div>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Link href={`/dashboard/products/${product.id}`} className="block group-hover:text-primary transition-colors">
                                                    <h3 className="text-[14px] font-bold text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>
                                                    {product.badge && product.badge !== 'none' && (
                                                        <span className="inline-block mt-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-[4px] border border-blue-200 uppercase text-[9px] font-black tracking-widest">
                                                            {product.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-[6px] border border-gray-200">
                                                    {product.categories?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 text-[14px]">₹{product.price.toLocaleString()}</span>
                                                    {product.mrp && <span className="text-[11px] text-gray-400 line-through font-medium">₹{product.mrp.toLocaleString()}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ring-2 ${product.stock > 10 ? 'bg-success ring-success/20' : product.stock > 0 ? 'bg-orange-500 ring-orange-500/20' : 'bg-error ring-error/20'}`} />
                                                    <span className={`text-[11px] font-black uppercase tracking-widest ${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-orange-600' : 'text-error'}`}>
                                                        {product.stock} left
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <button
                                                    onClick={(e) => toggleStatus(product, e)}
                                                    disabled={toggling === product.id}
                                                    className={`relative inline-flex h-5 w-[36px] shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden ${product.is_enabled ? 'bg-success' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${product.is_enabled ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                                                </button>
                                            </td>
                                            <td className="p-4 text-right pr-6 align-middle">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/dashboard/products/${product.id}`} className="text-gray-400 hover:text-blue-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-blue-50">
                                                        <Edit size={16} strokeWidth={2.5} />
                                                    </Link>
                                                    <button onClick={(e) => handleDelete(product.id, e)} className="text-gray-400 hover:text-red-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-red-50">
                                                        <Trash2 size={16} strokeWidth={2.5} />
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
        </div>
    )
}
