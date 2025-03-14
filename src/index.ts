// Zerops Documentation MCP Server
// This server crawls and indexes Zerops documentation for use in Cursor IDE

import express, { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { pages, searchIndex } from './schema.js';
import { eq, Many, sql, desc } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Base URL for Zerops documentation
const ZEROPS_DOCS_URL = 'https://docs.zerops.io';

// Configure database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle
const db = drizzle(pool);

// MCP Client interface
interface MCPClient {
  handleRequest: (handler: (req: MCPRequest) => Promise<{
    contexts: Array<{
      title: string;
      content: string;
      url: string;
      relevance_score: number;
    }>;
    metadata: Record<string, any>;
  }>) => (req: Request, res: Response) => Promise<void>;
}

// Simple MCP client implementation
const mcp: MCPClient = {
  handleRequest: (handler) => async (req, res) => {
    try {
      const result = await handler(req as MCPRequest);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  }
};

// Types
interface PageData {
  url: string;
  title: string;
  content: string;
  links: string[];
}

interface SearchButtonInfo {
  found: boolean;
  ariaLabel?: string;
  selector?: string;
  element?: string;
  error?: string;
}

interface MCPRequest {
  body: {
    query?: string;
  };
}

// Initialize the database schema
async function initializeDB(): Promise<void> {
  try {
    // Verify database connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    // Check if we need to run an initial crawl
    const result = await db.select().from(pages).limit(1);
    
    if (result.length === 0) {
      console.log('No pages found in the database. Starting initial crawl...');
      // Start crawling in the background
      crawlAllDocs().catch(error => {
        console.error('Crawl error:', error);
      });
    } else {
      console.log(`Database contains records. Last crawl: ${result[0].lastCrawled}`);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error; // Re-throw to stop the server startup if database is unavailable
  }
}

// Find search button in the document
async function findSearchButton(url: string): Promise<SearchButtonInfo> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Look for elements with "search" in the aria-label attribute
    const searchButton = $('[aria-label*="search" i], [aria-label*="Search" i]');
    
    if (searchButton.length > 0) {
      console.log(`Found search button with aria-label: ${searchButton.attr('aria-label')}`);
      return {
        found: true,
        ariaLabel: searchButton.attr('aria-label'),
        element: searchButton.prop('outerHTML') || undefined
      };
    }
    
    // If not found with aria-label, try other common search button patterns
    const searchAlternatives = [
      'button:contains("Search")',
      'input[type="search"]',
      'input[name="search"]',
      'input[placeholder*="search" i]',
      '.search-button',
      '#search-button',
      '[role="search"]'
    ];
    
    for (const selector of searchAlternatives) {
      const element = $(selector);
      if (element.length > 0) {
        console.log(`Found search element with selector: ${selector}`);
        return {
          found: true,
          selector,
          element: element.prop('outerHTML') || undefined
        };
      }
    }
    
    return { found: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error finding search button at ${url}:`, errorMessage);
    return { found: false, error: errorMessage };
  }
}

// Crawler function to extract content from Zerops documentation
async function crawlPage(url: string): Promise<PageData | null> {
  try {
    console.log(`Crawling page: ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text().trim();
    
    // Extract main content (try multiple selectors common in documentation sites)
    const contentSelectors = [
      'main', 
      '.main-content', 
      'article', 
      '.documentation-content',
      '.content',
      '.doc-content',
      '.markdown-body',
      '.markdown-section',
      '.prose',
      '.page-content'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        console.log(`Found content with selector: ${selector}`);
        break;
      }
    }
    
    // If no content found with selectors, fall back to body
    if (!content) {
      content = $('body').text().trim();
      // Clean up common navigation and footer content by removing short lines
      content = content.split('\n')
        .filter(line => line.trim().length > 30) // Keep only substantial paragraphs
        .join('\n');
    }
    
    // Extract links to other documentation pages
    const links: string[] = [];
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      
      try {
        let fullUrl: string;
        
        if (href.startsWith('/')) {
          // Convert relative URL to absolute
          fullUrl = new URL(href, ZEROPS_DOCS_URL).href;
        } else if (href.startsWith(ZEROPS_DOCS_URL)) {
          // Already absolute URL within the docs domain
          fullUrl = href;
        } else if (!href.includes(':') && !href.startsWith('#')) {
          // Relative URL without leading slash
          fullUrl = new URL('/' + href, ZEROPS_DOCS_URL).href;
        } else {
          // External link or anchor, skip
          return;
        }
        
        // Only add URLs that are within the docs domain
        if (fullUrl.startsWith(ZEROPS_DOCS_URL)) {
          // Remove hash fragments
          const urlWithoutHash = fullUrl.split('#')[0];
          links.push(urlWithoutHash);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.log(`Error processing link ${href}:`, errorMessage);
      }
    });
    
    return {
      url,
      title,
      content,
      links: [...new Set(links)] // Remove duplicates
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error crawling ${url}:`, errorMessage);
    return null;
  }
}

// Index the content for search
async function indexPage(pageData: PageData | null): Promise<void> {
  if (!pageData) return;
  
  try {
    // First, check if page exists
    const existingPages = await db.select().from(pages).where(eq(pages.url, pageData.url));
    let page;
    
    if (existingPages.length > 0) {
      // Update existing page
      page = existingPages[0];
      await db.update(pages)
        .set({
          title: pageData.title,
          content: pageData.content,
          lastCrawled: new Date()
        })
        .where(eq(pages.id, page.id));
    } else {
      // Create new page
      const insertResult = await db.insert(pages).values({
        url: pageData.url,
        title: pageData.title,
        content: pageData.content,
        lastCrawled: new Date()
      }).returning();
      
      page = insertResult[0];
    }
    
    // Process content for keywords
    // Clean the content and split into words
    const words = pageData.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 3); // Only index words longer than 3 chars
    
    // Count word frequencies
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Delete existing index entries for this page
    await db.delete(searchIndex).where(eq(searchIndex.pageId, page.id));
    
    // Calculate total word count for relevance calculation
    const totalWords = Object.values(wordCounts).reduce((sum, count) => sum + count, 0);
    
    // Insert new index entries in batches
    const batchSize = 100;
    const entries = Object.entries(wordCounts);
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize).map(([keyword, count]) => ({
        pageId: page.id,
        keyword,
        relevance: count / totalWords
      }));
      
      await db.insert(searchIndex).values(batch);
    }
    
    console.log(`Indexed page: ${pageData.url}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error indexing ${pageData.url}:`, errorMessage);
  }
}

// Full crawl of Zerops documentation
async function crawlAllDocs(): Promise<void> {
  const visited = new Set<string>();
  const queue: string[] = [ZEROPS_DOCS_URL];
  
  console.log('Starting full crawl of Zerops documentation');
  
  // First, try to find the search element
  const searchButtonInfo = await findSearchButton(ZEROPS_DOCS_URL);
  if (searchButtonInfo.found) {
    console.log('Found search functionality:', searchButtonInfo);
  } else {
    console.log('Search button not found. Will rely on link crawling only.');
  }
  
  // Limit concurrent requests
  const concurrencyLimit = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5', 10);
  let activeCrawls = 0;
  
  return new Promise((resolve) => {
    async function processQueue() {
      if (queue.length === 0 && activeCrawls === 0) {
        console.log('Crawl completed');
        return resolve();
      }
      
      while (queue.length > 0 && activeCrawls < concurrencyLimit) {
        const url = queue.shift()!;
        
        if (visited.has(url)) continue;
        visited.add(url);
        
        activeCrawls++;
        
        crawlPage(url).then(async (pageData) => {
          if (pageData) {
            await indexPage(pageData);
            
            // Add new links to the queue
            pageData.links.forEach(link => {
              if (!visited.has(link) && !queue.includes(link)) {
                queue.push(link);
              }
            });
          }
          
          activeCrawls--;
          
          // Rate limiting to be polite to the server
          setTimeout(processQueue, 1000);
        }).catch(error => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error in crawl cycle for ${url}:`, errorMessage);
          activeCrawls--;
          setTimeout(processQueue, 1000);
        });
      }
      
      // If we couldn't process any URLs (due to concurrency limit), wait and retry
      if (queue.length > 0 && activeCrawls >= concurrencyLimit) {
        setTimeout(processQueue, 1000);
      }
    }
    
    // Start processing the queue
    processQueue();
  });
}

// API endpoint to initiate crawling
app.post('/api/crawl', async (req: Request, res: Response) => {
  try {
    // Start crawling in the background
    crawlAllDocs().catch(error => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Crawl error:', errorMessage);
    });
    
    res.json({ message: 'Crawl started' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// API endpoint to search documentation
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string | undefined;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (keywords.length === 0) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    // Search in the index using a SQL query with joins for better performance
    const results = await pool.query(`
      SELECT 
        p.id, p.url, p.title, 
        SUM(si.relevance) as total_relevance,
        LEFT(p.content, 200) as snippet
      FROM pages p
      JOIN search_index si ON p.id = si.page_id
      WHERE si.keyword = ANY($1)
      GROUP BY p.id, p.url, p.title
      ORDER BY total_relevance DESC
      LIMIT 10
    `, [keywords]);
    
    res.json({ results: results.rows });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// MCP endpoint for Cursor IDE integration using the MCP SDK
app.post('/api/mcp', mcp.handleRequest(async (req: MCPRequest) => {
  const { query } = req.body;
  
  if (!query || query.trim() === '') {
    return {
      contexts: [],
      metadata: { message: 'Query is required' }
    };
  }
  
  const keywords = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  
  if (keywords.length === 0) {
    return {
      contexts: [],
      metadata: { message: 'Query too short' }
    };
  }
  
  try {
    // Search in the index using a SQL query
    const results = await pool.query(`
      SELECT 
        p.id, p.url, p.title, p.content,
        SUM(si.relevance) as total_relevance
      FROM pages p
      JOIN search_index si ON p.id = si.page_id
      WHERE si.keyword = ANY($1)
      GROUP BY p.id, p.url, p.title, p.content
      ORDER BY total_relevance DESC
      LIMIT 5
    `, [keywords]);
    
    // Format results for MCP protocol
    const contexts = results.rows.map(result => ({
      title: result.title,
      content: result.content,
      url: result.url,
      relevance_score: parseFloat(result.total_relevance)
    }));
    
    return {
      contexts,
      metadata: {
        source: 'Zerops Documentation',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error searching with MCP:', errorMessage);
    return {
      contexts: [],
      metadata: { error: errorMessage }
    };
  }
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Scheduled crawling
function scheduleCrawl(): void {
  const intervalHours = parseInt(process.env.CRAWL_INTERVAL_HOURS || '24', 10);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling crawls every ${intervalHours} hours`);
  
  setInterval(() => {
    console.log('Starting scheduled crawl');
    crawlAllDocs().catch(error => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Scheduled crawl error:', errorMessage);
    });
  }, intervalMs);
}

// Start the server
app.listen(port, async () => {
  await initializeDB();
  scheduleCrawl();
  console.log(`Zerops Documentation MCP Server running on port ${port}`);
});