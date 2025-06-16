import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import {
  getRealTimeActiveUsers,
  getTodaysFunnelData,
  getPersonalColorDistribution,
  getDropOffAnalysis,
  getConversionMetrics,
} from '../services/ga4';

const router = Router();

// Apply admin authentication to all analytics routes
router.use(authenticateAdmin);

// Get real-time analytics dashboard data
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      activeUsers,
      funnelData,
      colorDistribution,
      dropOffAnalysis,
      conversionMetrics,
    ] = await Promise.all([
      getRealTimeActiveUsers(),
      getTodaysFunnelData(),
      getPersonalColorDistribution(),
      getDropOffAnalysis(),
      getConversionMetrics(),
    ]);
    
    res.json({
      success: true,
      data: {
        realTime: {
          activeUsers,
        },
        funnel: funnelData,
        personalColors: colorDistribution,
        dropOff: dropOffAnalysis,
        conversions: conversionMetrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
    });
  }
});

// Get funnel data for specific date range
router.get('/funnel', async (req: Request, res: Response): Promise<void> => {
  try {
    const funnelData = await getTodaysFunnelData();
    
    res.json({
      success: true,
      data: funnelData,
    });
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch funnel data',
    });
  }
});

// Get personal color distribution
router.get('/colors', async (req: Request, res: Response): Promise<void> => {
  try {
    const colorDistribution = await getPersonalColorDistribution();
    
    res.json({
      success: true,
      data: colorDistribution,
    });
  } catch (error) {
    console.error('Error fetching color distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch color distribution',
    });
  }
});

// Get drop-off analysis
router.get('/dropoff', async (req: Request, res: Response): Promise<void> => {
  try {
    const dropOffData = await getDropOffAnalysis();
    
    res.json({
      success: true,
      data: dropOffData,
    });
  } catch (error) {
    console.error('Error fetching drop-off data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drop-off data',
    });
  }
});

// Get conversion metrics
router.get('/conversions', async (req: Request, res: Response): Promise<void> => {
  try {
    const conversionMetrics = await getConversionMetrics();
    
    res.json({
      success: true,
      data: conversionMetrics,
    });
  } catch (error) {
    console.error('Error fetching conversion metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion metrics',
    });
  }
});

export const analyticsRouter = router;