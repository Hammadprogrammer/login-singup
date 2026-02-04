// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import { 
//   Loader2, ChevronLeft, ShoppingBag, X, ShieldCheck, 
//   Truck, ArrowRight, Info, Plus, Minus, Trash2, Calendar, Tag
// } from 'lucide-react';

// // --- INTERFACES ---
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   brands: string[];
//   sizes: string[]; 
//   colors: string[];
//   imageUrls: string[];
//   saleType: 'sale' | 'rent';
//   condition: string;
// }

// interface CartItem {
//   id: number;
//   productId: string;
//   quantity: number;
//   size?: string;
//   product: Product;
// }

// export default function LuxuryProductPage() {
//   const params = useParams();
//   const id = params?.id as string;
//   const MASTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

//   const [product, setProduct] = useState<Product | null>(null);
//   const [mainImage, setMainImage] = useState<string>('');
//   const [selectedSize, setSelectedSize] = useState<string>('');
//   const [loading, setLoading] = useState(true);
  
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ opacity: 0 });

//   const formatUSDT = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency', currency: 'USD',
//     }).format(amount).replace('$', 'USDT ');
//   };

//   const fetchCart = async () => {
//     try {
//       const res = await fetch('/api/cart');
//       if (res.ok) {
//         const data = await res.json();
//         setCart(data);
//       }
//     } catch (err) { console.error(err); }
//   };

//   const addToBag = async () => {
//     if (!product) return;
//     if (!selectedSize) { alert("Please select a size first"); return; }
//     setIsUpdating(true);
//     try {
//       const res = await fetch('/api/cart', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ productId: product.id, quantity: 1, size: selectedSize }),
//       });
//       if (res.ok) {
//         await fetchCart();
//         setIsCartOpen(true);
//       } else if (res.status === 401) {
//         setShowAuthModal(true);
//       }
//     } catch (err) { console.error(err); } finally { setIsUpdating(false); }
//   };

//   const updateQuantity = async (cartItemId: number, delta: number) => {
//     const item = cart.find(i => i.id === cartItemId);
//     if (!item) return;
//     const newQty = Math.max(1, item.quantity + delta);
//     setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
//     try {
//       const res = await fetch('/api/cart', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cartItemId, quantity: newQty }),
//       });
//       if (!res.ok) fetchCart();
//     } catch (err) { fetchCart(); }
//   };

//   const removeItem = async (cartItemId: number) => {
//     setCart(prev => prev.filter(item => item.id !== cartItemId));
//     try { await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' }); } catch (err) { fetchCart(); }
//   };

//   useEffect(() => {
//     const init = async () => {
//       if (!id) return;
//       try {
//         const res = await fetch(`/api/products`);
//         const data: Product[] = await res.json();
//         const found = data.find((p) => p.id === id);
//         if (found) {
//           setProduct(found);
//           setMainImage(found.imageUrls[0]);
//           if (found.sizes?.[0]) setSelectedSize(found.sizes[0]);
//         }
//         await fetchCart();
//       } catch (err) { console.error(err); } finally { setLoading(false); }
//     };
//     init();
//   }, [id]);

//   const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     const x = ((e.pageX - left) / width) * 100;
//     const y = ((e.pageY - (top + window.scrollY)) / height) * 100;
//     setZoomStyle({
//       opacity: 1,
//       backgroundImage: `url(${mainImage})`,
//       backgroundPosition: `${x}% ${y}%`,
//       backgroundSize: '250%',
//     });
//   };

//   if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-zinc-200" size={40} /></div>;
//   if (!product) return <div className="text-center py-40 font-bold tracking-widest uppercase">Product Not Found</div>;

//   return (
//     <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      
//       {/* --- BAG DRAWER (FULL TOP OVERLAY) --- */}
//       {/* Backdrop */}
//       <div 
//         className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? 'opacity-100 z-[9998]' : 'opacity-0 pointer-events-none z-[-1]'}`} 
//         onClick={() => setIsCartOpen(false)} 
//       />
      
//       {/* Drawer Body */}
//       <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isCartOpen ? 'translate-x-0 z-[9999]' : 'translate-x-full z-[9999]'}`}>
//         <div className="flex flex-col h-full">
//           <div className="flex justify-between items-center p-8 border-b border-zinc-50">
//             <div className="flex items-center gap-3">
//               <ShoppingBag size={18} />
//               <h2 className="text-[10px] tracking-[0.4em] uppercase font-black">Your Selection ({cart.length})</h2>
//             </div>
//             <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300 p-2"><X size={20} /></button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
//             {cart.length === 0 ? (
//               <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4">
//                  <ShoppingBag size={40} strokeWidth={0.5} />
//                  <p className="uppercase tracking-[0.2em] text-[10px]">Your bag is empty</p>
//               </div>
//             ) : (
//               cart.map((item) => (
//                 <div key={item.id} className="flex gap-6 items-start pb-8 border-b border-zinc-50 last:border-0">
//                   <div className="w-20 bg-zinc-50 aspect-[3/4] overflow-hidden flex-shrink-0 border border-zinc-100">
//                     <img src={item.product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
//                   </div>
//                   <div className="flex-1 space-y-1">
//                     <p className="text-[7px] tracking-widest uppercase text-zinc-400 font-bold">{item.product.brands[0]}</p>
//                     <h3 className="text-[11px] font-medium uppercase tracking-tight">{item.product.name}</h3>
//                     <p className="text-[9px] font-black pt-1">SIZE: {item.size}</p>
//                     <div className="flex items-center justify-between pt-4">
//                       <div className="flex items-center border border-zinc-100 rounded-sm">
//                         <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-zinc-50"><Minus size={10} /></button>
//                         <span className="px-2.5 text-[10px] font-bold">{item.quantity}</span>
//                         <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-zinc-50"><Plus size={10} /></button>
//                       </div>
//                       <button onClick={() => removeItem(item.id)} className="text-zinc-200 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
//                     </div>
//                   </div>
//                   <p className="text-[11px] font-black">{formatUSDT(item.product.price * item.quantity)}</p>
//                 </div>
//               ))
//             )}
//           </div>

//           {cart.length > 0 && (
//             <div className="p-8 bg-zinc-50 border-t border-zinc-100 space-y-6">
//               <div className="flex justify-between items-center">
//                 <p className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">Total</p>
//                 <p className="text-xl font-black tracking-tighter">{formatUSDT(cartTotal)}</p>
//               </div>
//               <Link href="/checkout" className="w-full bg-zinc-900 text-white py-5 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-black flex items-center justify-center gap-3 transition-all shadow-xl">
//                 Checkout Now <ArrowRight size={14} />
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- MAIN PAGE CONTENT --- */}
//       <main className="max-w-[1700px] mx-auto px-8 lg:px-16 py-12">
//         <nav className="mb-16 flex justify-between items-center relative z-10">
//           <Link href="/" className="inline-flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase font-bold text-zinc-400 hover:text-black transition-colors">
//             <ChevronLeft size={16} /> Collection
//           </Link>
//           <button onClick={() => setIsCartOpen(true)} className="relative group p-2">
//             <ShoppingBag size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
//             {cart.length > 0 && (
//               <span className="absolute top-0 right-0 bg-zinc-900 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in fade-in zoom-in">
//                 {cart.length}
//               </span>
//             )}
//           </button>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
//           {/* Gallery Section */}
//           <div className="flex flex-col-reverse xl:flex-row gap-8">
//             <div className="flex xl:flex-col gap-4 overflow-x-auto xl:w-24 no-scrollbar">
//               {product.imageUrls.map((url, i) => (
//                 <button key={i} onClick={() => setMainImage(url)} className={`relative aspect-[3/4.5] w-20 xl:w-full overflow-hidden transition-all duration-500 ${mainImage === url ? 'ring-1 ring-zinc-900 ring-offset-4' : 'opacity-40 hover:opacity-100'}`}>
//                   <img src={url} alt="" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
//                 </button>
//               ))}
//             </div>
//             <div className="flex-1 relative bg-white group overflow-hidden border border-zinc-50">
//               <div className="absolute top-6 left-6 z-10">
//                 <span className="bg-zinc-900 text-white text-[9px] tracking-[0.2em] uppercase font-black px-4 py-2 shadow-2xl">
//                   {product.saleType === 'rent' ? 'For Rent' : 'For Sale'}
//                 </span>
//               </div>
//               <div className="relative aspect-[3/4.5] cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={() => setZoomStyle({ opacity: 0 })}>
//                 <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" />
//                 <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 hidden md:block" style={{ ...zoomStyle, backgroundRepeat: 'no-repeat' }} />
//               </div>
//             </div>
//           </div>

//           {/* Details Section */}
//           <div className="flex flex-col pt-4 space-y-12">
//             <div className="space-y-4">
//               <p className="text-[16px] tracking-[0.6em] uppercase font-black text-zinc-900">{product.brands[0]}</p>
//               <h1 className="text-[18px] font-light tracking-tight text-zinc-900 uppercase leading-relaxed">{product.name}</h1>
//               <div className="flex items-center gap-4">
//                   <p className="text-[20px] font-black tracking-tighter">{formatUSDT(product.price)}</p>
//                   {product.saleType === 'rent' && <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">/ Daily</span>}
//               </div>
//               <div className="inline-flex items-center gap-2 border border-zinc-100 px-3 py-1.5 rounded-sm bg-zinc-50/50">
//                   <div className={`w-1.5 h-1.5 rounded-full ${product.condition === 'New' ? 'bg-green-500' : 'bg-orange-400'}`} />
//                   <span className="text-[9px] uppercase tracking-widest font-black text-zinc-700">{product.condition} Condition</span>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-black text-zinc-900 border-b border-zinc-50 pb-2">
//                 <Info size={14} /> The Details
//               </div>
//               <p className="text-sm leading-relaxed text-zinc-500 font-light max-w-xl italic">
//                 {product.description || "Indulge in pure luxury with this masterfully crafted piece, designed for those who appreciate the finer things in life."}
//               </p>
//             </div>

//             <div className="space-y-6">
//               <p className="text-[10px] tracking-[0.3em] uppercase font-black">Select Size</p>
//               <div className="flex flex-wrap gap-4">
//                 {MASTER_SIZES.map((size) => {
//                   const isAvailable = product.sizes.includes(size);
//                   return (
//                     <button
//                       key={size}
//                       disabled={!isAvailable}
//                       onClick={() => setSelectedSize(size)}
//                       className={`relative w-16 h-16 flex items-center justify-center text-[12px] font-black border transition-all duration-300
//                         ${selectedSize === size ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl scale-105' : 'border-zinc-200 text-zinc-900 hover:border-zinc-900'}
//                         ${!isAvailable ? 'opacity-20 cursor-not-allowed bg-zinc-50' : ''}
//                       `}
//                     >
//                       <span>{size}</span>
//                       {!isAvailable && <div className="w-full h-[1px] bg-zinc-300 rotate-45 absolute" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <button 
//                 onClick={addToBag}
//                 disabled={isUpdating}
//                 className="bg-zinc-900 text-white py-6 text-[10px] tracking-[0.4em] uppercase font-black hover:bg-black transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] disabled:opacity-50"
//               >
//                 {isUpdating ? <Loader2 className="animate-spin" size={18} /> : (product.saleType === 'rent' ? <Calendar size={18} /> : <ShoppingBag size={18} />)} 
//                 {product.saleType === 'rent' ? 'Reserve Now' : 'Add to Bag'}
//               </button>
//               <button onClick={() => setIsCartOpen(true)} className="border border-zinc-200 py-6 text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-900 hover:border-zinc-900 transition-all bg-white">
//                 View Bag ({cart.length})
//               </button>
//             </div>
            
//             <div className="pt-10 border-t border-zinc-100 flex flex-wrap gap-10">
//               <div className="flex items-center gap-3"><Truck size={18} className="text-zinc-300" /><span className="text-[9px] uppercase tracking-widest font-black text-zinc-400">White-Glove Delivery</span></div>
//               <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-zinc-300" /><span className="text-[9px] uppercase tracking-widest font-black text-zinc-400">Verified Authentic</span></div>
//               <div className="flex items-center gap-3"><Tag size={18} className="text-zinc-300" /><span className="text-[9px] uppercase tracking-widest font-black text-zinc-400">Limited Edition</span></div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Auth Modal (Highest Z-Index) */}
//       {showAuthModal && (
//         <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4"> 
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAuthModal(false)} />
//           <div className="relative bg-white w-full max-w-sm p-12 text-center shadow-2xl rounded-sm animate-in fade-in zoom-in duration-500">
//             <h2 className="text-[12px] uppercase tracking-[0.5em] font-black mb-8 text-zinc-900">Member Access</h2>
//             <p className="text-xs text-zinc-400 mb-10 leading-relaxed font-light uppercase tracking-widest">Sign in to curate your luxury collection.</p>
//             <Link href="/login" className="block bg-zinc-900 text-white text-[10px] py-4 rounded-sm font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl">Sign In</Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );  
// }



'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, ChevronLeft, ShoppingBag, X, ShieldCheck, 
  Truck, ArrowRight, Info, Plus, Minus, Trash2, Calendar, Tag
} from 'lucide-react';

// --- INTERFACES ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brands: string[];
  sizes: string[]; 
  colors: string[];
  imageUrls: string[];
  saleType: 'sale' | 'rent';
  condition: string;
}

interface CartItem {
  id: number;
  productId: string;
  quantity: number;
  size?: string;
  product: Product;
}

export default function LuxuryProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const MASTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
    }).format(amount).replace('$', 'USDT ');
  };

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) { console.error(err); }
  };

  const addToBag = async () => {
    if (!product) return;
    if (!selectedSize) { alert("Please select a size first"); return; }
    setIsUpdating(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1, size: selectedSize }),
      });
      if (res.ok) {
        await fetchCart();
        setIsCartOpen(true);
      } else if (res.status === 401) {
        setShowAuthModal(true);
      }
    } catch (err) { console.error(err); } finally { setIsUpdating(false); }
  };

  const updateQuantity = async (cartItemId: number, delta: number) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQty }),
      });
      if (!res.ok) fetchCart();
    } catch (err) { fetchCart(); }
  };

  const removeItem = async (cartItemId: number) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    try { await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' }); } catch (err) { fetchCart(); }
  };

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/products`);
        const data: Product[] = await res.json();
        const found = data.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          setMainImage(found.imageUrls[0]);
          if (found.sizes?.[0]) setSelectedSize(found.sizes[0]);
        }
        await fetchCart();
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, [id]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return; // Disable zoom on mobile
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - (top + window.scrollY)) / height) * 100;
    setZoomStyle({
      opacity: 1,
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-zinc-200" size={40} /></div>;
  if (!product) return <div className="text-center py-40 font-bold tracking-widest uppercase">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      
      {/* --- BAG DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? 'opacity-100 z-[9998]' : 'opacity-0 pointer-events-none z-[-1]'}`} 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isCartOpen ? 'translate-x-0 z-[9999]' : 'translate-x-full z-[9999]'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 md:p-8 border-b border-zinc-50">
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} />
              <h2 className="text-[10px] tracking-[0.4em] uppercase font-black">Your Selection ({cart.length})</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300 p-2"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 no-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4">
                 <ShoppingBag size={40} strokeWidth={0.5} />
                 <p className="uppercase tracking-[0.2em] text-[10px]">Your bag is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 md:gap-6 items-start pb-6 border-b border-zinc-50 last:border-0">
                  <div className="w-16 md:w-20 bg-zinc-50 aspect-[3/4] overflow-hidden flex-shrink-0 border border-zinc-100">
                    <img src={item.product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[7px] tracking-widest uppercase text-zinc-400 font-bold">{item.product.brands[0]}</p>
                    <h3 className="text-[10px] md:text-[11px] font-medium uppercase tracking-tight line-clamp-1">{item.product.name}</h3>
                    <p className="text-[8px] md:text-[9px] font-black pt-1">SIZE: {item.size}</p>
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center border border-zinc-100 rounded-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 md:p-1.5 hover:bg-zinc-50"><Minus size={10} /></button>
                        <span className="px-2 text-[9px] md:text-[10px] font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 md:p-1.5 hover:bg-zinc-50"><Plus size={10} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-zinc-200 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-[11px] font-black">{formatUSDT(item.product.price * item.quantity)}</p>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 md:p-8 bg-zinc-50 border-t border-zinc-100 space-y-4 md:space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-[9px] md:text-[10px] tracking-widest uppercase text-zinc-400 font-bold">Total</p>
                <p className="text-lg md:text-xl font-black tracking-tighter">{formatUSDT(cartTotal)}</p>
              </div>
              <Link href="/checkout" className="w-full bg-zinc-900 text-white py-4 md:py-5 text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-black flex items-center justify-center gap-3 transition-all">
                Checkout Now <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-16 py-6 md:py-12">
        <nav className="mb-8 md:mb-16 flex justify-between items-center relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold text-zinc-400 hover:text-black transition-colors">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Collection</span><span className="sm:hidden">Back</span>
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="relative group p-2">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-zinc-900 text-white text-[7px] md:text-[8px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center font-black">
                {cart.length}
              </span>
            )}
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-start">
          {/* Gallery Section */}
          <div className="flex flex-col-reverse xl:flex-row gap-4 md:gap-8">
            <div className="flex xl:flex-col gap-3 overflow-x-auto xl:w-24 no-scrollbar pb-2 xl:pb-0">
              {product.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setMainImage(url)} className={`relative aspect-[3/4.5] w-16 sm:w-20 xl:w-full overflow-hidden transition-all duration-500 flex-shrink-0 ${mainImage === url ? 'ring-1 ring-zinc-900 ring-offset-2 md:ring-offset-4' : 'opacity-40'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative bg-white group overflow-hidden border border-zinc-50">
              <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                <span className="bg-zinc-900 text-white text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-black px-3 py-1.5 md:px-4 md:py-2 shadow-2xl">
                  {product.saleType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
              <div className="relative aspect-[3/4.5] cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={() => setZoomStyle({ opacity: 0 })}>
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 hidden md:block" style={{ ...zoomStyle, backgroundRepeat: 'no-repeat' }} />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col space-y-8 md:space-y-12">
            <div className="space-y-3 md:space-y-4">
              <p className="text-[12px] md:text-[16px] tracking-[0.4em] md:tracking-[0.6em] uppercase font-black text-zinc-900">{product.brands[0]}</p>
              <h1 className="text-[16px] md:text-[18px] font-light tracking-tight text-zinc-900 uppercase leading-relaxed">{product.name}</h1>
              <div className="flex items-center gap-4">
                  <p className="text-lg md:text-[20px] font-black tracking-tighter">{formatUSDT(product.price)}</p>
                  {product.saleType === 'rent' && <span className="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest font-bold">/ Daily</span>}
              </div>
              <div className="inline-flex items-center gap-2 border border-zinc-100 px-2 py-1 md:px-3 md:py-1.5 rounded-sm bg-zinc-50/50">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.condition === 'New' ? 'bg-green-500' : 'bg-orange-400'}`} />
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-zinc-700">{product.condition} Condition</span>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-black text-zinc-900 border-b border-zinc-50 pb-2">
                <Info size={14} /> The Details
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-zinc-500 font-light max-w-xl italic">
                {product.description || "Indulge in pure luxury with this masterfully crafted piece."}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-black">Select Size</p>
            <div className="
              flex gap-2
              flex-nowrap overflow-x-auto
              sm:flex-wrap sm:overflow-visible
              md:gap-4
            ">
              {MASTER_SIZES.map((size) => {
                const isAvailable = product.sizes.includes(size);

                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      relative flex-none
                      aspect-square
                      w-8 sm:w-10 md:w-12
                      flex items-center justify-center
                      text-[9px] sm:text-[11px] md:text-xs font-black
                      border transition-all
                      ${selectedSize === size
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-900'}
                      ${!isAvailable
                        ? 'opacity-30 cursor-not-allowed bg-zinc-50'
                        : 'cursor-pointer'}
                    `}
                  >
                    <span className="relative z-10">{size}</span>

                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="w-[140%] h-[1px] bg-zinc-400 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button 
                onClick={addToBag}
                disabled={isUpdating}
                className="bg-zinc-900 text-white py-4 md:py-6 text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-black hover:bg-black transition-all flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : (product.saleType === 'rent' ? <Calendar size={18} /> : <ShoppingBag size={18} />)} 
                {product.saleType === 'rent' ? 'Reserve Now' : 'Add to Bag'}
              </button>
              <button onClick={() => setIsCartOpen(true)} className="border border-zinc-200 py-4 md:py-6 text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-900 bg-white">
                View Bag ({cart.length})
              </button>
            </div>
            
            <div className="pt-6 md:pt-10 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 md:gap-10">
              <div className="flex items-center gap-3"><Truck size={16} className="text-zinc-300" /><span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-zinc-400">White-Glove Delivery</span></div>
              <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-zinc-300" /><span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-zinc-400">Verified Authentic</span></div>
              <div className="flex items-center gap-3"><Tag size={16} className="text-zinc-300" /><span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-zinc-400">Limited Edition</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4"> 
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-sm p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black mb-6 md:mb-8 text-zinc-900">Member Access</h2>
            <p className="text-[10px] text-zinc-400 mb-8 md:mb-10 leading-relaxed uppercase tracking-widest">Sign in to curate your luxury collection.</p>
            <Link href="/login" className="block bg-zinc-900 text-white text-[9px] md:text-[10px] py-4 font-bold uppercase tracking-[0.3em]">Sign In</Link>
          </div>
        </div>
      )}
    </div>
  );  
}

