// Function to calculate approximate token count
function estimateTokenCount(text) {
  return text.split(/\s+/).length; // Simple word count approximation
}

// Function to generate notes using the OpenAI API
async function generateNotesWithModel(prompt, content) {
  const apiUrl = "https://api.openai.com/v1/chat/completions"; // Use chat endpoint
  const apiKey = "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"; // Replace with your actual OpenAI API key
  const maxModelTokens = 8192; // Maximum token limit for gpt-4o-mini

  console.log("Preparing request to OpenAI API...");

  // Estimate input token count
  const inputTokenCount = estimateTokenCount(prompt) + estimateTokenCount(content);
  console.log("Estimated input token count:", inputTokenCount);

  // Calculate dynamic max_tokens
  const maxTokens = Math.min(maxModelTokens - inputTokenCount, 2000);
  console.log("Dynamic max_tokens set to:", maxTokens);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use the appropriate model
        messages: [
          { role: "system", content: "You are a helpful assistant for summarizing and generating notes." },
          { role: "user", content: `${prompt}\n\n${content}` },
        ],
        max_tokens: maxTokens > 0 ? maxTokens : 50, // Ensure at least a small response
        temperature: 0.7,
      }),
    });

    console.log("Request sent to OpenAI API.");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      return "Error generating notes. Please try again later.";
    }

    const data = await response.json();
    console.log("Response received from OpenAI API:", data);
    return data.choices[0]?.message?.content.trim() || "Could not generate notes. Please refine your prompt.";
  } catch (error) {
    console.error("Error during API call:", error);
    return "Failed to connect to the API. Check your internet connection or API key.";
  }
}

function saveNotesToFile(fileName, content, pageUrl) {
  // Clean and format content
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Replace **text** with <strong>text</strong>
    .replace(/^#\s(.*?)$/gm, "<h1>$1</h1>") // Replace # with <h1>
    .replace(/^##\s(.*?)$/gm, "<h2>$1</h2>") // Replace ## with <h2>
    .replace(/^###\s(.*?)$/gm, "<h3>$1</h3>") // Replace ### with <h3>
    .replace(/^####\s(.*?)$/gm, "<h4>$1</h4>") // Replace #### with <h4>
    .replace(/^- (.*?)(?=\n)/gm, "<li>$1</li>") // List item with - item (only lists with `- `)
    .replace(/\n\n/g, "</p><p>") // Replace double newlines with paragraph tags
    .replace(/\n/g, "<br>"); // Replace single newlines with <br>

  const styledContent = `
    <html>
      <head>
        <title>Notes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background-color: #f4f4f9;
            color: #333;
          }
          h1 {
            color: #444;
            border-bottom: 2px solid #00aaff;
            padding-bottom: 10px;
          }
          h3, h4 {
            color: #555;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          strong {
            color: #007700;
          }
          p {
            margin: 10px 0;
          }
          a {
            color: #0077cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Generated Notes</h1>
        <p>${formattedContent}</p>
        <hr>
        <p><strong>Source URL:</strong> <a href="${pageUrl}" target="_blank">${pageUrl}</a></p>
      </body>
    </html>
  `;

  const blob = new Blob([styledContent], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = "none"; // Prevent navigation issues
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Main functionality for the popup
document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const generateNotesButton = document.getElementById("generate-notes");
  const saveNoteButton = document.getElementById("save-note");
  const userInput = document.getElementById("user-input");
  let generatedNotes = ""; // Store the generated notes

  console.log("Popup loaded successfully."); // Log when popup is loaded

  // Function to add a message to the chatbox
  function addMessage(content, type = "bot") {
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = content;
    chatbox.appendChild(message);
    console.log(`Added ${type} message:`, content); // Log the added message
  }
// Function to clean up special characters for the text area
function cleanTextForTextArea(text) {
  console.log("Original text:", text); // Log original text for debugging
  
  let cleanedText = text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown (**bold**) 
    .replace(/^#\s+/gm, "") // Remove '#' at the beginning of headers (e.g., # Header)
    .replace(/^##\s+/gm, "") // Remove '##' for subheaders (e.g., ## Subheader)
    .replace(/^###\s+/gm, "") // Remove '###' for sub-subheaders (e.g., ### Minor Header)
    .replace(/^####\s+/gm, "") // Remove '####' for deeper headers
    .replace(/^- (.*?)(?=\n)/gm, "$1") // Remove bullet points (e.g., - item)
    .replace(/^-{3,}$/gm, '') // Remove any '---' (3 or more hyphens)
    .replace(/\n/g, "\n"); // Keep line breaks intact

  console.log("Cleaned text:", cleanedText); // Log cleaned text for debugging
  return cleanedText;
}



// Add functionality to the Generate Notes button
generateNotesButton.addEventListener("click", async () => {
  console.log("Generate Notes button clicked."); // Log button click

  const prompt = userInput.value.trim();
  if (!prompt) {
    console.warn("No prompt provided."); // Warn if no prompt is given
    addMessage("Please provide a prompt for note generation!", "bot");
    return;
  }

  console.log("Prompt provided:", prompt); // Log the user prompt

  // Extract content from the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: "extractContent" }, async (response) => {
      if (!response || !response.content) {
        console.error("Failed to extract content or no content available:", response); // Log the failure
        addMessage("Failed to extract content from the page. Please try another webpage.", "bot");
        return;
      }

      console.log("Extracted content:", response.content); // Log the extracted content

      // Generate notes using the API
      generatedNotes = await generateNotesWithModel(prompt, response.content);
      addMessage(`Generated Notes:\n${generatedNotes}`, "bot");

      // Clean the content for the text area and display
      const cleanedText = cleanTextForTextArea(generatedNotes); // Clean the notes
      notesTextArea.value = cleanedText; // Assign cleaned text to the textarea
    });
  });
});



  saveNoteButton.addEventListener("click", () => {
    if (!generatedNotes) {
      console.warn("No notes to save."); // Warn if no notes are generated
      addMessage("No notes available to save. Please generate notes first.", "bot");
      return;
    }
  
    // Get the active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const pageUrl = tab.url || "URL not available"; // Fallback if URL is unavailable
      saveNotesToFile(
        `${generatedNotes.split(' ').slice(0, 3).join('_')}_${new Date().toISOString().replace(/[-:.TZ]/g, '')}.html`,
        generatedNotes, // Pass only the notes content
        pageUrl // Pass the URL separately to include it properly
      );
      addMessage("Notes saved as HTML file successfully!", "bot");
    });
  });
  
});
