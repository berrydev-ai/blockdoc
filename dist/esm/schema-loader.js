import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * BlockDoc Schema Loader
 * 
 * Loads the JSON schema without requiring import assertions
 */


// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load schema
const schemaPath = path.join(__dirname, 'schema/blockdoc.schema.json');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const schema = JSON.parse(schemaContent);

export { schema };
//# sourceMappingURL=schema-loader.js.map
