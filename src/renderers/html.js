/**
 * BlockDoc HTML Renderer
 *
 * Converts BlockDoc documents to HTML
 */

import { marked } from "marked"
import { sanitizeHtml } from "../utils/sanitize.js"
import hljs from "highlight.js"

// Configure marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  headerIds: true,
  mangle: false,
})

/**
 * Render a BlockDoc document to HTML
 * @param {Object} article - The article object from a BlockDoc document
 * @returns {string} HTML representation
 */
export function renderToHTML(article) {
  if (!article || !article.blocks || !Array.isArray(article.blocks)) {
    throw new Error("Invalid article structure")
  }

  const html = [
    `<article class="blockdoc-article">`,
    `<h1 class="blockdoc-title">${sanitizeHtml(article.title)}</h1>`,
  ]

  // Render each block
  article.blocks.forEach((block) => {
    html.push(renderBlock(block))
  })

  html.push("</article>")

  return html.join("\n")
}

/**
 * Render a single block to HTML
 * @param {Object} block - Block data
 * @returns {string} HTML representation of the block
 */
function renderBlock(block) {
  const { id, type } = block

  // Wrapper with block ID and type as data attributes
  const openWrapper = `<div class="blockdoc-block blockdoc-${type}" data-block-id="${id}" data-block-type="${type}">`
  const closeWrapper = `</div>`

  let content

  switch (type) {
    case "text":
      content = renderTextBlock(block)
      break
    case "heading":
      content = renderHeadingBlock(block)
      break
    case "image":
      content = renderImageBlock(block)
      break
    case "code":
      content = renderCodeBlock(block)
      break
    case "list":
      content = renderListBlock(block)
      break
    case "quote":
      content = renderQuoteBlock(block)
      break
    case "embed":
      content = renderEmbedBlock(block)
      break
    case "divider":
      content = renderDividerBlock()
      break
    default:
      content = `<p>Unknown block type: ${type}</p>`
  }

  return `${openWrapper}${content}${closeWrapper}`
}

/**
 * Render a text block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderTextBlock(block) {
  // Use marked to convert markdown to HTML
  return marked.parse(block.content)
}

/**
 * Render a heading block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderHeadingBlock(block) {
  const { level, content } = block
  const validLevel = Math.min(Math.max(parseInt(level) || 2, 1), 6)

  return `<h${validLevel}>${sanitizeHtml(content)}</h${validLevel}>`
}

/**
 * Render an image block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderImageBlock(block) {
  const { url, alt, caption } = block

  let html = `<img src="${sanitizeHtml(url)}" alt="${sanitizeHtml(
    alt
  )}" class="blockdoc-image" />`

  if (caption) {
    html += `<figcaption class="blockdoc-caption">${sanitizeHtml(
      caption
    )}</figcaption>`
    return `<figure class="blockdoc-figure">${html}</figure>`
  }

  return html
}

/**
 * Render a code block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderCodeBlock(block) {
  const { language, content } = block

  // Use highlight.js for syntax highlighting
  let highlightedCode

  try {
    if (language && hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(content, { language }).value
    } else {
      highlightedCode = hljs.highlightAuto(content).value
    }
  } catch (e) {
    highlightedCode = sanitizeHtml(content)
  }

  return `
    <pre class="blockdoc-pre">
      <code class="blockdoc-code ${
        language ? `language-${language}` : ""
      }">${highlightedCode}</code>
    </pre>
  `
}

/**
 * Render a list block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderListBlock(block) {
  const { items, listType } = block

  if (!items || !Array.isArray(items)) {
    return "<p>Invalid list items</p>"
  }

  const tag = listType === "ordered" ? "ol" : "ul"

  const itemsHtml = items
    .map((item) => `<li>${marked.parse(item)}</li>`)
    .join("")

  return `<${tag} class="blockdoc-list blockdoc-list-${listType}">${itemsHtml}</${tag}>`
}

/**
 * Render a quote block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderQuoteBlock(block) {
  const { content, attribution } = block

  let html = `<blockquote class="blockdoc-quote">${marked.parse(
    content
  )}</blockquote>`

  if (attribution) {
    html += `<cite class="blockdoc-attribution">${sanitizeHtml(
      attribution
    )}</cite>`
  }

  return html
}

/**
 * Render an embed block
 * @param {Object} block - Block data
 * @returns {string} HTML representation
 */
function renderEmbedBlock(block) {
  const { url, caption, embedType } = block

  let embedHtml

  if (embedType === "youtube") {
    // Extract YouTube video ID
    const videoId = extractYouTubeId(url)
    if (videoId) {
      embedHtml = `
        <div class="blockdoc-embed-container">
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `
    } else {
      embedHtml = `<p>Invalid YouTube URL</p>`
    }
  } else if (embedType === "twitter") {
    embedHtml = `
      <div class="blockdoc-embed blockdoc-twitter">
        <blockquote class="twitter-tweet">
          <a href="${sanitizeHtml(url)}"></a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `
  } else {
    // Generic embed with iframe
    embedHtml = `
      <div class="blockdoc-embed">
        <iframe 
          src="${sanitizeHtml(url)}" 
          frameborder="0" 
          width="100%" 
          height="400"
          allowfullscreen>
        </iframe>
      </div>
    `
  }

  if (caption) {
    embedHtml += `<figcaption class="blockdoc-caption">${sanitizeHtml(
      caption
    )}</figcaption>`
    return `<figure class="blockdoc-figure">${embedHtml}</figure>`
  }

  return embedHtml
}

/**
 * Render a divider block
 * @returns {string} HTML representation
 */
function renderDividerBlock() {
  return `<hr class="blockdoc-divider" />`
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} YouTube video ID or null if invalid
 */
function extractYouTubeId(url) {
  try {
    const parsedUrl = new URL(url)

    // Handle youtu.be format
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1)
    }

    // Handle youtube.com format
    if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com"
    ) {
      const params = new URLSearchParams(parsedUrl.search)
      return params.get("v")
    }

    return null
  } catch (e) {
    return null
  }
}
