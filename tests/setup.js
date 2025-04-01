import { vi } from 'vitest';

// Mock global do console
global.console = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

// Mock para bibliotecas externas (exemplo com Azure)
vi.mock('@azure/core-auth', () => ({
  AzureKeyCredential: class {
    constructor(key) {
      if (!key) throw new Error('key must be a non-empty string');
      this.key = process.env.AZURE_API_KEY; // Usa do .env.test
    }
  }
}));
