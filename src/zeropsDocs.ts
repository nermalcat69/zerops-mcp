import axios from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';

export class ZeropsDocsMonitor {
  private lastContent: string | null = null;
  private url: string;
  private pollInterval: number;
  private onUpdate: (message: string) => void;
  private usePuppeteer: boolean;
  private browser?: Browser;
  private page?: Page;

  constructor(url: string, pollInterval: number, onUpdate: (message: string) => void, usePuppeteer: boolean = false) {
    this.url = url;
    this.pollInterval = pollInterval;
    this.onUpdate = onUpdate;
    this.usePuppeteer = usePuppeteer;
  }

  private async ensureBrowser() {
    if (!this.browser) {
      // Configuration for bare metal VPS
      const browserOptions = { 
        headless: true, 
        args: ["--no-sandbox"] 
      };
      this.browser = await puppeteer.launch(browserOptions);
      this.page = await this.browser.newPage();
    }
    return this.page!;
  }

  async fetchDocs(): Promise<string> {
    try {
      if (this.usePuppeteer) {
        const page = await this.ensureBrowser();
        await page.goto(this.url, { waitUntil: 'networkidle2' });
        const content = await page.content();
        return content;
      } else {
        const response = await axios.get(this.url);
        return response.data;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Failed to fetch Zerops docs: ${errorMessage}`);
      return '';
    }
  }

  async startMonitoring() {
    this.lastContent = await this.fetchDocs();
    setInterval(async () => {
      const currentContent = await this.fetchDocs();
      if (currentContent && this.lastContent && currentContent !== this.lastContent) {
        this.onUpdate('Zerops docs updated');
      }
      this.lastContent = currentContent;
    }, this.pollInterval);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}