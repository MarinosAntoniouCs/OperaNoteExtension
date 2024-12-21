function extractPageContent() {
  console.log("Starting content extraction...");

  try {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map(h => h.innerText.trim())
      .join("\n");
    const paragraphs = Array.from(document.querySelectorAll("p"))
      .map(p => p.innerText.trim())
      .join("\n");

    if (headings || paragraphs) {
      console.log("Structured content extracted successfully.");
      return `Headings:\n${headings}\n\nContent:\n${paragraphs}`;
    }

    console.warn("No structured content found. Falling back to visible text.");
    const visibleText = document.body.innerText || document.body.textContent;
    return visibleText.trim();
  } catch (error) {
    console.error("Error extracting content:", error);
    throw new Error("Failed to extract content.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    try {
      const extractedContent = extractPageContent();
      sendResponse({ content: extractedContent });
    } catch (error) {
      console.error("Error during extraction:", error);
      sendResponse({ error: "Failed to extract content." });
    }
  }
});
