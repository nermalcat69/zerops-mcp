# Zerops Documentation MCP Server

This project provides a Managed Context Provider (MCP) server that crawls and indexes the Zerops documentation (https://docs.zerops.io) and makes it available as a context source for Cursor IDE.

## Features

- Written in TypeScript for improved maintainability and type safety
- Crawls and indexes Zerops documentation
- Finds the search functionality using aria-label attributes
- Provides a search API for querying documentation
- Implements the MCP protocol for Cursor IDE integration using the `@modelcontextprotocol/sdk`
- Uses Drizzle ORM with PostgreSQL for efficient database operations
- Scheduled crawling to keep documentation up-to-date

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Docker (optional, for containerized deployment)

## Setup

1. Clone this repository:
   ```
   git clone https://your-repository-url/zerops-docs-mcp.git
   cd zerops-docs-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/zerops_docs"
   PORT=3000
   CRAWL_INTERVAL_HOURS=24
   CONTACT_EMAIL="your-email@example.com"
   ```

4. Set up the database:
   ```
   npm run migrate
   npm run push
   ```

5. Start the server:
   ```
   npm start
   ```

## How It Works

### MCP Protocol Integration

This server implements the Model Context Protocol (MCP) using the official SDK (`@modelcontextprotocol/sdk`). This allows Cursor IDE to communicate with the server using a standardized protocol for retrieving context from documentation.

When a user sends a query from Cursor IDE, the server:

1. Receives the query through the `/api/mcp` endpoint
2. Processes the query to extract keywords
3. Searches the indexed documentation for relevant content
4. Returns formatted context data following the MCP protocol specification

### Crawling Process

The server crawls the Zerops documentation by:

1. Starting at the main documentation URL
2. Identifying the search functionality using aria-label attributes
3. Extracting content from each page
4. Following links to other documentation pages
5. Building a comprehensive index of the documentation

### Database Schema

The server uses Drizzle ORM with two main tables:

- `pages`: Stores the URL, title, and content of each documentation page
- `search_index`: Stores keywords extracted from pages with relevance scores

## Usage

### Starting a Crawl

To start crawling the Zerops documentation:

```
curl -X POST http://localhost:3000/api/crawl
```

### Searching Documentation

To search the documentation:

```
curl "http://localhost:3000/api/search?query=your+search+terms"
```

### Using as an MCP with Cursor IDE

1. In Cursor IDE, go to Settings > Context Sources > Add MCP Source
2. Enter the following details:
   - Name: Zerops Documentation
   - Endpoint: http://your-server-url:3000/api/mcp
3. Click "Add Source"

Now you can use Zerops documentation as a context source in Cursor IDE.

## Docker Deployment

1. Build the Docker image:
   ```
   docker build -t zerops-docs-mcp .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 --env-file .env zerops-docs-mcp
   ```

## API Endpoints

- `POST /api/crawl` - Start crawling the Zerops documentation
- `GET /api/search?query=your+search` - Search the documentation
- `POST /api/mcp` - MCP endpoint for Cursor IDE integration (implements MCP protocol)
- `GET /health` - Health check endpoint

## License

MIT