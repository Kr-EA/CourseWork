import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './main/src/db/schema.ts', 
  out: './drizzle',                
  dialect: 'sqlite',           
  dbCredentials: {
    url: './data/data.db', 
  },
});