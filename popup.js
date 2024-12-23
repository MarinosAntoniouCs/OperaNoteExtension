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

// Function to save notes to a .txt file
function saveNotesToFile(fileName, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // Prevent navigation behavior
  link.style.display = "none"; // Hide the link
  document.body.appendChild(link); // Append link to the document
  link.click(); // Trigger download
  document.body.removeChild(link); // Remove link after download
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
      });
    });
  });

  // Add functionality to the Save Notes button
  saveNoteButton.addEventListener("click", () => {
    if (!generatedNotes) {
      console.warn("No notes to save."); // Warn if no notes are generated
      addMessage("No notes available to save. Please generate notes first.", "bot");
      return;
    }
    saveNotesToFile("Generated_Notes.txt", generatedNotes);
    addMessage("Notes saved successfully!", "bot");
  });
});
