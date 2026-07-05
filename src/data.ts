import { MenuItem, MenuCategory, RestaurantTable } from './types';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'cat-1', name: 'Starters', description: 'Quick bites and street food favorites', display_order: 1 },
  { id: 'cat-2', name: 'Curries', description: 'Rich, aromatic main course curries', display_order: 2 },
  { id: 'cat-3', name: 'Breads & Sides', description: 'Freshly baked naans and premium rices', display_order: 3 },
  { id: 'cat-4', name: 'Main Course', description: 'International favorites', display_order: 4 },
  { id: 'cat-5', name: 'Drinks', description: 'Refreshing local and global beverages', display_order: 5 }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    category_id: 'cat-1',
    name: 'Samosa (2pcs)',
    description: 'Crispy flaky pastry stuffed with seasoned potatoes and green peas, served with sweet tamarind and spicy mint chutneys.',
    price: 5.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-2',
    category_id: 'cat-1',
    name: 'Crispy Spring Rolls',
    description: 'Crisp golden rolls filled with sautéed mixed cabbage, carrots, and glass noodles, served with garlic sweet chili sauce.',
    price: 6.49,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-3',
    category_id: 'cat-2',
    name: 'Butter Chicken',
    description: 'Tender tandoori-grilled chicken cooked in a rich, buttery, spiced tomato cream gravy flavored with fenugreek.',
    price: 14.99,
    is_available: true,
    is_veg: false,
    is_non_veg: true,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-4',
    category_id: 'cat-2',
    name: 'Paneer Butter Masala',
    description: 'Fresh Indian cottage cheese cubes in a rich, sweet tomato paste, slow-cooked in butter and organic cream.',
    price: 12.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-5',
    category_id: 'cat-2',
    name: 'Dal Makhani',
    description: 'Whole black lentils cooked overnight on clay oven coals with butter, fresh tomato puree, and milk cream.',
    price: 10.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-6',
    category_id: 'cat-3',
    name: 'Garlic Naan',
    description: 'Leavened clay oven-baked flatbread glazed with crushed garlic, fresh coriander leaves, and fine butter.',
    price: 3.49,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-7',
    category_id: 'cat-3',
    name: 'Jeera Rice',
    description: 'Fragrant premium Basmati rice tempered with golden cumin seeds and fresh ghee.',
    price: 4.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-8',
    category_id: 'cat-4',
    name: 'Spicy Hunan Noodles',
    description: 'Fresh wheat noodles stir-fried with seasonal bell peppers, hot bird-eye chilies, garlic, and vinegar-soy reduction.',
    price: 11.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: true,
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-9',
    category_id: 'cat-5',
    name: 'Mango Lassi',
    description: 'A traditional thick yogurt-based drink sweetened with pure fresh Alphonso mango pulp.',
    price: 3.99,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'item-10',
    category_id: 'cat-5',
    name: 'Masala Chai',
    description: 'Freshly brewed black loose-leaf tea infused with green cardamom, cloves, cinnamon, and fresh ginger with milk.',
    price: 2.49,
    is_available: true,
    is_veg: true,
    is_non_veg: false,
    is_spicy: false,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 't-1', table_number: 1, qr_code_url: 'https://ais-dev.run.app/menu?table=1', status: 'vacant' },
  { id: 't-2', table_number: 2, qr_code_url: 'https://ais-dev.run.app/menu?table=2', status: 'vacant' },
  { id: 't-3', table_number: 3, qr_code_url: 'https://ais-dev.run.app/menu?table=3', status: 'vacant' },
  { id: 't-4', table_number: 4, qr_code_url: 'https://ais-dev.run.app/menu?table=4', status: 'occupied' },
  { id: 't-5', table_number: 5, qr_code_url: 'https://ais-dev.run.app/menu?table=5', status: 'vacant' },
  { id: 't-6', table_number: 6, qr_code_url: 'https://ais-dev.run.app/menu?table=6', status: 'vacant' }
];
