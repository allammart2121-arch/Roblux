const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const defaultProducts = [
  // CATEGORIA: ROBUX
  {
    id: 'robux-800',
    title: 'Paquete 800 Robux',
    category: 'Robux',
    subcategory: 'Recarga Directa',
    price: 9.99,
    stock: 500,
    badge: 'Popular',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 800 Robux a tu cuenta de Roblox mediante regalo seguro.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-2000',
    title: 'Paquete 2,000 Robux + 200 Bonus',
    category: 'Robux',
    subcategory: 'Recarga Bonus',
    price: 22.50,
    stock: 350,
    badge: 'Mejor Valor',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'Recibe 2,000 Robux + 200 Robux de bonificación especial. Proceso 100% seguro sin riesgo de ban.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-4500',
    title: 'Paquete Mega 4,500 Robux',
    category: 'Robux',
    subcategory: 'Recarga Directa',
    price: 48.99,
    stock: 200,
    badge: 'Pro Gamer',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: 'Paquete masivo para comprar Gamepasses, avatares limitados y más. Transferencia ultra rápida.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-10000',
    title: 'Super Pack 10,000 Robux Extra',
    category: 'Robux',
    subcategory: 'Ultra Pack',
    price: 99.99,
    stock: 100,
    badge: 'VIP Ultimate',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    description: '10,000 Robux acreditados a tu cuenta con soporte prioritario 24/7.',
    deliveryTime: 'Garantizada (1 min)',
    popular: true
  },

  // CATEGORIA: ARMAS VIRTUALES
  {
    id: 'mm2-harvester',
    title: 'Harvester (Guadaña Cosechadora MM2)',
    category: 'Armas Virtuales',
    subcategory: 'Murder Mystery 2',
    price: 18.99,
    stock: 15,
    badge: 'Godly Legendario',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    description: 'Una de las armas más raras y cotizadas de Murder Mystery 2. Tradeo instantáneo en servidor seguro.',
    deliveryTime: 'Entrega por Tradeo (2-10 min)',
    popular: true
  },
  {
    id: 'mm2-icebreaker-set',
    title: 'Set Icebreaker & Icewing MM2',
    category: 'Armas Virtuales',
    subcategory: 'Murder Mystery 2',
    price: 14.50,
    stock: 25,
    badge: 'Set Exclusivo',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    description: 'Combo doble de arma principal de hielo e Icewing. Apariencia mística con efectos de congelación.',
    deliveryTime: 'Entrega por Tradeo (2-10 min)',
    popular: false
  },
  {
    id: 'mm2-chroma-elderwood',
    title: 'Chroma Elderwood Scythe MM2',
    category: 'Armas Virtuales',
    subcategory: 'Murder Mystery 2',
    price: 24.99,
    stock: 8,
    badge: 'Edición Chroma',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: 'Guadaña de madera ancestral con aura RGB Chroma cambiante. Altísimo valor de colección.',
    deliveryTime: 'Entrega por Tradeo (2-10 min)',
    popular: true
  },
  {
    id: 'bladeball-infinity-sword',
    title: 'Espada Infinita Neon (Blade Ball)',
    category: 'Armas Virtuales',
    subcategory: 'Blade Ball',
    price: 12.99,
    stock: 30,
    badge: 'Skin Mítica',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Espada luminosa neón con finisher exclusivo para batallas en Blade Ball.',
    deliveryTime: 'Entrega por Tradeo (5 min)',
    popular: false
  },
  {
    id: 'bloxfruits-kitsune',
    title: 'Fruta Kitsune Permanente (Blox Fruits)',
    category: 'Combos & pases',
    subcategory: 'Blox Fruits',
    price: 29.99,
    stock: 20,
    badge: 'Fruta Mítica',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Pase de Fruta Kitsune permanente para Blox Fruits. Habilidades supremas de zorro celestial.',
    deliveryTime: 'GIFT Directo (Instantáneo)',
    popular: true
  }
];

async function seedDatabase() {
  const currentProducts = db.getProducts();
  if (!currentProducts || currentProducts.length === 0) {
    console.log('Seeding initial product catalog into database...');
    db.saveProducts(defaultProducts);
  }

  // Seed default admin account if not existing
  const adminEmail = 'admin@recargaroblox.com';
  const existingAdmin = db.findUserByEmail(adminEmail);
  if (!existingAdmin) {
    console.log('Creating default administrator account (admin@recargaroblox.com)...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    const adminUser = {
      id: uuidv4(),
      username: 'AdminMaster',
      email: adminEmail,
      robloxUsername: 'AdminRobloxOfficial',
      passwordHash,
      walletBalance: 1000.00,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    db.createUser(adminUser);
  }
}

module.exports = { seedDatabase, defaultProducts };
