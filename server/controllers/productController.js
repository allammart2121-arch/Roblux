const db = require('../models/db');

exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, popular } = req.query;
    let products = db.getProducts();

    if (category && category !== 'Todos') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      );
    }

    if (popular === 'true') {
      products = products.filter(p => p.popular);
    }

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
