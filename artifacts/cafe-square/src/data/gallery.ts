export type GalleryImage = { id: string; title: string; category: string; src: string; alt: string };
// These generated images are illustrative placeholders, not photographs of Cafe Square or confirmed menu dishes.
export const galleryCategories = ['All', 'Cafe', 'Drinks', 'Food', 'Desserts', 'Atmosphere'];
export const galleryImages: GalleryImage[] = [
  { id: 'interior-light', title: 'A little room to linger', category: 'Cafe', src: '/images/cafe-interior.jpg', alt: 'Illustrative warm cafe interior with sunlight and a wood counter' },
  { id: 'tea-table', title: 'A slow tea break', category: 'Drinks', src: '/images/tea-sandwich.jpg', alt: 'Illustrative tea and sandwich on a cafe table' },
  { id: 'interior-detail', title: 'Warm light, easy company', category: 'Atmosphere', src: '/images/cafe-interior.jpg', alt: 'Illustrative cafe corner in warm afternoon light' },
  { id: 'table-detail', title: 'Something for the pause', category: 'Food', src: '/images/tea-sandwich.jpg', alt: 'Illustrative cafe tea and sandwich setting' },
];