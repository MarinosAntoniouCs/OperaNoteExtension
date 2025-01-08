# Notes Assistant Extension

A Chrome extension that helps users generate, organize, and save notes from various web pages. The extension uses OpenAI's API to summarize content and generate key notes, with a clean and user-friendly interface. It also allows users to export their notes in various formats such as HTML, PDF, and text.

## Features

- **Generate Notes**: Use OpenAI's GPT model to generate key points from a webpage.
- **Clean and Filter Content**: Automatically clean and remove unwanted markdown-like characters (e.g., `**`, `#`, `-`) from the generated notes.
- **Customizable Themes**: Switch between light and dark modes for an optimal reading experience.
- **Text-to-Speech**: Read aloud the generated notes for auditory learners.
- **Export Notes**: Save the notes as HTML files, PDF, or share them directly with other apps.
- **Search and Filter**: Quickly search through generated notes to find key information.
- **Voice Input**: Use voice commands to input the prompt for generating notes.

## Installation

### Step 1: Download the Extension

1. Clone or download the repository to your local machine:
    ```bash
    git clone https://github.com/yourusername/notes-assistant-extension.git
    ```

### Step 2: Load the Extension into Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the folder where the extension is located.
4. The extension should now be installed, and you can access it by clicking on the extension icon.

## Usage

1. **Generate Notes**:
   - Click on the extension icon to open the popup.
   - Enter the prompt in the text field (e.g., "Summarize the job description").
   - Click **Generate Notes** to get a summary based on the content of the webpage.

2. **View and Edit Notes**:
   - The generated notes will appear in the text area. You can clean up any extra characters (like markdown) by using the **cleaned text** display.

3. **Export Notes**:
   - After generating the notes, click **Save Notes** to download them in an HTML format.
   - You can further customize the format if additional export options (PDF, CSV) are available.

## Technologies Used

- **Chrome Extension API**: For building the extension functionality.
- **OpenAI API**: To generate notes using GPT models.
- **Web Speech API**: For the text-to-speech and voice input features.
- **HTML, CSS, JavaScript**: For the extension's user interface and logic.

## Future Features

- **Custom Export Formats**: Ability to export notes in PDF, Word, and CSV formats.
- **Search and Filter**: Add the ability to search through notes with keywords.
- **Integration with Note-Taking Apps**: Export directly to Google Keep, Evernote, or OneNote.
- **Advanced Content Summarization**: Use machine learning for automatic categorization and summarization.

## Contributing

We welcome contributions to improve the functionality and features of the Notes Assistant Extension. If you have an idea, feel free to fork the repo, create a branch, and submit a pull request.

### How to Contribute:

1. Fork this repository.
2. Create a new branch (`git checkout -b feature/feature-name`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/feature-name`).
5. Submit a pull request.

## Aplication Interface
![Application Interface](https://github.com/MarinosAntoniouCs/OperaNoteExtension/blob/main/OperaExtensionInterface.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [OpenAI](https://openai.com) for providing the API used to generate the notes.
- [Chrome Extension API Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
