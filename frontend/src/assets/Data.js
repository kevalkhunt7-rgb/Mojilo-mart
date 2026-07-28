// data.js

export const products = [
  {
    id: "1",
    title: "JUST TRUST ME YOU'LL BE FINE",
    rating: 4,
    reviewsCount: 150,
    price: 192.00,
    currency: "₹",
    category: "Man",
    subCategory: "T-Shirts",
    description: "A True Masterpiece of Creativity and Comfort! The JUST TRUST ME YOU'LL BE FINE is not just another T-shirt; it's a bold expression of individuality and style.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"  
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#111111' },
      { id: 'yellow', name: 'Yellow', hex: '#CAB02A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: "2",
    title: "URBAN OVERSIZED HOODIE",
    rating: 5,
    reviewsCount: 320,
    price: 499.00,
    currency: "₹",
    category: "Man",
    subCategory: "Hoodies",
    description: "Premium heavyweight cotton fleece designed for the perfect street-style drop shoulder look. Cozy meets indestructible.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop"
    ],
    colors: [
      { id: 'charcoal', name: 'Charcoal Gray', hex: '#333333' },
      { id: 'beige', name: 'Sand Beige', hex: '#E1D6C4' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: "3",
    title: "CLASSIC CARGO JOGGERS",
    rating: 4.5,
    reviewsCount: 88,
    price: 349.00,
    currency: "₹",
    category: "Man",
    subCategory: "Jerseys", // Assigned to jerseys/athletic utility style
    description: "Engineered with technical utility pockets and water-resistant fabric. Flexible waistband for ultimate daily movement.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=600&auto=format&fit=crop"
    ],
    colors: [
      { id: 'olive', name: 'Olive Green', hex: '#3B4738' },
      { id: 'black', name: 'Midnight Black', hex: '#0A0A0A' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: "4",
    title: "RETRO GRAPHIC TEE",
    rating: 4.2,
    reviewsCount: 45,
    price: 220.00,
    currency: "₹",
    category: "Man",
    subCategory: "Oversized T-Shirts",
    description: "Vintage washed aesthetic featuring a screen-printed 90s cyberpunk graphic. Pre-shrunk for an enduring perfect fit.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop"
    ],
    colors: [
      { id: 'vintage-white', name: 'Off-White', hex: '#F7F5F0' },
      { id: 'washed-blue', name: 'Fade Blue', hex: '#4B6584' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: "5",
    title: "JUST TRUST ME YOU'LL BE FINE HOODIE",
    rating: 4,
    reviewsCount: 150,
    price: 192.00,
    currency: "₹",
    category: "Woman",
    subCategory: "Hoodies",
    description: "A True Masterpiece of Creativity and Comfort! The JUST TRUST ME YOU'LL BE FINE is not just another hoodie; it's a bold expression of individuality and style.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"  
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#111111' },
      { id: 'yellow', name: 'Yellow', hex: '#CAB02A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: "6",
    title: "JUST TRUST ME YOU'LL BE FINE SWEATSHIRT",
    rating: 4,
    reviewsCount: 150,
    price: 192.00,
    currency: "₹",
    category: "Woman",
    subCategory: "Sweatshirts",
    description: "A True Masterpiece of Creativity and Comfort! The JUST TRUST ME YOU'LL BE FINE is not just another sweatshirt; it's a bold expression of individuality and style.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"  
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#111111' },
      { id: 'yellow', name: 'Yellow', hex: '#CAB02A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: "7",
    title: "JUST TRUST ME YOU'LL BE FINE OVERSIZED TEE",
    rating: 4,
    reviewsCount: 150,
    price: 192.00,
    currency: "₹",
    category: "Sports",
    subCategory: "Oversized T-Shirts",
    description: "A True Masterpiece of Creativity and Comfort! The JUST TRUST ME YOU'LL BE FINE is not just another T-shirt; it's a bold expression of individuality and style.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"  
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#111111' },
      { id: 'yellow', name: 'Yellow', hex: '#CAB02A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: "8",
    title: "JUST TRUST ME YOU'LL BE FINE LONG SLEEVE",
    rating: 4,
    reviewsCount: 150,
    price: 192.00,
    currency: "₹",
    category: "Sports",
    subCategory: "Long Sleeve T-Shirts",
    description: "A True Masterpiece of Creativity and Comfort! The JUST TRUST ME YOU'LL BE FINE is not just another athletic top; it's a bold expression of individuality and style.",
    brand: "MOJILO",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"  
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#111111' },
      { id: 'yellow', name: 'Yellow', hex: '#CAB02A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];