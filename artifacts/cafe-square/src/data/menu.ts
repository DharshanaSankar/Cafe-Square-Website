export const categories = [
  'Tea & Coffee', 'Mojitos & Coolers', 'Sandwiches', 'Fries', 'Momos',
  'Maggi', 'Burgers', 'Popcorn', 'Pizza', 'Pasta', 'Desserts',
] as const;

export type MenuItem = { id: string; name: string; category: typeof categories[number]; description: string; price: number | null; image?: string };

export const menuItems: MenuItem[] = [
  { id: 'ginger-tea', name: 'Ginger Tea', category: 'Tea & Coffee', description: '', price: null },
  { id: 'masala-tea', name: 'Masala Tea', category: 'Tea & Coffee', description: '', price: null },
  { id: 'sulaimani', name: 'Sulaimani', category: 'Tea & Coffee', description: '', price: null },
  { id: 'butterfly-pea-tea', name: 'Butterfly Pea Tea', category: 'Tea & Coffee', description: '', price: null },
  { id: 'cheese-corn-sandwich', name: 'Cheese Corn Sandwich', category: 'Sandwiches', description: '', price: null, image: '/images/tea-sandwich.jpg' },
  { id: 'paneer-tikka-momos', name: 'Paneer Tikka Momos', category: 'Momos', description: '', price: null },
  { id: 'tandoori-maggi', name: 'Tandoori Maggi', category: 'Maggi', description: '', price: null },
  { id: 'crispy-paneer-burger', name: 'Crispy Paneer Burger', category: 'Burgers', description: '', price: null },
  { id: 'classic-veg-pizza', name: 'Classic Veg Pizza', category: 'Pizza', description: '', price: null },
];

export const featuredItemIds = ['masala-tea', 'cheese-corn-sandwich', 'paneer-tikka-momos', 'classic-veg-pizza'];