const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const defaultProducts = [
  {
    id: 'robux-50',
    title: '50 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 0.60,
    stock: 999,
    badge: 'Mínimo',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación instantánea de 50 Robux a tu cuenta de Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-100',
    title: '100 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 1.10,
    stock: 999,
    badge: 'Popular',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación instantánea de 100 Robux a tu cuenta de Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-200',
    title: '200 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 2.10,
    stock: 800,
    badge: 'Recomendado',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 200 Robux a tu cuenta.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-400',
    title: '400 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 4.10,
    stock: 500,
    badge: 'Popular',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 400 Robux a tu cuenta de Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-800',
    title: '800 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 8.10,
    stock: 500,
    badge: 'Mejor Valor',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 800 Robux a tu cuenta de Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-1000',
    title: '1,000 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 10.10,
    stock: 400,
    badge: 'Top Ventas',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: '1,000 Robux para gamepasses, avatares limitados y skins en Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-1700',
    title: '1,700 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 17.10,
    stock: 350,
    badge: 'Pro Gamer',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: '1,700 Robux acreditados de forma 100% segura a tu cuenta.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-2000',
    title: '2,000 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 20.10,
    stock: 300,
    badge: 'VIP',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: '2,000 Robux con acreditación prioritaria 24/7 sin riesgo de baneo.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-4500',
    title: '4,500 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 45.10,
    stock: 200,
    badge: 'Ultimate',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    description: 'Paquete masivo de 4,500 Robux. Transferencia rápida y garantizada.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-10000',
    title: '10,000 Robux',
    category: 'Robux',
    subcategory: 'Robux',
    price: 100.10,
    stock: 100,
    badge: 'Titan VIP',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: '10,000 Robux acreditados con máxima prioridad de entrega.',
    deliveryTime: 'Garantizada (1 min)',
    popular: false
  }
];

async function seedDatabase() {
  const currentProducts = db.getProducts();
  const hasOnlyRobux = currentProducts && currentProducts.length > 0 && currentProducts.every(p => p.category === 'Robux');
  if (!currentProducts || currentProducts.length === 0 || !hasOnlyRobux) {
    console.log('Seeding initial product catalog into database with Robux only...');
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
