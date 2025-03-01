/**
 * Adds copy buttons to code blocks in blog posts
 */
document.addEventListener("DOMContentLoaded", function () {
  // Find all pre elements that contain code blocks
  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((codeBlock) => {
    // Create copy button
    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.title = "Copy to clipboard";
    copyButton.textContent = "Copy"; // Simple text instead of SVG icon

    // Add the button to the code block
    codeBlock.appendChild(copyButton);

    // Style the code block to make room for the button
    codeBlock.style.position = "relative";

    // Add click event listener to the button
    copyButton.addEventListener("click", async function () {
      try {
        // Get the text from the code element, fallback to pre content if no code element
        const codeElement = codeBlock.querySelector("code");
        const textToCopy = codeElement
          ? codeElement.innerText
          : codeBlock.innerText;

        // Use modern clipboard API
        await navigator.clipboard.writeText(textToCopy);

        // Show success feedback
        copyButton.textContent = "Copied!";
        copyButton.classList.add("copied");

        // Reset button after 2 seconds
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.classList.remove("copied");
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand("copy");
          copyButton.textContent = "Copied!";
          copyButton.classList.add("copied");
        } catch (e) {
          copyButton.textContent = "Failed!";
        }

        document.body.removeChild(textarea);

        // Reset button after 2 seconds
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.classList.remove("copied");
        }, 2000);
      }
    });
  });
});
