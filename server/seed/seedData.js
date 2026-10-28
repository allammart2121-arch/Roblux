const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const defaultProducts = [
  {
    id: 'robux-400',
    title: 'Paquete 400 Robux',
    category: 'Robux',
    subcategory: 'Recarga Directa',
    price: 4.99,
    stock: 500,
    badge: 'Inicio Gamer',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 400 Robux a tu cuenta de Roblox mediante proceso 100% seguro.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: false
  },
  {
    id: 'robux-800',
    title: 'Paquete 800 Robux',
    category: 'Robux',
    subcategory: 'Recarga Directa',
    price: 9.99,
    stock: 500,
    badge: 'Popular',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    description: 'Acreditación directa e instantánea de 800 Robux a tu cuenta de Roblox sin contraseñas.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-1700',
    title: 'Paquete 1,700 Robux',
    category: 'Robux',
    subcategory: 'Recarga Directa',
    price: 19.99,
    stock: 350,
    badge: 'Recomendado',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    description: '1,700 Robux para comprar Gamepasses, avatares limitados y skins exclusivas en Roblox.',
    deliveryTime: 'Instantánea (1-5 min)',
    popular: true
  },
  {
    id: 'robux-2000',
    title: 'Paquete 2,000 Robux + 200 Bonus',
    category: 'Robux',
    subcategory: 'Bonus Pack',
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
    description: '10,000 Robux acreditados a tu cuenta con soporte prioritario 24/7 y garantía total.',
    deliveryTime: 'Garantizada (1 min)',
    popular: true
  },
  {
    id: 'robux-20000',
    title: 'Titan Pack 20,000 Robux VIP',
    category: 'Robux',
    subcategory: 'Ultra Pack',
    price: 189.99,
    stock: 50,
    badge: 'Leyenda',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: 'El paquete definitivo de 20,000 Robux para los jugadores más exigentes. Máxima prioridad.',
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
