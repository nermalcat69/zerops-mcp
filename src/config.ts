import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration with defaults and proper types
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL || (() => {
    throw new Error('DATABASE_URL is required');
  })(),
  
  // Crawling configuration
  crawlIntervalHours: parseInt(process.env.CRAWL_INTERVAL_HOURS || '24', 10),
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5', 10),
  userAgent: process.env.USER_AGENT || 'ZeropsDocsMCP/1.0',
  
  // MCP configuration
  contactEmail: process.env.CONTACT_EMAIL || 'support@example.com',
  
  // Documentation base URL
  zeropsDocsUrl: 'https://docs.zerops.io',
};