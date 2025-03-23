/**
 * BlockDoc React Demo
 *
 * This is a simple React app that demonstrates using BlockDoc in a React application
 */

import React, { useState } from 'react';
import { BlockDocRenderer } from './BlockDocRenderer';
import { BlockDocDocument, Block } from '../../src/index';

export default function App() {
  // Create a sample document
  const [document] = useState(() => {
    // Create a new document
    const doc = new BlockDocDocument({
      title: "BlockDoc React Demo",
      metadata: {
        author: "BlockDoc Team",
        publishedDate: new Date().toISOString(),
        tags: ["react", "blockdoc", "demo"]
      }
    });

    // Add blocks
    doc.addBlock(Block.text(
      "intro",
      "This is a demo of how to use **BlockDoc** with React. The component renders each block type appropriately."
    ));

    doc.addBlock(Block.heading(
      "block-types",
      2,
      "Block Types Demo"
    ));

    doc.addBlock(Block.text(
      "block-types-intro",
      "BlockDoc supports various block types, each with its own rendering behavior. Here are some examples:"
    ));

    // Add a code example
    doc.addBlock(Block.code(
      "react-example",
      "jsx",
      `import { BlockDocRenderer } from 'blockdoc/react';

// Use the renderer component
function MyComponent() {
  return (
    <BlockDocRenderer document={myDocument} />
  );
}`
    ));

    // Add an image
    doc.addBlock(Block.image(
      "demo-image",
      "https://placehold.co/600x200?text=BlockDoc+React",
      "BlockDoc React Demo",
      "A sample image with caption"
    ));

    // Add a list
    doc.addBlock(Block.list(
      "feature-list",
      [
        "Component-based rendering",
        "Markdown support in text blocks",
        "Semantic block IDs",
        "Custom styling options"
      ],
      "unordered"
    ));

    // Add a quote
    const quoteBlock = new Block({
      id: "react-quote",
      type: "quote",
      content: "BlockDoc makes it easy to create structured content that renders beautifully in React applications.",
      attribution: "BlockDoc Documentation"
    });
    doc.addBlock(quoteBlock);

    return doc;
  });

  return (
    <div className="app">
      <BlockDocRenderer document={document} />
      
      <div className="demo-controls">
        <h3>Document JSON:</h3>
        <pre className="json-preview">
          {JSON.stringify(document.toJSON(), null, 2)}
        </pre>
      </div>
    </div>
  );
}