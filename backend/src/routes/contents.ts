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

// GET /api/contents/related/:id - Get related contents (public)
router.get('/related/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limit = Number.parseInt(limitParam ?? '4', 10);
    const limitValue = Number.isNaN(limit) || limit <= 0 ? 4 : Math.min(limit, 12);

    if (!db.getContent || !db.getAllContents) {
      throw new AppError(500, 'Content functionality not available');
    }
    
    // Get the current content
    const currentContent = await db.getContent(id);
    if (!currentContent || currentContent.status !== 'published') {
      throw new AppError(404, 'Content not found');
    }
    
    // Get all published contents
    const contents = await db.getAllContents({ status: 'published' });

    const normalizedCurrentTags = Array.isArray(currentContent.tags)
      ? currentContent.tags.filter((tag): tag is string => Boolean(tag))
      : [];
    const tagsSet = new Set(normalizedCurrentTags);

    const relatedContents = contents
      .filter((candidate) => candidate.id !== id && candidate.status === 'published')
      .map((candidate) => {
        const candidateTags = Array.isArray(candidate.tags)
          ? candidate.tags.filter((tag): tag is string => Boolean(tag))
          : [];
        const sharedTagCount = candidateTags.reduce((count, tag) => (tagsSet.has(tag) ? count + 1 : count), 0);
        const sameCategory = candidate.category === currentContent.category;
        const relevanceScore = (sameCategory ? 10 : 0) + sharedTagCount;
        const recentDate = candidate.publishedAt || candidate.createdAt;

        return {
          content: candidate,
          relevanceScore,
          sameCategory,
          sharedTagCount,
          recentDate: new Date(recentDate),
        };
      })
      .filter(({ sameCategory, sharedTagCount }) => sameCategory || sharedTagCount > 0)
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.recentDate.getTime() - a.recentDate.getTime();
      })
      .slice(0, limitValue)
      .map(({ content }) => content);

    res.json({
      success: true,
      data: relatedContents
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

export const contentRouter = router;
