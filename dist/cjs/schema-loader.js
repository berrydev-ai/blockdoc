'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/**
 * BlockDoc Schema Loader
 * 
 * Loads the JSON schema without requiring import assertions
 */


// Get current directory
const __dirname$1 = path.dirname(url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('schema-loader.js', document.baseURI).href))));

// Load schema
const schemaPath = path.join(__dirname$1, 'schema/blockdoc.schema.json');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const schema = JSON.parse(schemaContent);

exports.schema = schema;
//# sourceMappingURL=schema-loader.js.map
