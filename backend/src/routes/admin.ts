import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import type { Product, ProductCategory, PersonalColorType, Content, ContentCategory, ContentStatus } from '../types';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/admin/verify - Verify admin API key
router.get('/verify', (_req, res) => {
  res.json({
    success: true,
    message: 'API key is valid'
  });
});

// GET /api/admin/products - Get all products with filters
router.get('/products', async (req, res, next) => {
  try {
    const { category, personalColor } = req.query;
    
    let products: Product[];
    
    if (category && personalColor) {
      if (!db.getProductsByCategoryAndPersonalColor) {
        throw new AppError(500, 'Product functionality not available');
      }
      products = await db.getProductsByCategoryAndPersonalColor(
        category as ProductCategory,
        personalColor as PersonalColorType
      );
    } else if (category) {
      if (!db.getProductsByCategory) {
        throw new AppError(500, 'Product functionality not available');
      }
      products = await db.getProductsByCategory(category as ProductCategory);
    } else if (personalColor) {
      if (!db.getProductsByPersonalColor) {
        throw new AppError(500, 'Product functionality not available');
      }
      products = await db.getProductsByPersonalColor(personalColor as PersonalColorType);
    } else {
      if (!db.getAllProducts) {
        throw new AppError(500, 'Product functionality not available');
      }
      products = await db.getAllProducts();
    }
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/products/:id - Get single product
router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!db.getProduct) {
      throw new AppError(500, 'Product functionality not available');
    }
    const product = await db.getProduct(id);
    
    if (!product) {
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

// POST /api/admin/products - Create new product
router.post('/products', async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      thumbnailUrl,
      detailImageUrls,
      personalColors,
      description,
      shopeeLink,
      isActive
    } = req.body;
    
    // Validation
    if (!name || !category || !price || !thumbnailUrl || !personalColors) {
      throw new AppError(400, 'Missing required fields');
    }
    
    const validCategories: ProductCategory[] = ['hijab', 'lens', 'lip', 'eyeshadow', 'tint'];
    if (!validCategories.includes(category)) {
      throw new AppError(400, 'Invalid category');
    }
    
    const validPersonalColors: PersonalColorType[] = ['spring_warm', 'autumn_warm', 'summer_cool', 'winter_cool'];
    if (!Array.isArray(personalColors) || !personalColors.every(pc => validPersonalColors.includes(pc))) {
      throw new AppError(400, 'Invalid personal colors');
    }
    
    if (!db.createProduct) {
      throw new AppError(500, 'Product functionality not available');
    }
    const product = await db.createProduct({
      name,
      category,
      price: Number(price),
      thumbnailUrl,
      detailImageUrls: detailImageUrls || [],
      personalColors,
      description,
      shopeeLink,
      isActive: isActive !== false
    });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate category if provided
    if (updates.category) {
      const validCategories: ProductCategory[] = ['hijab', 'lens', 'lip', 'eyeshadow'];
      if (!validCategories.includes(updates.category)) {
        throw new AppError(400, 'Invalid category');
      }
    }
    
    // Validate personal colors if provided
    if (updates.personalColors) {
      const validPersonalColors: PersonalColorType[] = ['spring_warm', 'autumn_warm', 'summer_cool', 'winter_cool'];
      if (!Array.isArray(updates.personalColors) || !updates.personalColors.every((pc: string) => validPersonalColors.includes(pc as PersonalColorType))) {
        throw new AppError(400, 'Invalid personal colors');
      }
    }
    
    if (!db.updateProduct) {
      throw new AppError(500, 'Product functionality not available');
    }
    const product = await db.updateProduct(id, updates);
    
    if (!product) {
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

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!db.deleteProduct) {
      throw new AppError(500, 'Product functionality not available');
    }
    const deleted = await db.deleteProduct(id);
    
    if (!deleted) {
      throw new AppError(404, 'Product not found');
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products/seed - Seed mock products
router.post('/products/seed', async (_req, res, next) => {
  try {
    // Import seedProducts function dynamically to avoid circular dependencies
    const { seedProducts } = await import('../scripts/seed-products');
    const success = await seedProducts();
    
    if (!success) {
      throw new AppError(500, 'Failed to seed products');
    }
    
    res.json({
      success: true,
      message: 'Products seeded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/upload/image - Upload image
router.post('/upload/image', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No image file provided');
    }
    
    // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For development, we'll return a local URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/upload/images - Upload multiple images
router.post('/upload/images', upload.array('images', 10), (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      throw new AppError(400, 'No image files provided');
    }
    
    const images = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    next(error);
  }
});

// Content Management Routes

// GET /api/admin/contents - Get all contents with filters
router.get('/contents', async (req, res, next) => {
  try {
    const { category, status } = req.query;
    
    if (!db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    const contents = await db.getAllContents({
      category: category as ContentCategory | undefined,
      status: status as ContentStatus | undefined
    });
    
    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/contents/:id - Get single content
router.get('/contents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!db.getContent) {
      throw new AppError(500, 'Content functionality not available');
    }
    const content = await db.getContent(id);
    
    if (!content) {
      throw new AppError(404, 'Content not found');
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/contents/slug/:slug - Get content by slug
router.get('/contents/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!db.getContentBySlug) {
      throw new AppError(500, 'Content functionality not available');
    }
    const content = await db.getContentBySlug(slug);
    
    if (!content) {
      throw new AppError(404, 'Content not found');
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/contents - Create new content
router.post('/contents', async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      slug,
      thumbnailUrl,
      content,
      excerpt,
      category,
      tags,
      status,
      metaDescription,
      metaKeywords
    } = req.body;
    
    // Validation
    if (!title || !slug || !thumbnailUrl || !content || !category) {
      throw new AppError(400, 'Missing required fields');
    }
    
    const validCategories: ContentCategory[] = ['beauty_tips', 'hijab_styling', 'color_guide', 'trend', 'tutorial'];
    if (!validCategories.includes(category)) {
      throw new AppError(400, 'Invalid category');
    }
    
    const validStatuses: ContentStatus[] = ['draft', 'published'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError(400, 'Invalid status');
    }
    
    if (!db.createContent) {
      throw new AppError(500, 'Content functionality not available');
    }
    const newContent = await db.createContent({
      title,
      subtitle,
      slug,
      thumbnailUrl,
      content,
      excerpt,
      category,
      tags: tags || [],
      status: status || 'draft',
      metaDescription,
      metaKeywords
    });
    
    res.status(201).json({
      success: true,
      data: newContent
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/contents/:id - Update content
router.put('/contents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate category if provided
    if (updates.category) {
      const validCategories: ContentCategory[] = ['beauty_tips', 'hijab_styling', 'color_guide', 'trend', 'tutorial'];
      if (!validCategories.includes(updates.category)) {
        throw new AppError(400, 'Invalid category');
      }
    }
    
    // Validate status if provided
    if (updates.status) {
      const validStatuses: ContentStatus[] = ['draft', 'published'];
      if (!validStatuses.includes(updates.status)) {
        throw new AppError(400, 'Invalid status');
      }
    }
    
    if (!db.updateContent) {
      throw new AppError(500, 'Content functionality not available');
    }
    const updatedContent = await db.updateContent(id, updates);
    
    if (!updatedContent) {
      throw new AppError(404, 'Content not found');
    }
    
    res.json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/contents/:id/status - Update content status
router.put('/contents/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      throw new AppError(400, 'Status is required');
    }
    
    const validStatuses: ContentStatus[] = ['draft', 'published'];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, 'Invalid status');
    }
    
    if (!db.updateContentStatus) {
      throw new AppError(500, 'Content functionality not available');
    }
    const updatedContent = await db.updateContentStatus(id, status);
    
    if (!updatedContent) {
      throw new AppError(404, 'Content not found');
    }
    
    res.json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/contents/:id - Delete content
router.delete('/contents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!db.deleteContent) {
      throw new AppError(500, 'Content functionality not available');
    }
    const deleted = await db.deleteContent(id);
    
    if (!deleted) {
      throw new AppError(404, 'Content not found');
    }
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;