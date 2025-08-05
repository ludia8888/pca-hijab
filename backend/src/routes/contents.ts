import { Router } from 'express';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';
import type { Content, ContentCategory } from '../types';

const router = Router();

// GET /api/contents - Get all published contents (public)
router.get('/', async (req, res, next) => {
  try {
    const { category, limit, offset } = req.query;
    
    if (!db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get all contents and filter published ones
    let contents = await db.getAllContents({
      category: category as ContentCategory,
      status: 'published' // Only show published content
    });
    
    // Sort by most recent first
    contents.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Apply pagination if requested
    const startIndex = offset ? parseInt(offset as string) : 0;
    const endIndex = limit ? startIndex + parseInt(limit as string) : contents.length;
    const paginatedContents = contents.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedContents,
      total: contents.length,
      hasMore: endIndex < contents.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contents/popular - Get popular contents by view count (public)
router.get('/popular', async (req, res, next) => {
  try {
    const { limit = '10', category } = req.query;
    
    if (!db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get published contents
    let contents = await db.getAllContents({
      category: category as ContentCategory,
      status: 'published'
    });
    
    // Sort by view count (descending)
    contents.sort((a, b) => b.viewCount - a.viewCount);
    
    // Limit results
    const popularContents = contents.slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: popularContents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contents/recent - Get recent contents (public)
router.get('/recent', async (req, res, next) => {
  try {
    const { limit = '10', category } = req.query;
    
    if (!db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get published contents
    let contents = await db.getAllContents({
      category: category as ContentCategory,
      status: 'published'
    });
    
    // Sort by published date (most recent first)
    contents.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Limit results
    const recentContents = contents.slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: recentContents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contents/category/:category - Get contents by category (public)
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit, offset } = req.query;
    
    const validCategories: ContentCategory[] = ['beauty_tips', 'hijab_styling', 'color_guide', 'trend', 'tutorial'];
    if (!validCategories.includes(category as ContentCategory)) {
      throw new AppError(400, 'Invalid category');
    }
    
    if (!db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get contents for specific category
    const contents = await db.getAllContents({
      category: category as ContentCategory,
      status: 'published'
    });
    
    // Sort by most recent first
    contents.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Apply pagination if requested
    const startIndex = offset ? parseInt(offset as string) : 0;
    const endIndex = limit ? startIndex + parseInt(limit as string) : contents.length;
    const paginatedContents = contents.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedContents,
      total: contents.length,
      hasMore: endIndex < contents.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contents/slug/:slug - Get single content by slug (public)
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!db.getContentBySlug) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    const content = await db.getContentBySlug(slug);
    
    if (!content || content.status !== 'published') {
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

// GET /api/contents/:id - Get single content by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!db.getContent) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    const content = await db.getContent(id);
    
    if (!content || content.status !== 'published') {
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

// GET /api/contents/related/:id - Get related contents (public)
router.get('/related/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = '4' } = req.query;
    
    if (!db.getContent || !db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get the current content
    const currentContent = await db.getContent(id);
    if (!currentContent || currentContent.status !== 'published') {
      throw new AppError(404, 'Content not found');
    }
    
    // Get all published contents
    let contents = await db.getAllContents({ status: 'published' });
    
    // Filter out current content and find related by category or tags
    const relatedContents = contents
      .filter(c => c.id !== id)
      .filter(c => {
        // Same category or has common tags
        const sameCategory = c.category === currentContent.category;
        const commonTags = c.tags.some(tag => currentContent.tags.includes(tag));
        return sameCategory || commonTags;
      })
      .sort((a, b) => {
        // Sort by relevance (same category first, then by common tags count)
        const aRelevance = (a.category === currentContent.category ? 10 : 0) +
          a.tags.filter(tag => currentContent.tags.includes(tag)).length;
        const bRelevance = (b.category === currentContent.category ? 10 : 0) +
          b.tags.filter(tag => currentContent.tags.includes(tag)).length;
        return bRelevance - aRelevance;
      })
      .slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: relatedContents
    });
  } catch (error) {
    next(error);
  }
});

export const contentRouter = router;