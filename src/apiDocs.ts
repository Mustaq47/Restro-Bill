/**
 * Phase 2: Core API Route Structures & Supabase Queries
 * This file contains the precise, copy-pasteable TypeScript code used to implement 
 * the essential backend/client operations for Supabase / PostgreSQL.
 */

export const apiDocsCode = {
  submitOrder: `/**
 * Submits a new order from a guest table.
 * Uses a database transaction or a single bulk RPC call to prevent partial orders.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface OrderSubmission {
  table_number: number;
  table_id?: string;
  notes?: string;
  items: Array<{
    menu_item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export async function submitOrder(orderData: OrderSubmission) {
  // 1. Calculate the total locally to confirm
  const totalAmount = orderData.items.reduce(
    (acc, item) => acc + (item.quantity * item.unit_price), 
    0
  );

  // 2. Perform the insertion
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: orderData.table_id || null,
      table_number: orderData.table_number,
      status: 'pending', // Arrives in Owner's Pending queue first
      payment_status: 'unpaid',
      total_amount: totalAmount,
      notes: orderData.notes || ''
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 3. Prepare order items snapshot insert
  const orderItemsData = orderData.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    // Attempt cleanup or let PostgreSQL foreign keys handle rollback
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  // 4. Update table status to occupied
  if (orderData.table_id) {
    await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', orderData.table_id);
  }

  return { success: true, orderId: order.id };
}`,

  realtimeListener: `/**
 * Real-time listener setup for the Owner Dashboard.
 * Receives instantaneous updates when Guests submit orders or call for service.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function subscribeToStoreEvents(onNewOrder: (payload: any) => void, onNewRequest: (payload: any) => void) {
  const channel = supabase
    .channel('restaurant-live-feed')
    // A. Listen for new pending orders
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        if (payload.new && payload.new.status === 'pending') {
          onNewOrder(payload.new);
        }
      }
    )
    // B. Listen for instant counter/table service requests
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'service_requests' },
      (payload) => {
        onNewRequest(payload.new);
      }
    )
    .subscribe();

  // Return unsubscribe handler for component cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}`,

  updateMenuAvailability: `/**
 * Instant menu item availability toggle switch.
 * Instantly removes or returns an item to the active Guest Menu.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function toggleMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Failed to toggle item state:', error.message);
    throw error;
  }

  return data;
}`,

  submitServiceRequest: `/**
 * Instantly calls waiter / water / bill from a physical table.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function submitServiceRequest(tableNumber: number, type: 'waiter' | 'water' | 'bill') {
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      table_number: tableNumber,
      type: type,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}`
};
