import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticateUser);

// Simple validators
const isValidProductId = (id: string): boolean => typeof id === 'string' && id.length >= 3 && id.length <= 128;

// Saved products
router.get('/me/saved-products', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !db.getUserSavedProducts) throw new AppError(500, 'Not available');
    const items = await db.getUserSavedProducts(userId);
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

router.post('/me/saved-products', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { productId, savedAt } = req.body as { productId: string; savedAt?: string };
    if (!userId || !db.addUserSavedProduct) throw new AppError(500, 'Not available');
    if (!isValidProductId(productId)) throw new AppError(400, 'Invalid productId');
    await db.addUserSavedProduct(userId, productId, savedAt ? new Date(savedAt) : undefined);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.delete('/me/saved-products/:productId', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const productId = req.params.productId;
    if (!userId || !db.removeUserSavedProduct) throw new AppError(500, 'Not available');
    if (!isValidProductId(productId)) throw new AppError(400, 'Invalid productId');
    await db.removeUserSavedProduct(userId, productId);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.post('/me/saved-products/batch', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const items = (req.body?.items as Array<{ productId: string; savedAt?: string }>) || [];
    if (!userId || !db.mergeUserSavedProducts) throw new AppError(500, 'Not available');
    const sanitized = items.filter(i => isValidProductId(i.productId)).map(i => ({ productId: i.productId, savedAt: i.savedAt ? new Date(i.savedAt) : undefined }));
    const count = await db.mergeUserSavedProducts(userId, sanitized);
    res.json({ success: true, data: { merged: count } });
  } catch (e) { next(e); }
});

// Viewed products
router.get('/me/viewed-products', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !db.getUserViewedProducts) throw new AppError(500, 'Not available');
    const items = await db.getUserViewedProducts(userId);
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

router.post('/me/viewed-products', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { productId, viewedAt } = req.body as { productId: string; viewedAt?: string };
    if (!userId || !db.upsertUserViewedProduct) throw new AppError(500, 'Not available');
    if (!isValidProductId(productId)) throw new AppError(400, 'Invalid productId');
    await db.upsertUserViewedProduct(userId, productId, viewedAt ? new Date(viewedAt) : undefined);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.post('/me/viewed-products/batch', async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const items = (req.body?.items as Array<{ productId: string; viewedAt?: string }>) || [];
    if (!userId || !db.mergeUserViewedProducts) throw new AppError(500, 'Not available');
    const sanitized = items.filter(i => isValidProductId(i.productId)).map(i => ({ productId: i.productId, viewedAt: i.viewedAt ? new Date(i.viewedAt) : undefined }));
    const count = await db.mergeUserViewedProducts(userId, sanitized);
    res.json({ success: true, data: { merged: count } });
  } catch (e) { next(e); }
});

export default router;

