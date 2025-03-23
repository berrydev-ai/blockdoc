# Integrating BlockDoc with LLMs

This tutorial explains how to use BlockDoc with Large Language Models (LLMs) to generate and modify structured content.

## Prerequisites

- BlockDoc installed in your project
- OpenAI API key or access to another LLM provider

## Why BlockDoc Works Well with LLMs

BlockDoc's structured format makes it ideal for LLM integration:

1. **Semantic Structure**: The block-based approach with typed content aligns with how LLMs process information
2. **Targeted Generation**: LLMs can generate or update specific blocks without needing to regenerate entire documents
3. **Stable References**: Semantic IDs allow for consistent referencing even as content changes
4. **Schema Validation**: Ensures LLM-generated content maintains structural integrity

## Basic LLM Integration

Here's a simple example using OpenAI's API to generate a BlockDoc document:

```javascript
import { BlockDocDocument, Block } from 'blockdoc';
import { Configuration, OpenAIApi } from 'openai';

// Set up OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateBlockDocContent(topic) {
  // Create an empty document with metadata
  const doc = new BlockDocDocument({
    article: {
      title: `Article about ${topic}`,
      description: `An AI-generated article about ${topic}`,
      author: "AI Assistant",
      date: new Date().toISOString()
    }
  });
  
  // Generate a heading
  doc.addBlock(
    Block.createHeading({
      id: "main-heading",
      content: `Understanding ${topic}`,
      level: 1
    })
  );
  
  // Use LLM to generate introduction
  const introResponse = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that generates concise, informative content."
    }, {
      role: "user",
      content: `Write a short introduction paragraph about ${topic}. Be informative and engaging.`
    }],
    max_tokens: 200,
  });
  
  const introContent = introResponse.data.choices[0].message.content.trim();
  
  // Add LLM-generated introduction
  doc.addBlock(
    Block.createParagraph({
      id: "introduction",
      content: introContent
    })
  );
  
  // Generate key points heading
  doc.addBlock(
    Block.createHeading({
      id: "key-points-heading",
      content: `Key Points About ${topic}`,
      level: 2
    })
  );
  
  // Use LLM to generate key points
  const pointsResponse = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that generates concise, informative content."
    }, {
      role: "user",
      content: `Generate 5 key points about ${topic}. Return them as a numbered list, with each point being 1-2 sentences.`
    }],
    max_tokens: 400,
  });
  
  // Extract the list items from the response
  const pointsContent = pointsResponse.data.choices[0].message.content.trim();
  const listItems = pointsContent
    .split(/\d+\.\s+/) // Split by numbered list items
    .slice(1) // Remove empty first element
    .map(item => item.trim());
  
  // Add LLM-generated list
  doc.addBlock(
    Block.createList({
      id: "key-points-list",
      items: listItems,
      ordered: true
    })
  );
  
  // Use LLM to generate a conclusion
  const conclusionResponse = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that generates concise, informative content."
    }, {
      role: "user", 
      content: `Write a short conclusion paragraph about ${topic}. Summarize the importance and relevance.`
    }],
    max_tokens: 200,
  });
  
  const conclusionContent = conclusionResponse.data.choices[0].message.content.trim();
  
  // Add LLM-generated conclusion
  doc.addBlock(
    Block.createParagraph({
      id: "conclusion",
      content: conclusionContent
    })
  );
  
  return doc;
}

// Usage example
async function main() {
  try {
    const topic = "artificial intelligence ethics";
    const document = await generateBlockDocContent(topic);
    
    console.log(JSON.stringify(document.toJSON(), null, 2));
    
    // Validate the generated document
    const isValid = document.validate();
    console.log(`Document is valid: ${isValid}`);
    
    if (!isValid) {
      console.log(document.validationErrors);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
```

## Targeted Block Updates

One of BlockDoc's strengths is the ability to update specific blocks:

```javascript
async function updateBlock(doc, blockId, prompt) {
  // Get the existing block to determine its type
  const existingBlock = doc.getBlock(blockId);
  
  if (!existingBlock) {
    throw new Error(`Block with ID ${blockId} not found`);
  }
  
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that updates content while maintaining its structure and purpose."
    }, {
      role: "user",
      content: `Update the following content based on this instruction: "${prompt}"\n\nContent to update: "${existingBlock.content}"`
    }],
    max_tokens: 300,
  });
  
  const updatedContent = response.data.choices[0].message.content.trim();
  
  // Update only the specific block
  doc.updateBlock(blockId, { content: updatedContent });
  
  return doc;
}

// Example usage
const updatedDoc = await updateBlock(
  document,
  "introduction", 
  "Make this introduction more focused on the ethical challenges of AI"
);
```

## Generating Structured Content with Requirements

You can provide specific requirements to guide LLM generation:

```javascript
async function generateStructuredSection(doc, topic, requirements) {
  // Generate section heading
  doc.addBlock(
    Block.createHeading({
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-heading`,
      content: topic,
      level: 2
    })
  );
  
  // Detailed prompt with requirements
  const prompt = `
    Generate content about "${topic}" with the following requirements:
    
    ${requirements.join('\n')}
    
    Format as a cohesive paragraph focusing on the most important aspects.
  `;
  
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that generates high-quality, structured content."
    }, {
      role: "user",
      content: prompt
    }],
    max_tokens: 350,
  });
  
  const content = response.data.choices[0].message.content.trim();
  
  // Add paragraph
  doc.addBlock(
    Block.createParagraph({
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-content`,
      content: content
    })
  );
  
  return doc;
}

// Example usage
const requirements = [
  "Include at least one specific example",
  "Address both benefits and challenges",
  "Mention recent developments",
  "Keep it accessible to non-technical readers"
];

await generateStructuredSection(document, "AI in Healthcare", requirements);
```

## Converting LLM Outputs to BlockDoc

Sometimes you may want to convert existing LLM outputs into BlockDoc format:

```javascript
async function convertTextToBlockDoc(text, title) {
  // Create a new document
  const doc = new BlockDocDocument({
    article: {
      title: title,
      description: `Generated document about ${title}`,
      author: "AI Assistant",
      date: new Date().toISOString()
    }
  });
  
  // Ask the LLM to identify the structure
  const structurePrompt = `
    Analyze the following text and identify its structure. 
    Break it down into sections with headings and paragraphs.
    Return a JSON structure with the following format:
    [
      { "type": "heading", "content": "Heading text", "level": 1 or 2 },
      { "type": "paragraph", "content": "Paragraph text" },
      ...
    ]
    
    TEXT TO ANALYZE:
    ${text}
  `;
  
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that analyzes text structure and returns valid JSON."
    }, {
      role: "user",
      content: structurePrompt
    }],
    max_tokens: 1500,
  });
  
  let blocks;
  try {
    blocks = JSON.parse(response.data.choices[0].message.content.trim());
  } catch (e) {
    console.error("Failed to parse LLM response as JSON");
    throw e;
  }
  
  // Convert structure to BlockDoc blocks
  let counter = 0;
  for (const block of blocks) {
    const id = `block-${counter++}`;
    
    if (block.type === "heading") {
      doc.addBlock(
        Block.createHeading({
          id,
          content: block.content,
          level: block.level || 2
        })
      );
    } else if (block.type === "paragraph") {
      doc.addBlock(
        Block.createParagraph({
          id,
          content: block.content
        })
      );
    } else if (block.type === "list") {
      doc.addBlock(
        Block.createList({
          id,
          items: block.items || [],
          ordered: block.ordered || false
        })
      );
    }
  }
  
  return doc;
}
```

## Advanced: Generating Multi-Part Documents

For longer documents, you can use a structured approach:

```javascript
async function generateComplexDocument(topic, sections) {
  const doc = new BlockDocDocument({
    article: {
      title: topic,
      description: `Comprehensive guide to ${topic}`,
      author: "AI Assistant",
      date: new Date().toISOString()
    }
  });
  
  // Add main title
  doc.addBlock(
    Block.createHeading({
      id: "main-title",
      content: topic,
      level: 1
    })
  );
  
  // Generate introduction
  const introResponse = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a helpful assistant that generates concise, informative content."
    }, {
      role: "user",
      content: `Write an introduction for a comprehensive guide about ${topic}. Keep it under 200 words.`
    }],
    max_tokens: 300,
  });
  
  doc.addBlock(
    Block.createParagraph({
      id: "introduction",
      content: introResponse.data.choices[0].message.content.trim()
    })
  );
  
  // Generate each section
  let sectionIndex = 0;
  for (const section of sections) {
    const sectionId = `section-${sectionIndex++}`;
    
    // Add section heading
    doc.addBlock(
      Block.createHeading({
        id: `${sectionId}-heading`,
        content: section.title,
        level: 2
      })
    );
    
    // Generate section content
    const sectionPrompt = `
      Write content for the "${section.title}" section of a guide about ${topic}.
      Focus on these aspects: ${section.aspects.join(', ')}.
      Be informative, accurate, and concise.
    `;
    
    const sectionResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a helpful assistant that generates well-structured content."
      }, {
        role: "user",
        content: sectionPrompt
      }],
      max_tokens: 500,
    });
    
    const content = sectionResponse.data.choices[0].message.content.trim();
    
    // Split by paragraphs and add them as separate blocks
    const paragraphs = content.split(/\n\n+/);
    
    paragraphs.forEach((paragraph, i) => {
      doc.addBlock(
        Block.createParagraph({
          id: `${sectionId}-paragraph-${i}`,
          content: paragraph.trim()
        })
      );
    });
  }
  
  return doc;
}

// Example usage
const sections = [
  {
    title: "Historical Context",
    aspects: ["key developments", "major milestones", "evolutionary path"]
  },
  {
    title: "Current Applications",
    aspects: ["industry use cases", "consumer impact", "leading innovations"]
  },
  {
    title: "Future Directions",
    aspects: ["emerging trends", "potential breakthroughs", "challenges ahead"]
  }
];

const complexDocument = await generateComplexDocument("Quantum Computing", sections);
```

## Best Practices for LLM Integration

1. **Provide Clear Directives**: Give the LLM specific instructions about content style, length, and focus
2. **Validate Generated Content**: Always validate documents against the BlockDoc schema
3. **Use Semantic IDs**: Create meaningful IDs that reflect content purpose for easier updates
4. **Generate Incrementally**: Build documents block by block rather than all at once
5. **Consider Temperature Settings**: Lower temperature (0.1-0.4) for factual content, higher (0.6-0.8) for creative content
6. **Handle Errors Gracefully**: LLM responses may occasionally fail to parse or meet requirements

## Conclusion

BlockDoc's structured approach to content makes it an excellent choice for LLM integration. By leveraging the block-based architecture and semantic IDs, you can create sophisticated workflows for generating, updating, and managing content with LLMs.

For more advanced examples, check out the [LLM integration example](../../examples/llm-integration/llm-integration-example.js) in the examples directory.