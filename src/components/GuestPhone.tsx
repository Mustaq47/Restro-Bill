import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory, OrderItem, ServiceRequestType } from '../types';
import { 
  ShoppingBag, Trash2, ArrowLeft, Plus, Minus, Search, 
  HelpCircle, Droplet, Receipt, AlertCircle, Sparkles, Send, Flame, Info
} from 'lucide-react';

interface GuestPhoneProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tableNumber: number;
  onTableChange: (num: number) => void;
  onSubmitOrder: (items: OrderItem[], notes: string) => void;
  onSubmitServiceRequest: (type: ServiceRequestType) => void;
  activeGuestOrder: { id: string; status: string; payment_status: string } | null;
  onPayOrder: () => void;
}

export const GuestPhone: React.FC<GuestPhoneProps> = ({
  categories,
  menuItems,
  tableNumber,
  onTableChange,
  onSubmitOrder,
  onSubmitServiceRequest,
  activeGuestOrder,
  onPayOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [spicyOnly, setSpicyOnly] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDiet = true;
      if (vegFilter === 'veg') matchesDiet = item.is_veg;
      if (vegFilter === 'non-veg') matchesDiet = item.is_non_veg;

      const matchesSpicy = !spicyOnly || item.is_spicy;

      return matchesCategory && matchesSearch && matchesDiet && matchesSpicy;
    });
  }, [menuItems, selectedCategory, searchQuery, vegFilter, spicyOnly]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      const qtyNum = qty as number;
      return total + (item ? item.price * qtyNum : 0);
    }, 0);
  }, [cart, menuItems]);

  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => (sum as number) + (qty as number), 0) as number;
  }, [cart]);

  const handleAddToCart = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item || !item.is_available) return;
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: next
      };
    });
  };

  const handleCheckout = () => {
    if (cartItemCount === 0) return;
    setIsSubmitting(true);
    
    // Format cart items to snapshot format
    const orderItems: OrderItem[] = Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId)!;
      const qtyNum = qty as number;
      return {
        id: Math.random().toString(),
        order_id: '',
        menu_item_id: item.id,
        name: item.name,
        quantity: qtyNum,
        unit_price: item.price,
        subtotal: item.price * qtyNum
      };
    });

    // Mock API Submit timeout
    setTimeout(() => {
      onSubmitOrder(orderItems, specialInstructions);
      setCart({});
      setSpecialInstructions('');
      setIsCartOpen(false);
      setIsSubmitting(false);
    }, 800);
  };

  // Quick Service Trigger
  const handleServiceClick = (type: ServiceRequestType) => {
    onSubmitServiceRequest(type);
    alert(`🛎️ Service request submitted! "${type.toUpperCase()}" registered for Table ${tableNumber}.`);
  };

  return (
    <div className="flex flex-col items-center select-none py-1.5 h-full w-full">
      {/* Smartphone Outer Container - Responsive on Mobile */}
      <div className="w-full h-[100dvh] sm:w-[365px] sm:h-[720px] bg-slate-950 sm:rounded-[48px] sm:border-[10px] sm:border-slate-900 shadow-2xl overflow-hidden flex flex-col relative font-sans text-slate-900">
        
        {/* Notch / Speaker (Only shown on screen sizes that support the mockup container) */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 items-center justify-around px-2.5">
          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* Battery / Status Bar - Adaptive spacing */}
        <div className="bg-slate-100/90 backdrop-blur-sm px-4 pt-3 pb-2 sm:px-7 sm:pt-6 sm:pb-2 text-[10px] font-semibold text-slate-600 flex justify-between items-center z-40 select-none">
          <span>10:05 AM</span>
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-mono">Table {tableNumber}</span>
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="w-3 h-full bg-slate-600 rounded-[1px]"></div>
            </div>
          </div>
        </div>


        {/* Real App Body */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <header className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                🍛
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 tracking-tight">The Palace Inn</h3>
                <p className="text-[10px] text-emerald-600 font-medium">● Guest Self-Checkout</p>
              </div>
            </div>

            {/* Table Mock Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">T-</span>
              <select 
                value={tableNumber} 
                onChange={(e) => onTableChange(parseInt(e.target.value))}
                className="bg-slate-100 border border-slate-200 text-xs font-bold rounded px-1 py-0.5 text-slate-700 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </header>

          {/* Quick Sticky Waiter Calling Service Bar */}
          <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-md z-10 text-[11px]">
            <span className="font-semibold text-slate-300">🛎️ Need Help?</span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => handleServiceClick('waiter')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded font-medium flex items-center gap-1 border border-slate-700/60 transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-indigo-400" /> Waiter
              </button>
              <button 
                onClick={() => handleServiceClick('water')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded font-medium flex items-center gap-1 border border-slate-700/60 transition-colors"
              >
                <Droplet className="w-3 h-3 text-sky-400" /> Water
              </button>
              <button 
                onClick={() => handleServiceClick('bill')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded font-medium flex items-center gap-1 border border-slate-700/60 transition-colors"
              >
                <Receipt className="w-3 h-3 text-amber-400" /> Bill
              </button>
            </div>
          </div>

          {/* Active order tracker banner */}
          {activeGuestOrder && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-3 py-2.5 flex items-center justify-between text-xs text-indigo-950 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="animate-ping rounded-full w-2 h-2 bg-indigo-600 block"></span>
                <span>Active Order: {activeGuestOrder.status.toUpperCase()}</span>
              </div>
              <div className="flex gap-1">
                {activeGuestOrder.payment_status === 'unpaid' ? (
                  <button 
                    onClick={onPayOrder}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors shadow-sm"
                  >
                    💳 Pay Bill
                  </button>
                ) : (
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Paid ✓
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Welcome Banner Card */}
          <div className="mx-3 mt-3 bg-slate-900 text-white rounded-xl p-3 shadow-sm relative overflow-hidden shrink-0">
            <div className="relative z-10 space-y-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Now Connected
              </span>
              <h2 className="text-xs font-black tracking-tight flex items-center gap-1">
                Welcome to Table {tableNumber}
              </h2>
              <p className="text-[9px] text-slate-300 leading-normal">
                Order digitally straight to the kitchen. Request waiter assistance, refill water, or call for the bill anytime.
              </p>
            </div>
            {/* Background decoration */}
            <div className="absolute right-1 bottom-1 text-4xl opacity-10 select-none">
              🍛
            </div>
          </div>

          {/* Catalog Filter Controls */}
          <div className="p-3 bg-white space-y-2 border-b border-slate-100">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search dishes, drinks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Category horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Diet toggle filters */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setVegFilter('all')}
                  className={`px-2 py-1 rounded border ${
                    vegFilter === 'all' ? 'bg-slate-100 text-slate-800 border-slate-300 font-semibold' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Diet
                </button>
                <button
                  onClick={() => setVegFilter('veg')}
                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                    vegFilter === 'veg' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Veg
                </button>
                <button
                  onClick={() => setVegFilter('non-veg')}
                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                    vegFilter === 'non-veg' ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span> Non-Veg
                </button>
              </div>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={spicyOnly} 
                  onChange={(e) => setSpicyOnly(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                <span className="flex items-center gap-0.5 text-slate-900 font-semibold">
                  <Flame className="w-3 h-3" /> Spicy
                </span>
              </label>
            </div>
          </div>

          {/* Menu Catalog Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 font-medium">No matching delicious dishes found.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const cartQty = cart[item.id] || 0;
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl p-2.5 shadow-sm border flex gap-3 relative transition-all ${
                      item.is_available ? 'border-slate-100 hover:shadow' : 'opacity-65 border-slate-200'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white bg-red-600 px-1 py-0.5 rounded">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {/* Diet Indicator Dot */}
                          <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{item.name}</h4>
                          
                          {item.is_spicy && (
                            <Flame className="w-3 h-3 text-red-500 fill-red-100 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-slate-950 font-mono">${item.price.toFixed(2)}</span>

                        {/* Add/Quantity Button */}
                        {item.is_available ? (
                          cartQty > 0 ? (
                            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full py-0.5 px-1.5 gap-2">
                              <button 
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 text-xs font-extrabold hover:bg-slate-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-extrabold text-slate-950 font-mono w-3.5 text-center">{cartQty}</span>
                              <button 
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 text-xs font-extrabold hover:bg-slate-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                            >
                              Add
                            </button>
                          )
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 font-mono">Not Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Mini Cart Bar */}
          {cartItemCount > 0 && !isCartOpen && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white py-3 px-4 rounded-2xl flex items-center justify-between shadow-lg hover:bg-slate-800 transition-transform active:scale-95 z-20"
            >
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-1.5 rounded-lg text-white font-mono text-xs font-bold leading-none">
                  {cartItemCount}
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wide uppercase">View Cart</span>
                  <p className="text-[9px] text-slate-400 font-medium">Review your fresh order details</p>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                <span>${cartTotal.toFixed(2)}</span>
                <ShoppingBag className="w-4 h-4 ml-1" />
              </div>
            </button>
          )}

          {/* Cart Drawer Overlay */}
          {isCartOpen && (
            <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-[32px] max-h-[85%] flex flex-col shadow-2xl relative">
                
                {/* Close handle indicator */}
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setIsCartOpen(false)}></div>
                
                <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShoppingBag className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-sm">Your Selected Items</span>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Close
                  </button>
                </div>

                {/* Items in Drawer */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menuItems.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="min-w-0 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className="text-xs font-bold text-slate-800 truncate block">{item.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">${item.price.toFixed(2)} each</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Qty Editors */}
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                            <button 
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="px-1.5 py-0.5 text-slate-500 hover:text-slate-900 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-bold text-slate-800 font-mono px-1">{qty}</span>
                            <button 
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="px-1.5 py-0.5 text-slate-500 hover:text-slate-900 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold font-mono text-slate-900 w-14 text-right">
                            ${(item.price * (qty as number)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Chef instruction notes */}
                  <div className="mt-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-900" /> Kitchen Instructions (Optional)
                    </label>
                    <textarea
                      placeholder="e.g., Make noodles very spicy, Garlic Naan extra crispy, no garlic in curry..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 h-16 resize-none"
                    />
                  </div>
                </div>

                {/* Totals & Place Order Trigger */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Service Charge (Tax Included)</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold text-sm pt-1.5 border-t border-slate-200">
                      <span>Amount Payable</span>
                      <span className="font-mono text-slate-900">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></div>
                        Submitting Order...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Place Order (Table {tableNumber})
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
