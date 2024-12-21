// Function to calculate approximate token count
function estimateTokenCount(text) {
  // Split by whitespace and punctuation to estimate token count
  return text.split(/\s+/).length;
}

// Function to generate notes using the OpenAI API
async function generateNotesWithModel(prompt, content) {
  const apiUrl = "https://api.openai.com/v1/completions";
  const apiKey = "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"; // Replace with your actual OpenAI API key
  const maxModelTokens = 8192; // Maximum token limit for gpt-4o-mini

  console.log("Preparing request to OpenAI API...");

  // Estimate input token count
  const inputTokenCount = estimateTokenCount(prompt) + estimateTokenCount(content);
  console.log("Estimated input token count:", inputTokenCount);

  // Calculate dynamic max_tokens
  const maxTokens = Math.min(maxModelTokens - inputTokenCount, 2000); // Leave room and set a ceiling
  console.log("Dynamic max_tokens set to:", maxTokens);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        prompt: `${prompt}\n\n${content}`,
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
    return data.choices[0]?.text.trim() || "Could not generate notes. Please refine your prompt.";
  } catch (error) {
    console.error("Error during API call:", error);
    return "Failed to connect to the API. Check your internet connection or API key.";
  }
}

// Main functionality for the popup
document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const saveNoteButton = document.getElementById("save-note");
  const userInput = document.getElementById("user-input");

  console.log("Popup loaded successfully."); // Log when popup is loaded

  // Function to add a message to the chatbox
  function addMessage(content, type = "bot") {
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = content;
    chatbox.appendChild(message);
    console.log(`Added ${type} message:`, content); // Log the added message
  }

  // Button click animations
  saveNoteButton.addEventListener("mousedown", () => {
    saveNoteButton.style.backgroundColor = "#009900"; // Darker green
    saveNoteButton.style.transform = "scale(0.98)";
    console.log("Button pressed.");
  });

  saveNoteButton.addEventListener("mouseup", () => {
    saveNoteButton.style.backgroundColor = "#00ff00"; // Original green
    saveNoteButton.style.transform = "scale(1)";
    console.log("Button released.");
  });

  saveNoteButton.addEventListener("mouseleave", () => {
    saveNoteButton.style.backgroundColor = "#00ff00"; // Reset to original green
    saveNoteButton.style.transform = "scale(1)";
    console.log("Mouse left button area.");
  });

  // Add functionality to the Generate Notes button
  saveNoteButton.addEventListener("click", async () => {
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
        const notes = await generateNotesWithModel(prompt, response.content);
        addMessage(`Generated Notes:\n${notes}`, "bot");
      });
    });
  });
});
