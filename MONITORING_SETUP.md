# 🔍 External Monitoring Setup Guide

## Why External Monitoring?

Render's free tier puts services to sleep after 15 minutes of inactivity. External monitoring services can keep your backends warm by sending regular requests.

## Recommended Free Services

### 1. UptimeRobot (Recommended)
- **Free tier**: 50 monitors, 5-minute intervals
- **Setup**:
  1. Sign up at https://uptimerobot.com
  2. Add new monitor for each service:
     - Backend: `https://pca-hijab-backend.onrender.com/api/health`
     - AI API: `https://showmethecolor-api.onrender.com/health`
  3. Set interval to 5 minutes
  4. Enable email alerts (optional)

### 2. Pingdom
- **Free tier**: 1 monitor
- **Setup**: Similar to UptimeRobot
- Best for monitoring the most critical service

### 3. Better Uptime
- **Free tier**: 10 monitors, 3-minute intervals
- **Setup**:
  1. Sign up at https://betteruptime.com
  2. Add monitors for your services
  3. More aggressive checking (3-minute intervals)

### 4. Cron-job.org
- **Free tier**: Unlimited jobs
- **Setup**:
  1. Sign up at https://cron-job.org
  2. Create cron jobs to hit your endpoints
  3. Set to run every 5 minutes: `*/5 * * * *`

## GitHub Actions Alternative (Free)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Services Alive

on:
  schedule:
    # Run every 10 minutes
    - cron: '*/10 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping-services:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://pca-hijab-backend.onrender.com/api/health || true
          
      - name: Ping AI API
        run: |
          curl -f https://showmethecolor-api.onrender.com/health || true
          
      - name: Ping Frontend Health Check
        run: |
          curl -f https://pca-hijab.vercel.app/api/health || true
```

## Monitoring Dashboard

### Create a Simple Status Page

Add to your frontend (`/api/status.ts`):

```typescript
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const services = [
    { name: 'Backend', url: 'https://pca-hijab-backend.onrender.com/api/health' },
    { name: 'AI API', url: 'https://showmethecolor-api.onrender.com/health' },
  ];
  
  const statuses = await Promise.all(
    services.map(async (service) => {
      try {
        const start = Date.now();
        const response = await fetch(service.url, {
          signal: AbortSignal.timeout(10000),
        });
        const responseTime = Date.now() - start;
        
        return {
          ...service,
          status: response.ok ? 'online' : 'error',
          responseTime,
          coldStart: responseTime > 5000,
        };
      } catch (error) {
        return {
          ...service,
          status: 'offline',
          responseTime: -1,
          coldStart: true,
        };
      }
    })
  );
  
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    services: statuses,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
```

## Best Practices

1. **Multiple Services**: Use different monitoring services for redundancy
2. **Stagger Timing**: Don't have all monitors hit at the same time
3. **Monitor Response Time**: Track if services are getting slower
4. **Alert Thresholds**: Set up alerts for response times > 10 seconds (cold start indicator)

## Cost Optimization

If you want to upgrade from free tier:

1. **Render Starter Plan** ($7/month per service)
   - No sleep/cold starts
   - Better performance
   - Worth it for production

2. **Railway** (usage-based, ~$5-10/month)
   - Better cold start performance
   - Automatic scaling

3. **Fly.io** (pay-as-you-go)
   - Minimal cold starts
   - Global edge deployment

## Current Implementation

Your app now includes:
- ✅ Aggressive pre-warming on app load
- ✅ Keep-alive service (3-minute intervals)
- ✅ Edge function for health checks
- ✅ Client-side caching
- ✅ Service Worker caching

Combined with external monitoring, this should minimize cold start issues!