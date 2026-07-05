import React, { useState, useMemo } from 'react';
import { 
  Order, OrderItem, MenuItem, MenuCategory, ServiceRequest, 
  OrderStatus, PaymentMethod, PaymentStatus
} from '../types';
import { 
  TrendingUp, Users, Printer, RefreshCw, Layers, ShieldCheck, 
  Plus, Minus, CircleAlert, CheckCircle, Flame, ToggleLeft, ToggleRight,
  ClipboardList, Check, DollarSign, BarChart3, Trash2, Globe
} from 'lucide-react';
import { formatKitchenReceipt } from '../utils/kotFormatter';

interface OwnerDashboardProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onToggleMenuItem: (id: string, isAvailable: boolean) => void;
  onAddMenuItem: (item: MenuItem) => void;
  orders: Order[];
  orderItems: { [orderId: string]: OrderItem[] };
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onUpdateOrderPayment: (id: string, status: PaymentStatus, method?: PaymentMethod) => void;
  serviceRequests: ServiceRequest[];
  onResolveServiceRequest: (id: string) => void;
  onPlaceWalkInOrder: (tableNumber: number, items: OrderItem[], notes: string) => void;
  selectedPrintedOrder: Order | null;
  setSelectedPrintedOrder: (order: Order | null) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  categories,
  menuItems,
  onToggleMenuItem,
  onAddMenuItem,
  orders,
  orderItems,
  onUpdateOrderStatus,
  onUpdateOrderPayment,
  serviceRequests,
  onResolveServiceRequest,
  onPlaceWalkInOrder,
  selectedPrintedOrder,
  setSelectedPrintedOrder
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'pos' | 'eod' | 'analytics'>('analytics');
  
  // Walk-In POS state
  const [posTable, setPosTable] = useState<number>(1);
  const [posCart, setPosCart] = useState<{ [itemId: string]: number }>({});
  const [posNotes, setPosNotes] = useState('');

  // Live dashboard polling simulation (Module A)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('idle');
        setLastSyncTime(new Date().toLocaleTimeString());
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Add Recipe Form State (Module B)
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipePrice, setRecipePrice] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [recipeIsVeg, setRecipeIsVeg] = useState(false);
  const [recipeIsNonVeg, setRecipeIsNonVeg] = useState(false);
  const [recipeIsSpicy, setRecipeIsSpicy] = useState(false);
  const [recipeError, setRecipeError] = useState('');
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);

  // KOT Translation flag
  const [kotLanguage, setKotLanguage] = useState<'EN' | 'LOCAL'>('LOCAL');

  // Pending approval list
  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending');
  }, [orders]);

  // Active kitchen list
  const activeKitchenOrders = useMemo(() => {
    return orders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  }, [orders]);

  // Finished orders
  const finishedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
  }, [orders]);

  // Service requests
  const pendingServiceRequests = useMemo(() => {
    return serviceRequests.filter(sr => sr.status === 'pending');
  }, [serviceRequests]);

  // Sales Stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let orderCount = 0;
    let cashRevenue = 0;
    let digitalRevenue = 0;
    const itemVolume: { [name: string]: number } = {};

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        orderCount++;
        totalRevenue += order.total_amount;
        if (order.payment_status === 'paid') {
          if (order.payment_method === 'cash') cashRevenue += order.total_amount;
          else digitalRevenue += order.total_amount;
        }

        // Aggregate item counts
        const items = orderItems[order.id] || [];
        items.forEach(it => {
          itemVolume[it.name] = (itemVolume[it.name] || 0) + it.quantity;
        });
      }
    });

    const topSellingItems = Object.entries(itemVolume)
      .map(([name, quantity]) => {
        const menuItem = menuItems.find(m => m.name === name);
        const price = menuItem ? menuItem.price : 10.00;
        return { name, quantity, revenue: quantity * price };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { totalRevenue, orderCount, cashRevenue, digitalRevenue, topSellingItems };
  }, [orders, orderItems, menuItems]);

  // POS Add Handlers
  const handlePosAddToCart = (itemId: string) => {
    setPosCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handlePosRemoveFromCart = (itemId: string) => {
    setPosCart(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const posTotal = useMemo(() => {
    return Object.entries(posCart).reduce((acc, [itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId);
      const qtyNum = qty as number;
      return acc + (item ? item.price * qtyNum : 0);
    }, 0);
  }, [posCart, menuItems]);

  const handlePOSCheckout = () => {
    const keys = Object.keys(posCart);
    if (keys.length === 0) return;

    const items: OrderItem[] = keys.map(itemId => {
      const item = menuItems.find(m => m.id === itemId)!;
      return {
        id: Math.random().toString(),
        order_id: '',
        menu_item_id: item.id,
        name: item.name,
        quantity: posCart[itemId],
        unit_price: item.price,
        subtotal: item.price * posCart[itemId]
      };
    });

    onPlaceWalkInOrder(posTable, items, posNotes);
    setPosCart({});
    setPosNotes('');
    alert('🛒 Walk-In Order Submitted and accepted immediately! KOT printed.');
  };

  // Recipe creation handlers (Module B)
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientInput.trim()) {
      if (!ingredientList.includes(ingredientInput.trim())) {
        setIngredientList(prev => [...prev, ingredientInput.trim()]);
      }
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    setRecipeError('');

    if (!recipeName.trim()) {
      setRecipeError('Menu Item Name cannot be empty.');
      return;
    }

    const priceNum = parseFloat(recipePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setRecipeError('Price cannot be negative or invalid.');
      return;
    }

    const selectedCat = recipeCategory || (categories[0]?.id || '');

    setIsSubmittingRecipe(true);

    // Simulate database write with loading spinner latency
    setTimeout(() => {
      const newItem: MenuItem = {
        id: 'item-recipe-' + Math.random().toString(36).substring(2, 9),
        category_id: selectedCat,
        name: recipeName.trim(),
        description: recipeDescription.trim() || 'No description provided.',
        price: priceNum,
        is_available: true,
        is_veg: recipeIsVeg,
        is_non_veg: recipeIsNonVeg,
        is_spicy: recipeIsSpicy,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Delicious default styling placeholder
        recipe_instructions: recipeInstructions.trim() || 'No instructions provided.',
        ingredients: ingredientList.length > 0 ? ingredientList.join(', ') : 'No special tracking ingredients.'
      };

      onAddMenuItem(newItem);

      // Clean form fields
      setRecipeName('');
      setRecipePrice('');
      setRecipeDescription('');
      setRecipeInstructions('');
      setIngredientList([]);
      setRecipeIsVeg(false);
      setRecipeIsNonVeg(false);
      setRecipeIsSpicy(false);
      setIsSubmittingRecipe(false);
      setShowAddRecipe(false);
      alert('👨‍🍳 SUCCESS: Menu Recipe saved and published to live digital menus!');
    }, 1000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col text-slate-800">
      
      {/* Top Banner Header */}
      <header className="bg-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-lg shadow-sm font-bold">
            🏢
          </div>
          <div>
            <h1 className="text-md font-bold text-slate-900 tracking-tight flex items-center gap-2">
              The Palace Inn - Owner Dashboard
              <span className="bg-slate-100 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200">Tablet Admin</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono">Central Command & Analog Kitchen Bridge</p>
          </div>
        </div>

        {/* Real-time Indicator Panel */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Active</span>
          </div>
          <div className="text-slate-500">
            Pending Orders: <span className="font-bold text-slate-900">{pendingOrders.length}</span>
          </div>
        </div>
      </header>

      {/* Mode Switches */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Daily Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'orders' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Order Queue ({pendingOrders.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'pos' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          Walk-In POS Grid
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'menu' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Instant Menu Toggles
        </button>
        <button
          onClick={() => setActiveTab('eod')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'eod' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          EOD Reconciliation
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Interactive Content Area */}
        <div className="lg:col-span-8 overflow-y-auto p-6 space-y-6 border-r border-slate-200">
          
          {/* TAB 0: ADMIN DAILY SALES ANALYTICS (Module A) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Header with Live Sync Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-900 text-white rounded-xl p-4 shadow-sm gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Daily Operations & Financial Analytics
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Real-time transaction flow, register reconciliation, and active guest checkout tracking.
                  </p>
                </div>

                {/* Polling Indicator */}
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-mono shrink-0 self-start sm:self-auto">
                  <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span className="text-slate-200">
                    {syncStatus === 'syncing' ? 'Polling database...' : 'Live Polling Active'}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Sync: {lastSyncTime}</span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Gross Revenue Today</span>
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-mono">
                      ${orders.reduce((sum, o) => o.payment_status === 'paid' ? sum + o.total_amount : sum, 0).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">
                      From ${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} in total bookings
                    </p>
                  </div>
                </div>

                {/* Orders Completed Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Completed Orders</span>
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-mono">
                      {orders.filter(o => o.status === 'completed').length}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">
                      {orders.filter(o => o.status === 'pending').length} pending in kitchen queue
                    </p>
                  </div>
                </div>

                {/* AOV Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Average Order Value (AOV)</span>
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-mono">
                      ${(() => {
                        const paidOrders = orders.filter(o => o.payment_status === 'paid');
                        if (paidOrders.length > 0) {
                          const paidSum = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
                          return paidSum / paidOrders.length;
                        }
                        return orders.length > 0 
                          ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length 
                          : 0;
                      })().toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">
                      Calculated across settled payouts
                    </p>
                  </div>
                </div>

                {/* Cash vs Digital Split */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Revenue Split (Settled)</span>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      const cashRev = orders.filter(o => o.payment_status === 'paid' && o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);
                      const digRev = orders.filter(o => o.payment_status === 'paid' && (o.payment_method === 'upi' || o.payment_method === 'card' || o.payment_method === 'digital')).reduce((sum, o) => sum + o.total_amount, 0);
                      const totalRev = cashRev + digRev;
                      const cashPct = totalRev > 0 ? Math.round((cashRev / totalRev) * 100) : 0;
                      const digPct = totalRev > 0 ? Math.round((digRev / totalRev) * 100) : 0;

                      return (
                        <>
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 font-mono">
                            <span>Cash: {cashPct}%</span>
                            <span>Digital: {digPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="bg-amber-500 h-full" style={{ width: `${totalRev > 0 ? (cashRev / totalRev) * 100 : 50}%` }} title={`Cash: $${cashRev.toFixed(2)}`}></div>
                            <div className="bg-indigo-600 h-full flex-1" style={{ width: `${totalRev > 0 ? (digRev / totalRev) * 100 : 50}%` }} title={`Digital: $${digRev.toFixed(2)}`}></div>
                          </div>
                          <p className="text-[8px] text-slate-400 font-mono text-center pt-1 leading-none">
                            Cash: ${cashRev.toFixed(2)} | Dig: ${digRev.toFixed(2)}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Real-time Order Log Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-slate-700" />
                    Incoming Real-time Order Transactions Log
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Click row to preview in Thermal Printer</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-mono border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Table #</th>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Total Amount</th>
                        <th className="py-2.5 px-3">Payment Status</th>
                        <th className="py-2.5 px-3">Payment Method</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {orders.map(order => (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedPrintedOrder(order)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedPrintedOrder?.id === order.id ? 'bg-indigo-50/40' : ''}`}
                        >
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                            Table {order.table_number}
                          </td>
                          <td className="py-2.5 px-3 text-[10px] text-slate-400">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            ${order.total_amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                              order.payment_status === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : order.payment_status === 'failed'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[10px]">
                            {order.payment_method ? (
                              <span className="capitalize bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                {order.payment_method}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[10px] text-slate-400 font-sans">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ORDER QUEUES */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Service Requests Alarm Header */}
              {pendingServiceRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <CircleAlert className="w-4 h-4 text-amber-600 animate-bounce" />
                      Active Guest Service Alarms ({pendingServiceRequests.length})
                    </span>
                    <span className="text-[10px] text-amber-600 font-mono">Requires instant waiter dispatch</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pendingServiceRequests.map(req => (
                      <div key={req.id} className="bg-white border border-amber-100 p-2.5 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">Table {req.table_number}</span>
                          <span className="text-slate-500 mx-1.5">•</span>
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded capitalize">
                            {req.type === 'waiter' ? '🛎️ Call Waiter' : req.type === 'water' ? '💧 Bring Water' : '🧾 Request Bill'}
                          </span>
                        </div>
                        <button
                          onClick={() => onResolveServiceRequest(req.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-colors"
                        >
                          Resolve ✓
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Pending Approval Orders (Arrive via Real-time sync) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-ping"></span>
                  Pending Guest Orders ({pendingOrders.length})
                </h3>
                
                {pendingOrders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">No pending orders. Awaiting live guest submissions...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map(order => {
                      const items = orderItems[order.id] || [];
                      return (
                        <div key={order.id} className="bg-slate-50 rounded-xl border-2 border-slate-100 p-4 shadow-sm space-y-3 hover:border-slate-200 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2.5 gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-800 font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded">
                                  Pending Approval
                                </span>
                                <span className="text-xs font-bold text-slate-800">Table {order.table_number}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: #{order.id.slice(0,6).toUpperCase()}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-mono">${order.total_amount.toFixed(2)}</span>
                          </div>

                          {/* Items Grid */}
                          <div className="space-y-1.5">
                            {items.map(it => (
                              <div key={it.id} className="flex justify-between text-xs text-slate-600 font-mono">
                                <span>{it.quantity}x {it.name}</span>
                                <span>${it.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-950 font-medium italic font-sans">
                              ⚠️ Kitchen Instruction Notes: "{order.notes}"
                            </div>
                          )}

                          {/* Action Controls */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-mono">
                              Received: {new Date(order.created_at).toLocaleTimeString()}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, 'accepted');
                                  // Auto set printable order so printer flashes instantly!
                                  setSelectedPrintedOrder(order);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" /> Accept & Print KOT
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: Active Kitchen Queue */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Active Kitchen Queue ({activeKitchenOrders.length})
                </h3>

                {activeKitchenOrders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">No active kitchen preparation. Accepted orders appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeKitchenOrders.map(order => {
                      const items = orderItems[order.id] || [];
                      return (
                        <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">Table {order.table_number}</span>
                              <span className="text-[10px] text-slate-400 font-mono">#{order.id.slice(0,6).toUpperCase()}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                order.status === 'accepted' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-mono">${order.total_amount.toFixed(2)}</span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600 font-mono">
                            {items.map(it => (
                              <div key={it.id}>
                                {it.quantity}x {it.name}
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-100 gap-2">
                            {/* Payment Toggle */}
                            <div className="flex items-center gap-2">
                              {order.payment_status === 'unpaid' ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onUpdateOrderPayment(order.id, 'paid', 'cash')}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                                  >
                                    💵 Cash Paid
                                  </button>
                                  <button
                                    onClick={() => onUpdateOrderPayment(order.id, 'paid', 'digital')}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                                  >
                                    💳 Digital Paid
                                  </button>
                                </div>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded capitalize flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Paid via {order.payment_method}
                                </span>
                              )}
                            </div>

                            {/* Status controls */}
                            <div className="flex gap-1.5 self-end sm:self-auto">
                              <button
                                onClick={() => setSelectedPrintedOrder(order)}
                                className="bg-slate-100 hover:bg-slate-200 border text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded"
                                title="Reprint KOT"
                              >
                                📄 Reprint
                              </button>
                              {order.status === 'accepted' ? (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1 rounded transition-colors shadow-sm"
                                >
                                  Start Cooking 🍳
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1 rounded transition-colors shadow-sm"
                                >
                                  Complete Order ✓
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: WALK-IN POS GRID */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* POS Left: Grid Catalogue */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Menu Items Quick-Add Grid
                </h3>
                
                {categories.map(cat => {
                  const catItems = menuItems.filter(m => m.category_id === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">{cat.name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catItems.map(item => {
                          const qty = posCart[item.id] || 0;
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => item.is_available && handlePosAddToCart(item.id)}
                              className={`bg-white rounded-xl border p-2.5 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors ${
                                item.is_available ? 'border-slate-200' : 'opacity-50 pointer-events-none'
                              }`}
                            >
                              <div className="min-w-0 pr-3">
                                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">${item.price.toFixed(2)}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {qty > 0 ? (
                                  <div className="flex items-center bg-slate-900 text-white rounded-lg px-2 py-0.5 gap-2 text-xs">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handlePosRemoveFromCart(item.id); }}
                                      className="font-bold hover:text-rose-400 font-mono"
                                    >
                                      -
                                    </button>
                                    <span className="font-mono font-bold w-3 text-center">{qty}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handlePosAddToCart(item.id); }}
                                      className="font-bold hover:text-rose-400 font-mono"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded">
                                    + Add
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* POS Right: Manual Order checkout block */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-fit space-y-4">
                <div className="border-b pb-3 space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Walk-In Ticket details
                  </h3>
                  
                  {/* Select table */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Assign Table:</span>
                    <select 
                      value={posTable}
                      onChange={(e) => setPosTable(parseInt(e.target.value))}
                      className="bg-slate-50 border text-xs font-bold rounded-lg p-1.5 text-slate-800 focus:outline-none focus:border-indigo-400"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>Physical Table {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex-1 space-y-2 max-h-56 overflow-y-auto">
                  {Object.keys(posCart).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Select menu items from grid on left</p>
                  ) : (
                    Object.entries(posCart).map(([itemId, qty]) => {
                      const item = menuItems.find(m => m.id === itemId)!;
                      const qtyNum = qty as number;
                      return (
                        <div key={itemId} className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-1.5">
                          <span className="truncate pr-2">{qtyNum}x {item.name}</span>
                          <span className="font-mono font-bold text-slate-800">${(item.price * qtyNum).toFixed(2)}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">POS Kitchen notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, gluten-free, allergy warning..."
                    value={posNotes}
                    onChange={(e) => setPosNotes(e.target.value)}
                    className="w-full bg-slate-50 border text-xs rounded-xl p-2 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Grand Total:</span>
                    <span className="font-mono text-indigo-600">${posTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePOSCheckout}
                    disabled={Object.keys(posCart).length === 0}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Place & Print Kitchen Ticket
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INSTANT MENU TOGGLES (Module B) */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Top Admin Action Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Interactive Menu & Back-Office Recipes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage guest-facing digital menus and record secret kitchen instructions for the analog cooking staff.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddRecipe(!showAddRecipe);
                    if (!recipeCategory && categories.length > 0) {
                      setRecipeCategory(categories[0].id);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {showAddRecipe ? 'Cancel Form' : 'Add New Recipe Item'}
                </button>
              </div>

              {/* Collapsible Add Recipe Form (Module B) */}
              {showAddRecipe && (
                <form onSubmit={handleSaveRecipe} className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-md">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
                      🧑‍🍳 Back-Office Recipe Creation Portal
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Define metadata, ingredients tracking, and private preparations.</p>
                  </div>

                  {recipeError && (
                    <div className="p-3 bg-red-950 border border-red-900 text-red-300 rounded-xl text-xs font-semibold">
                      ⚠️ {recipeError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tandoori Pomfret"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Base Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 18.99"
                        value={recipePrice}
                        onChange={(e) => setRecipePrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Category Dropdown *
                      </label>
                      <select
                        value={recipeCategory}
                        onChange={(e) => setRecipeCategory(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Filters */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Dietary & Taste Profile Tags
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <label className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer text-xs select-none hover:bg-slate-750">
                          <input
                            type="checkbox"
                            checked={recipeIsVeg}
                            onChange={(e) => {
                              setRecipeIsVeg(e.target.checked);
                              if (e.target.checked) setRecipeIsNonVeg(false);
                            }}
                            className="rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                          />
                          <span className="text-emerald-400 font-bold text-[10px] uppercase font-mono">Veg</span>
                        </label>
                        <label className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer text-xs select-none hover:bg-slate-750">
                          <input
                            type="checkbox"
                            checked={recipeIsNonVeg}
                            onChange={(e) => {
                              setRecipeIsNonVeg(e.target.checked);
                              if (e.target.checked) setRecipeIsVeg(false);
                            }}
                            className="rounded text-red-500 bg-slate-900 border-slate-700 focus:ring-0"
                          />
                          <span className="text-red-400 font-bold text-[10px] uppercase font-mono">Non-Veg</span>
                        </label>
                        <label className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer text-xs select-none hover:bg-slate-750">
                          <input
                            type="checkbox"
                            checked={recipeIsSpicy}
                            onChange={(e) => setRecipeIsSpicy(e.target.checked)}
                            className="rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                          />
                          <span className="text-amber-400 font-bold text-[10px] uppercase font-mono">Spicy</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Description textarea */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Guest-Facing Menu Description *
                    </label>
                    <textarea
                      placeholder="Describe the dish for customers reading the digital menu..."
                      value={recipeDescription}
                      onChange={(e) => setRecipeDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                      required
                    />
                  </div>

                  {/* Recipe/Ingredients Section: Dynamic List Input */}
                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                        Key Structural Ingredients Tracking (Dynamic List Input)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Basmati Rice, Boneless Chicken Breast, Saffron"
                          value={ingredientInput}
                          onChange={(e) => setIngredientInput(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIngredient(e);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddIngredient}
                          className="bg-slate-750 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                        >
                          Add Tag
                        </button>
                      </div>

                      {/* Ingredient list display badges */}
                      {ingredientList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {ingredientList.map((ing, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded-lg text-[10px] font-mono border border-slate-700">
                              {ing}
                              <button
                                type="button"
                                onClick={() => handleRemoveIngredient(idx)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No tracking ingredients listed yet. Enter a value above and click Add Tag.</p>
                      )}
                    </div>

                    {/* Private Kitchen prep instructions */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                        👨‍🍳 Private Kitchen Prep Recipe Details (Back-Office Only)
                      </label>
                      <textarea
                        placeholder="Private instructions for the chefs (e.g. Marinate for 12 hours in greek yogurt, cook in clay oven at 450C)..."
                        value={recipeInstructions}
                        onChange={(e) => setRecipeInstructions(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddRecipe(false)}
                      className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRecipe}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2"
                    >
                      {isSubmittingRecipe ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Publishing Recipe...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Publish & Save Recipe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Real-time Out-of-Stock Switchboard */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Real-time Out-of-Stock Switchboard
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Flip any switch to instantly remove the item from the Guest-Facing digital menu. Restores immediately when switched back.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="truncate pr-3">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {categories.find(c => c.id === item.category_id)?.name} • ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        item.is_available ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {item.is_available ? 'IN STOCK' : 'SOLD OUT'}
                      </span>
                      <button
                        onClick={() => onToggleMenuItem(item.id, !item.is_available)}
                        className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                      >
                        {item.is_available ? (
                          <ToggleRight className="w-9 h-9 text-indigo-600 cursor-pointer" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-slate-300 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: END-OF-DAY RECONCILIATION */}
          {activeTab === 'eod' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  EOD Reconciliation Metrics
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track revenue flow, order volume statistics, and item velocities to reconcile register drawer payouts.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Gross Daily Revenue</span>
                  <p className="text-2xl font-bold text-indigo-600 font-mono">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">From {stats.orderCount} accepted orders</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Digital Payment Payouts</span>
                  <p className="text-2xl font-bold text-emerald-600 font-mono">${stats.digitalRevenue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">UPI & Credit Card Settlements</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cash Collection (In Hand)</span>
                  <p className="text-2xl font-bold text-amber-600 font-mono">${stats.cashRevenue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">To be matched with till drawer</p>
                </div>
              </div>

              {/* Top selling items */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  🔥 Best Seller Culinary Velocity
                </h4>
                
                {stats.topSellingItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Accept orders in the approval queue to calculate top items</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topSellingItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-none">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold font-mono">#{idx+1}</span>
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <div className="space-x-4 font-mono text-[11px]">
                          <span className="text-slate-500">{item.quantity} portions</span>
                          <span className="font-bold text-slate-900">${item.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Columns Area: Kitchen Printer Simulator */}
        <div className="lg:col-span-4 bg-slate-100 p-6 flex flex-col justify-start items-center space-y-4">
          <div className="w-full text-center space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <Printer className="w-4 h-4 text-slate-600" />
              Kitchen Printer Simulator
            </h3>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              Mimics a physical 58mm/80mm thermal print terminal.
            </p>
          </div>

          {/* Translation Switch controls */}
          <div className="flex items-center justify-between w-full max-w-[270px] bg-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-700">
            <span>KOT translation:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setKotLanguage('EN')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  kotLanguage === 'EN' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                English Only
              </button>
              <button
                onClick={() => setKotLanguage('LOCAL')}
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
                  kotLanguage === 'LOCAL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Globe className="w-2.5 h-2.5" /> Hindi (Regional)
              </button>
            </div>
          </div>

          {/* Printer Output Box */}
          {selectedPrintedOrder ? (
            <div className="relative w-full max-w-[270px] drop-shadow-lg">
              
              {/* Paper tear jagged top effect */}
              <div className="absolute -top-2 left-0 right-0 h-2 bg-white" style={{
                clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
              }}></div>

              {/* Receipt Body */}
              <div className="bg-white p-5 border-x border-slate-300 font-mono text-[10px] leading-[1.3] text-slate-900 shadow-sm overflow-hidden whitespace-pre select-all select-none">
                {formatKitchenReceipt(
                  selectedPrintedOrder, 
                  orderItems[selectedPrintedOrder.id] || [], 
                  kotLanguage
                )}
              </div>

              {/* Paper tear jagged bottom effect */}
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-white" style={{
                clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
              }}></div>

              {/* Copy printed content */}
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    const txt = formatKitchenReceipt(selectedPrintedOrder, orderItems[selectedPrintedOrder.id] || [], kotLanguage);
                    navigator.clipboard.writeText(txt);
                    alert('📋 Printed KOT text copied to clipboard!');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border shadow-sm flex items-center gap-1 mx-auto"
                >
                  <Printer className="w-3 h-3" /> Copy Raw Receipt Text
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-200/50 border border-slate-300 border-dashed rounded-xl w-full max-w-[270px] py-16 px-4 text-center text-slate-400 space-y-1">
              <Printer className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Printer Offline</p>
              <p className="text-[9px] leading-tight">Accept a guest order in the approval queue, or place a manual walk-in order to print KOT paper tickets.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
