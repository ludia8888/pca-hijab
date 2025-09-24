import { Router } from 'express';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';
import type { Product, ProductCategory, PersonalColorType } from '../types';

const router = Router();

// GET /api/products - Get all active products (public)
router.get('/', async (req, res, next) => {
  try {
    const { category, personalColor } = req.query;
    
    let products: Product[];
    
    if (!db.getAllProducts) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    // Get all products and filter active ones
    products = await db.getAllProducts();
    products = products.filter(p => p.isActive);
    
    // Apply filters if provided
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (personalColor) {
      products = products.filter(p => 
        p.personalColors.includes(personalColor as PersonalColorType)
      );
    }
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/random - Get random products by personal color (public)
router.get('/random', async (req, res, next) => {
  try {
    const { personalColor, limit = '3' } = req.query;
    
    if (!personalColor || typeof personalColor !== 'string') {
      throw new AppError(400, 'personalColor is required');
    }
    
    const validPersonalColors: PersonalColorType[] = ['spring_warm', 'autumn_warm', 'summer_cool', 'winter_cool'];
    if (!validPersonalColors.includes(personalColor as PersonalColorType)) {
      throw new AppError(400, 'Invalid personal color');
    }
    
    if (!db.getProductsByPersonalColor) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    // Get products for this personal color
    const products = await db.getProductsByPersonalColor(personalColor as PersonalColorType);
    const activeProducts = products.filter(p => p.isActive);
    
    if (activeProducts.length === 0) {
      throw new AppError(404, 'Product not found');
    }
    
    // Shuffle and limit
    const shuffled = activeProducts.sort(() => Math.random() - 0.5);
    const limitNum = parseInt(limit as string, 10);
    const result = shuffled.slice(0, limitNum);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get single product (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!db.getProduct) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    const product = await db.getProduct(id);
    
    if (!product || !product.isActive) {
      throw new AppError(404, 'Product not found');
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products/batch - Get multiple products by IDs (public)
router.post('/batch', async (req, res, next) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError(400, 'productIds must be a non-empty array');
    }
    
    if (!db.getProduct || !db.getAllProducts) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    // Get all products and filter by IDs and active status
    const allProducts = await db.getAllProducts();
    const products = allProducts.filter(p => 
      productIds.includes(p.id) && p.isActive
    );
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/category/:category - Get products by category (public)
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    
    const validCategories: ProductCategory[] = ['hijab', 'lens', 'lip', 'eyeshadow', 'tint'];
    if (!validCategories.includes(category as ProductCategory)) {
      throw new AppError(400, 'Invalid category');
    }
    
    if (!db.getProductsByCategory) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    const products = await db.getProductsByCategory(category as ProductCategory);
    const activeProducts = products.filter(p => p.isActive);
    
    res.json({
      success: true,
      data: activeProducts
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/personal-color/:personalColor - Get products by personal color (public)
router.get('/personal-color/:personalColor', async (req, res, next) => {
  try {
    const { personalColor } = req.params;
    
    const validPersonalColors: PersonalColorType[] = ['spring_warm', 'autumn_warm', 'summer_cool', 'winter_cool'];
    if (!validPersonalColors.includes(personalColor as PersonalColorType)) {
      throw new AppError(400, 'Invalid personal color');
    }
    
    if (!db.getProductsByPersonalColor) {
      throw new AppError(500, 'Product functionality not available');
    }
    
    const products = await db.getProductsByPersonalColor(personalColor as PersonalColorType);
    const activeProducts = products.filter(p => p.isActive);
    
    res.json({
      success: true,
      data: activeProducts
    });
  } catch (error) {
    next(error);
  }
});

export const productRouter = router;