import { pgTable, serial, text, timestamp, doublePrecision, integer } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

// Define schema
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  lastCrawled: timestamp('last_crawled').defaultNow().notNull()
});

export const searchIndex = pgTable('search_index', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id').references(() => pages.id),
  keyword: text('keyword').notNull(),
  relevance: doublePrecision('relevance').notNull()
});

// Define types
export type Page = InferModel<typeof pages>;
export type NewPage = InferModel<typeof pages, 'insert'>;

export type SearchIndex = InferModel<typeof searchIndex>;
export type NewSearchIndex = InferModel<typeof searchIndex, 'insert'>;
