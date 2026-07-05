import React, { useState, useEffect } from 'react';
import { 
  RestaurantTable, MenuCategory, MenuItem, Order, OrderItem, 
  ServiceRequest, OrderStatus, PaymentStatus, PaymentMethod, ServiceRequestType,
  User
} from './types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_TABLES } from './data';
import { GuestPhone } from './components/GuestPhone';
import { OwnerDashboard } from './components/OwnerDashboard';
import { DeveloperPanels } from './components/DeveloperPanels';
import { MailAuth } from './components/MailAuth';
import { 
  Sparkles, Terminal, Smartphone, LayoutDashboard, Database, HelpCircle, FileCode, CheckCircle,
  LogOut, User as UserIcon, MonitorCheck, Tablet
} from 'lucide-react';

export default function App() {
  const [activeRootTab, setActiveRootTab] = useState<'demo' | 'developer'>('demo');

  // Authentication State with robust fallback and auto-login
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('current_restaurant_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse current_restaurant_user from localStorage", e);
    }
    
    // Auto-login guest session so they instantly see 'Welcome to Table X' view by default!
    let tNum = 1;
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
        if (tableParam) {
          const parsed = parseInt(tableParam, 10);
          if (!isNaN(parsed) && parsed > 0) tNum = parsed;
        }
      }
    } catch (e) {
      console.error("Failed parsing URL table param", e);
    }

    return { email: `guest.table${tNum}@palaceinn.com`, role: 'guest' };
  });

  // Mobile responsiveness layout view toggles (useful for testing on any screen size)
  const [viewPreference, setViewPreference] = useState<'both' | 'guest' | 'owner'>(() => {
    try {
      const saved = localStorage.getItem('restaurant_view_pref');
      if (saved === 'both' || saved === 'guest' || saved === 'owner') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'both';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('current_restaurant_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_restaurant_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('restaurant_view_pref', viewPreference);
  }, [viewPreference]);

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
  };


  // Application State (Simulating persistent live database tables)
  const [categories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);
  
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-mock-1',
      table_number: 4,
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: 21.47,
      notes: 'No coriander in Butter Chicken please.',
      created_at: new Date(Date.now() - 500000).toISOString()
    }
  ]);

  const [orderItems, setOrderItems] = useState<{ [orderId: string]: OrderItem[] }>({
    'ord-mock-1': [
      {
        id: 'oit-1',
        order_id: 'ord-mock-1',
        menu_item_id: 'item-3',
        name: 'Butter Chicken',
        quantity: 1,
        unit_price: 14.99,
        subtotal: 14.99
      },
      {
        id: 'oit-2',
        order_id: 'ord-mock-1',
        menu_item_id: 'item-6',
        name: 'Garlic Naan',
        quantity: 1,
        unit_price: 3.49,
        subtotal: 3.49
      },
      {
        id: 'oit-3',
        order_id: 'ord-mock-1',
        menu_item_id: 'item-10',
        name: 'Masala Chai',
        quantity: 1,
        unit_price: 2.49,
        subtotal: 2.49
      }
    ]
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: 'sr-mock-1',
      table_number: 4,
      type: 'water',
      status: 'pending',
      created_at: new Date(Date.now() - 300000).toISOString()
    }
  ]);

  // Guest State tracking
  const [guestTableNumber, setGuestTableNumber] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
        if (tableParam) {
          const parsed = parseInt(tableParam, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }
    } catch (e) {
      console.error("Failed parsing table number from URL", e);
    }
    return 1; // Default to Table 1 if no query parameter
  });

  const [activeGuestOrderId, setActiveGuestOrderId] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
        if (tableParam) {
          const parsed = parseInt(tableParam, 10);
          if (parsed === 4) return 'ord-mock-1'; // table 4 has the active mock order loaded
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Sync URL changes dynamically
  useEffect(() => {
    const handleUrlParams = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
        if (tableParam) {
          const parsed = parseInt(tableParam, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setGuestTableNumber(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);
    return () => {
      window.removeEventListener('popstate', handleUrlParams);
    };
  }, []);

  // Printer Selection state
  const [selectedPrintedOrder, setSelectedPrintedOrder] = useState<Order | null>(null);

  // Sync active guest order object helper
  const activeGuestOrder = orders.find(o => o.id === activeGuestOrderId) || null;

  // HANDLER: Instant Menu Availability Switch
  const handleToggleMenuItem = (itemId: string, isAvailable: boolean) => {
    setMenuItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, is_available: isAvailable } : item)
    );
  };

  // HANDLER: Add new menu recipe item (Module B)
  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prev => [...prev, newItem]);
  };

  // HANDLER: Submit guest checkout order
  const handleSubmitOrder = (items: OrderItem[], notes: string) => {
    const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const newOrder: Order = {
      id: orderId,
      table_number: guestTableNumber,
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: totalAmount,
      notes: notes || undefined,
      created_at: new Date().toISOString()
    };

    const formattedItems = items.map(it => ({
      ...it,
      order_id: orderId
    }));

    // Insert into lists
    setOrders(prev => [newOrder, ...prev]);
    setOrderItems(prev => ({ ...prev, [orderId]: formattedItems }));
    setActiveGuestOrderId(orderId);

    // Occupy Table State
    setTables(prev => 
      prev.map(t => t.table_number === guestTableNumber ? { ...t, status: 'occupied' } : t)
    );
  };

  // HANDLER: Call Services
  const handleSubmitServiceRequest = (type: ServiceRequestType) => {
    const req: ServiceRequest = {
      id: 'sr-' + Math.random().toString(36).substring(2, 9),
      table_number: guestTableNumber,
      type,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setServiceRequests(prev => [req, ...prev]);
    setTables(prev => 
      prev.map(t => t.table_number === guestTableNumber ? { ...t, status: 'service_required' } : t)
    );
  };

  // HANDLER: Resolve Service Request
  const handleResolveServiceRequest = (id: string) => {
    setServiceRequests(prev => 
      prev.map(sr => sr.id === id ? { ...sr, status: 'resolved' } : sr)
    );
  };

  // HANDLER: Accept, Reject or change Order status
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(ord => ord.id === orderId ? { ...ord, status } : ord)
    );
    if (status === 'completed') {
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        setTables(prev => 
          prev.map(t => t.table_number === ord.table_number ? { ...t, status: 'vacant' } : t)
        );
      }
    }
  };

  // HANDLER: Process Payment Action
  const handleUpdateOrderPayment = (orderId: string, payment_status: PaymentStatus, payment_method?: PaymentMethod) => {
    setOrders(prev => 
      prev.map(ord => ord.id === orderId ? { ...ord, payment_status, payment_method } : ord)
    );
  };

  // HANDLER: Manual POS Order Booking
  const handlePlaceWalkInOrder = (tableNum: number, items: OrderItem[], notes: string) => {
    const orderId = 'ord-pos-' + Math.random().toString(36).substring(2, 9);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const walkInOrder: Order = {
      id: orderId,
      table_number: tableNum,
      status: 'accepted', // Walk in orders bypass pending queues!
      payment_status: 'unpaid',
      total_amount: totalAmount,
      notes: notes || undefined,
      created_at: new Date().toISOString()
    };

    const formattedItems = items.map(it => ({
      ...it,
      order_id: orderId
    }));

    setOrders(prev => [walkInOrder, ...prev]);
    setOrderItems(prev => ({ ...prev, [orderId]: formattedItems }));
    
    // Instantly queue this walk-in order to print KOT
    setSelectedPrintedOrder(walkInOrder);
  };

  // HANDLER: Guest Pay Action simulation
  const handlePayOrder = () => {
    if (!activeGuestOrderId) return;
    handleUpdateOrderPayment(activeGuestOrderId, 'paid', 'digital');
    alert('💳 Simulated UPI Card sandbox checkout success! Payment status updated to PAID.');
  };

  // Static DDL Schema code to render
  const sqlSchemaSource = `-- PostgreSQL Database Schema (Supabase/Postgres)
-- Tables for tables, menu_categories, menu_items, orders, order_items, service_requests
-- Includes proper FKs and status constraints

CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'digital');
CREATE TYPE service_request_type AS ENUM ('waiter', 'water', 'bill');
CREATE TYPE service_request_status AS ENUM ('pending', 'resolved');

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INT NOT NULL UNIQUE CHECK (table_number > 0),
    qr_code_url TEXT,
    status VARCHAR(50) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'service_required')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_veg BOOLEAN NOT NULL DEFAULT FALSE,
    is_non_veg BOOLEAN NOT NULL DEFAULT FALSE,
    is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    table_number INT NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    payment_method payment_method,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    table_number INT NOT NULL,
    type service_request_type NOT NULL,
    status service_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  // Static Formatter code to render
  const kotFormatterSource = `import { Order, OrderItem } from '../types';

export const KITCHEN_TRANSLATIONS: Record<string, string> = {
  "Butter Chicken": "बटर चिकन (Butter Chicken)",
  "Garlic Naan": "लहसुन नान (Garlic Naan)",
  "Paneer Butter Masala": "पनीर मसाला (Paneer Masala)",
  "Jeera Rice": "जीरा चावल (Jeera Rice)",
  "Dal Makhani": "दाल मखनी (Dal Makhani)",
  "Masala Chai": "मसाला चाय (Masala Chai)",
  "Mango Lassi": "मैंगो लस्सी (Mango Lassi)",
  "Samosa (2pcs)": "समोसा 2 पीस (Samosa)",
  "Crispy Spring Rolls": "स्प्रिंग रोल (Spring Roll)",
  "Spicy Hunan Noodles": "तीखा नूडल्स (Spicy Noodles)"
};

export function formatKitchenReceipt(order: Order, items: OrderItem[], language: 'EN' | 'LOCAL' = 'LOCAL'): string {
  const lineLength = 40;
  const separator = "-".repeat(lineLength);
  const doubleSeparator = "=".repeat(lineLength);
  let output: string[] = [];

  output.push("=".repeat(12) + " KITCHEN ORDER " + "=".repeat(13));
  output.push(centerText(\`TABLE #: \${order.table_number}\`, lineLength));
  output.push(doubleSeparator);

  output.push(\`Date: \${new Date(order.created_at).toLocaleDateString()}\`);
  output.push(\`Time: \${new Date(order.created_at).toLocaleTimeString()}\`);
  output.push(\`Order ID: #\${order.id.slice(0, 8).toUpperCase()}\`);
  output.push(separator);

  output.push(padRight("QTY", 6) + "ITEM DESCRIPTION");
  output.push(separator);

  items.forEach((item) => {
    const qtyStr = \`\${item.quantity}x\`.padEnd(6);
    let displayName = item.name;
    if (language === 'LOCAL' && KITCHEN_TRANSLATIONS[item.name]) {
      displayName = KITCHEN_TRANSLATIONS[item.name];
    }
    output.push(qtyStr + displayName);
  });

  if (order.notes) {
    output.push(separator);
    output.push("⚠️ KITCHEN INSTRUCTIONS:");
    output.push(\`  \${order.notes}\`);
  }
  output.push(separator);
  output.push(centerText("*** [START PREPARING NOW] ***", lineLength));
  return output.join("\\n");
}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      
      {/* Upper Navigation Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            🍽️
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
              Digital-Analog Restaurant Bridge
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">High-Speed Guest Checkout & Thermal Kitchen Printer System</p>
          </div>
        </div>

        {/* If user is logged in, show context actions */}
        {user && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Admin view controls (Only shown for Admin roles) */}
            {user.role === 'admin' && activeRootTab === 'demo' && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
                <button
                  onClick={() => setViewPreference('both')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewPreference === 'both' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Side-by-Side Simulator"
                >
                  Dual Sim
                </button>
                <button
                  onClick={() => setViewPreference('guest')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewPreference === 'guest' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Guest Menu Only"
                >
                  Guest Screen
                </button>
                <button
                  onClick={() => setViewPreference('owner')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewPreference === 'owner' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Owner Terminal Only"
                >
                  Owner Terminal
                </button>
              </div>
            )}

            {/* Root Tabs switcher - only for admin */}
            {user.role === 'admin' && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setActiveRootTab('demo')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRootTab === 'demo'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Live Demo
                </button>
                <button
                  onClick={() => setActiveRootTab('developer')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRootTab === 'developer'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  APIs & DDL
                </button>
              </div>
            )}

            {/* Session details */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-bold text-slate-900 max-w-[120px] truncate">{user.email}</p>
                <p className="text-[8px] font-mono uppercase tracking-wider text-slate-400">
                  {user.role === 'admin' ? '🔥 Admin' : '👤 Guest User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto overflow-hidden">
        {!user ? (
          <div className="h-full flex items-center justify-center py-12">
            <MailAuth onLogin={(loggedInUser) => setUser(loggedInUser)} />
          </div>
        ) : (
          <>
            {/* Render Guest View (when user is normal guest OR admin viewing Guest preference) */}
            {((user.role === 'guest') || (user.role === 'admin' && viewPreference === 'guest' && activeRootTab === 'demo')) && (
              <div className="max-w-md mx-auto flex flex-col items-center justify-center h-full">
                {user.role === 'admin' && (
                  <div className="text-center mb-4 bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-xl text-xs font-mono text-slate-500 w-full flex items-center justify-center gap-2">
                    <Tablet className="w-4 h-4" />
                    <span>Admin Sandbox View: Guest Phone Simulator</span>
                  </div>
                )}
                <GuestPhone
                  categories={categories}
                  menuItems={menuItems}
                  tableNumber={guestTableNumber}
                  onTableChange={(num) => {
                    setGuestTableNumber(num);
                    setActiveGuestOrderId(null);
                  }}
                  onSubmitOrder={handleSubmitOrder}
                  onSubmitServiceRequest={handleSubmitServiceRequest}
                  activeGuestOrder={activeGuestOrder}
                  onPayOrder={handlePayOrder}
                />
              </div>
            )}

            {/* Render Owner View (when user is admin and viewing Owner preference) */}
            {user.role === 'admin' && viewPreference === 'owner' && activeRootTab === 'demo' && (
              <div className="flex flex-col h-full">
                <OwnerDashboard
                  categories={categories}
                  menuItems={menuItems}
                  onToggleMenuItem={handleToggleMenuItem}
                  onAddMenuItem={handleAddMenuItem}
                  orders={orders}
                  orderItems={orderItems}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onUpdateOrderPayment={handleUpdateOrderPayment}
                  serviceRequests={serviceRequests}
                  onResolveServiceRequest={handleResolveServiceRequest}
                  onPlaceWalkInOrder={handlePlaceWalkInOrder}
                  selectedPrintedOrder={selectedPrintedOrder}
                  setSelectedPrintedOrder={setSelectedPrintedOrder}
                />
              </div>
            )}

            {/* Render Dual Simulator (when user is admin and viewing Both preference) */}
            {user.role === 'admin' && viewPreference === 'both' && activeRootTab === 'demo' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch h-full">
                
                {/* Left Column: Guest Simulator */}
                <div className="xl:col-span-4 flex flex-col justify-center items-center">
                  <div className="text-center mb-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Role A: Guest Simulator</span>
                    <h2 className="text-sm font-bold text-slate-900">Guest Mobile QR Experience</h2>
                    <p className="text-[10px] text-slate-500 leading-tight">Simulates physical Table {guestTableNumber} menu lookup.</p>
                  </div>

                  <GuestPhone
                    categories={categories}
                    menuItems={menuItems}
                    tableNumber={guestTableNumber}
                    onTableChange={(num) => {
                      setGuestTableNumber(num);
                      setActiveGuestOrderId(null);
                    }}
                    onSubmitOrder={handleSubmitOrder}
                    onSubmitServiceRequest={handleSubmitServiceRequest}
                    activeGuestOrder={activeGuestOrder}
                    onPayOrder={handlePayOrder}
                  />
                </div>

                {/* Right Column: Owner Dashboard */}
                <div className="xl:col-span-8 flex flex-col">
                  <div className="text-center xl:text-left mb-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Role B: Kitchen & Payout Admin</span>
                    <h2 className="text-sm font-bold text-slate-900">Owner Dashboard & Analog Kitchen Bridge</h2>
                    <p className="text-[10px] text-slate-500 leading-tight">Accepts live digital requests, prints physical receipts, and toggles stock.</p>
                  </div>

                  <div className="flex-1">
                    <OwnerDashboard
                      categories={categories}
                      menuItems={menuItems}
                      onToggleMenuItem={handleToggleMenuItem}
                      onAddMenuItem={handleAddMenuItem}
                      orders={orders}
                      orderItems={orderItems}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      onUpdateOrderPayment={handleUpdateOrderPayment}
                      serviceRequests={serviceRequests}
                      onResolveServiceRequest={handleResolveServiceRequest}
                      onPlaceWalkInOrder={handlePlaceWalkInOrder}
                      selectedPrintedOrder={selectedPrintedOrder}
                      setSelectedPrintedOrder={setSelectedPrintedOrder}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Render Developer Tab */}
            {user.role === 'admin' && activeRootTab === 'developer' && (
              <div className="h-[640px]">
                <DeveloperPanels 
                  sqlSchema={sqlSchemaSource}
                  kotFormatterSource={kotFormatterSource}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-400 py-4 px-6 border-t border-slate-200 text-center text-[10px] font-mono">
        The Palace Inn Restaurant Stack © 2026 • Built in compliance with Thermal printer charmaps & PostgreSQL specifications.
      </footer>

    </div>
  );
}

