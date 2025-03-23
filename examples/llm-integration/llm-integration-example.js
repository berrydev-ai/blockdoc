/**
 * BlockDoc LLM Integration Example
 *
 * This example demonstrates how to use BlockDoc with an LLM to:
 * 1. Generate a complete article
 * 2. Update specific sections of an article
 * 3. Extract structured information from article content
 */

import { BlockDocDocument } from "../src/core/document"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate a complete article using an LLM
 * @param {string} topic - Article topic
 * @param {Array<string>} sectionTitles - Section titles to include
 * @returns {Promise<BlockDocDocument>} Generated document
 */
async function generateArticle(topic, sectionTitles) {
  console.log(
    `Generating article about "${topic}" with sections: ${sectionTitles.join(
      ", "
    )}`
  )

  // Create system prompt for structuring the content
  const systemPrompt = `
    You are an expert content creator. Generate a blog article about "${topic}" with the following structure:
    
    1. An introduction block with ID "intro"
    2. The following sections, each with a heading and content paragraph:
       ${sectionTitles
         .map(
           (title, index) =>
             `- Section with ID "section-${index + 1}" and heading "${title}"`
         )
         .join("\n       ")}
    3. A conclusion block with ID "conclusion"
    
    Format your response as a JSON object matching this exact structure:
    {
      "article": {
        "title": "The article title",
        "blocks": [
          {
            "id": "intro",
            "type": "text",
            "content": "Introduction paragraph with markdown formatting"
          },
          {
            "id": "section-1",
            "type": "heading",
            "level": 2,
            "content": "First Section Title"
          },
          {
            "id": "section-1-content",
            "type": "text",
            "content": "Content for the first section with markdown"
          },
          ...and so on for each section...
          {
            "id": "conclusion",
            "type": "text",
            "content": "Conclusion paragraph"
          }
        ]
      }
    }
    
    Use markdown formatting in text blocks where appropriate.
  `

  // Generate content using the LLM
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  })

  // Parse the response
  try {
    const generatedContent = JSON.parse(response.choices[0].message.content)
    return BlockDocDocument.fromJSON(generatedContent)
  } catch (error) {
    console.error("Failed to parse LLM response:", error)
    throw new Error("Failed to generate article")
  }
}

/**
 * Update a specific block in an article
 * @param {BlockDocDocument} document - The document to update
 * @param {string} blockId - ID of the block to update
 * @param {string} updatePrompt - Instructions for updating the block
 * @returns {Promise<BlockDocDocument>} Updated document
 */
async function updateBlock(document, blockId, updatePrompt) {
  // Get the current block content
  const block = document.getBlock(blockId)

  if (!block) {
    throw new Error(`Block with ID "${blockId}" not found`)
  }

  console.log(
    `Updating block "${blockId}" (${block.type}) with prompt: "${updatePrompt}"`
  )

  // Create a prompt for updating the content
  const systemPrompt = `
    You are helping to update part of a blog article. 
    You will be given the current content of a block and instructions for updating it.
    
    Current block (${block.type}): 
    ${block.content}
    
    Update instructions: ${updatePrompt}
    
    Respond with ONLY the updated content for this block. Maintain the same style, tone, and format.
    If the block is a heading, keep it concise and clear. If it's a text block, use appropriate markdown formatting.
  `

  // Generate updated content
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
    temperature: 0.5,
  })

  // Update the block with new content
  const updatedContent = response.choices[0].message.content.trim()
  document.updateBlock(blockId, { content: updatedContent })

  return document
}

/**
 * Extract keywords from an article
 * @param {BlockDocDocument} document - The document to analyze
 * @returns {Promise<Array<string>>} Extracted keywords
 */
async function extractKeywords(document) {
  // Combine text blocks for analysis
  const textBlocks = document.article.blocks
    .filter((block) => block.type === "text")
    .map((block) => block.content)
    .join("\n\n")

  // Create a prompt for extracting keywords
  const systemPrompt = `
    Analyze the following article content and extract 5-7 key keywords or phrases that
    best represent the main topics covered. Return ONLY a JSON array of strings.
    
    Article content:
    ${textBlocks}
  `

  // Extract keywords using the LLM
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  })

  // Parse the response
  try {
    const result = JSON.parse(response.choices[0].message.content)
    return Array.isArray(result) ? result : result.keywords || []
  } catch (error) {
    console.error("Failed to parse keyword extraction response:", error)
    return []
  }
}

/**
 * Main demo function
 */
async function runDemo() {
  try {
    // 1. Generate a complete article
    const topic = "The Future of Sustainable Energy"
    const sectionTitles = [
      "Current Renewable Energy Landscape",
      "Emerging Technologies",
      "Policy Implications",
      "Economic Opportunities",
    ]

    const document = await generateArticle(topic, sectionTitles)
    console.log("\nGenerated Article:")
    console.log(document.toString())

    // 2. Update a specific section
    const updatedDocument = await updateBlock(
      document,
      "section-2-content",
      "Focus more on fusion energy and include recent breakthroughs from 2024"
    )

    console.log("\nUpdated Section:")
    console.log(updatedDocument.getBlock("section-2-content").content)

    // 3. Extract keywords
    const keywords = await extractKeywords(updatedDocument)
    console.log("\nExtracted Keywords:")
    console.log(keywords)

    // 4. Render to HTML
    console.log("\nHTML Output (preview):")
    const html = updatedDocument.renderToHTML()
    console.log(html.substring(0, 500) + "...")
  } catch (error) {
    console.error("Demo failed:", error)
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().then(() => console.log("Demo completed"))
}

export { generateArticle, updateBlock, extractKeywords }
