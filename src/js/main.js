import Terminal from "./terminal.js";
import CommandsHandler from "./commands.js";
import EasterEggs from "./easter-eggs.js";

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the terminal element
  const terminalElement = document.getElementById("terminal");

  // Check if terminal element exists
  if (!terminalElement) {
    console.error("Terminal element not found");
    return;
  }

  // Create terminal options
  const terminalOptions = {
    welcomeMessage:
      "┌──────────────────────────────────────────┐\n" +
      "│   Welcome to Varun Kakkar's Terminal     │\n" +
      "│   Running TerminalOS v1.0.0              │\n" +
      "└──────────────────────────────────────────┘",
    promptString: "visitor@vgi:~$ ",
  };

  // Wait until next frame to ensure browser paint is complete
  requestAnimationFrame(() => {
    // Prevent unwanted scrolls during initialization
    if (terminalElement) terminalElement.scrollTop = 0;

    // Initialize terminal with a slight delay to ensure proper rendering
    setTimeout(() => {
      const terminal = new Terminal(terminalElement, terminalOptions);

      // Initialize command handler and easter eggs
      const commandsHandler = new CommandsHandler();
      const easterEggs = new EasterEggs();

      // Register handlers with terminal
      terminal.registerCommandHandler(commandsHandler);
      terminal.registerEasterEggs(easterEggs);

      // Also register terminal with easter eggs
      if (easterEggs.setCommandsHandler) {
        easterEggs.setCommandsHandler(commandsHandler);
      }

      // Store terminal instance for potential access from console for debugging
      window.terminalInstance = terminal;
    }, 50); // Small delay to ensure DOM is stable
  });
});
