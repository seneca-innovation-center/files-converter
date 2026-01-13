import hljs from "highlight.js";
import { marked } from "marked";
import DOMPurify from "dompurify";

export const createMarkup = (Htmltext: string): { __html: string } => {
  // Use consistent renderer for both server and client
  const renderer = new marked.Renderer();

  // Configure code block renderer with consistent structure
  renderer.code = ({ text, lang }) => {
    const validLanguage = hljs.getLanguage(lang || "") ? lang : "plaintext";
    const highlightedCode = hljs.highlight(text, {
      language: validLanguage || "plaintext",
    }).value;
    return `<pre class="border border-border rounded-md overflow-hidden my-4"><div class="border-b border-border text-xs font-medium px-3 py-2 bg-muted text-muted-foreground">${validLanguage}</div><code class="hljs language-${validLanguage}"><div class="p-3">${highlightedCode}</div></code></pre>`;
  };

  const html = marked(Htmltext, { renderer }) as string;

  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Server-side: return HTML without DOM manipulation
    return { __html: html };
  }

  // Client-side: full processing with sanitization and DOM manipulation
  const sanitizedHtml = DOMPurify.sanitize(html);

  // Parse the sanitized HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHtml, "text/html");

  // Wrap all tables in a scrollable wrapper div
  const tables = doc.querySelectorAll("table");
  tables.forEach((table) => {
    const wrapper = doc.createElement("div");
    wrapper.className = "table-wrapper";
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  // make all <a> tags with target="_blank" rel="noopener noreferrer"
  const links = doc.querySelectorAll("a");
  links.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Function to recursively process nodes
  const processNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const textContent = element.textContent || "";

      if (isRtl(textContent)) {
        element.dir = "rtl";
      } else {
        element.dir = "ltr";
      }

      // Process child nodes
      Array.from(element.childNodes).forEach(processNode);
    }
  };

  // Process the body element and its children
  processNode(doc.body);

  // Serialize the modified HTML back to a string
  return { __html: doc.body.innerHTML };
};
export function isRtl(text: string): boolean {
  // Remove punctuation, numbers, and symbols globally
  // eslint-disable-next-line no-useless-escape
  const cleanedText = text.replace(/[\s0-9!@#\$%\^\&*\)\(+=._-]+/g, "");

  // Define RTL and LTR character ranges
  const rtlPattern =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u0700-\u074F\u0780-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFC]/g;
  const ltrPattern = /[a-zA-Z]/g;

  // Match all RTL and LTR characters
  const rtlMatches = cleanedText.match(rtlPattern) || [];
  const ltrMatches = cleanedText.match(ltrPattern) || [];

  // Compare the counts of RTL and LTR characters
  return rtlMatches.length > ltrMatches.length;
}
