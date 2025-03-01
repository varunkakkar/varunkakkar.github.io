/* filepath: /terminal-portfolio/src/js/terminal.js */
import blogLoader from "./blog-loader.js";

class Terminal {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      welcomeMessage:
        options.welcomeMessage || "Welcome to my terminal portfolio!",
      promptString: options.promptString || "visitor@varunkakkar.github.io:~$ ",
      typingSpeed: options.typingSpeed || 50,
      maxHistory: options.maxHistory || 100,
      ...options,
    };

    this.history = [];
    this.historyIndex = -1;
    this.commandsHandler = null;
    this.easterEggs = null;

    this.init();
  }

  init() {
    this.terminalContent = document.createElement("div");
    this.terminalContent.className = "terminal-content";
    this.element.appendChild(this.terminalContent);

    // Create screen effect overlay
    const screenEffect = document.createElement("div");
    screenEffect.className = "screen-effect";
    this.element.appendChild(screenEffect);

    // Create glitch effect element
    const glitchEffect = document.createElement("div");
    glitchEffect.className = "glitch";
    this.element.appendChild(glitchEffect);

    // Simulate occasional glitches
    setInterval(() => {
      glitchEffect.style.opacity = Math.random() > 0.99 ? "1" : "0";
      setTimeout(() => {
        glitchEffect.style.opacity = "0";
      }, 150);
    }, 3000);

    // Start with welcome message
    this.printWelcome();

    // Create first prompt
    this.createNewInput();

    // Add event listeners
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.element.addEventListener("click", () => {
      if (document.getSelection().toString() === "") {
        this.focusInput();
      }
    });
  }

  printWelcome() {
    const welcomeLines = this.options.welcomeMessage.split("\n");
    welcomeLines.forEach((line) => {
      this.printLine(line, "success");
    });

    const dateString = new Date().toLocaleString();
    this.printLine(`System initialized at: ${dateString}`, "success");
    this.printLine('Type "help" to see available commands.', "warning");
    this.printLine(""); // Empty line for spacing
  }

  createNewInput() {
    const inputLine = document.createElement("div");
    inputLine.className = "input-line line";

    // Create prompt
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = this.options.promptString;
    inputLine.appendChild(prompt);

    // Create command span
    const command = document.createElement("span");
    command.className = "command";
    command.contentEditable = true;
    command.spellcheck = false;
    command.autocapitalize = "off";
    command.autocomplete = "off";
    command.setAttribute("role", "textbox");
    command.onpaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    };
    inputLine.appendChild(command);

    // Create cursor
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    command.appendChild(cursor);

    this.terminalContent.appendChild(inputLine);
    this.currentInput = command;
    this.focusInput();
  }

  focusInput() {
    if (this.currentInput) {
      this.currentInput.focus();

      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();

      try {
        range.setStart(this.currentInput, this.currentInput.childNodes.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        // Handle older browsers
        this.currentInput.focus();
      }
    }
  }

  handleKeyDown(e) {
    if (!this.currentInput) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        const command = this.currentInput.textContent.trim();
        this.handleCommand(command);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.navigateHistory("prev");
        break;

      case "ArrowDown":
        e.preventDefault();
        this.navigateHistory("next");
        break;

      case "Tab":
        e.preventDefault();
        this.handleTabCompletion();
        break;

      case "c":
        if (e.ctrlKey) {
          e.preventDefault();
          this.handleCtrlC();
        }
        break;

      case "l":
        if (e.ctrlKey) {
          e.preventDefault();
          this.clearTerminal();
        }
        break;
    }
  }

  handleCommand(commandText) {
    // Save to history
    if (commandText && this.history[this.history.length - 1] !== commandText) {
      this.history.push(commandText);
      if (this.history.length > this.options.maxHistory) {
        this.history.shift();
      }
    }
    this.historyIndex = this.history.length;

    // Remove cursor and make input non-editable
    const cursor = this.currentInput.querySelector(".cursor");
    if (cursor) cursor.remove();
    this.currentInput.contentEditable = false;

    // Execute command
    if (commandText) {
      // Dispatch event for potential easter egg triggers
      const event = new CustomEvent("command-executed", {
        detail: { command: commandText },
      });
      this.element.dispatchEvent(event);

      // Check if the command is an easter egg
      if (this.easterEggs && this.easterEggs.checkCommand(commandText)) {
        // Execute the command through the command handler
        // The easter egg implementation is in the command action
        if (this.commandsHandler) {
          this.commandsHandler.executeCommand(commandText);
        }
      } else if (this.commandsHandler) {
        this.commandsHandler.executeCommand(commandText);
      } else {
        this.printLine(`Command not found: ${commandText}`, "error");
      }
    }

    // Create new input
    this.createNewInput();

    // Scroll to bottom
    this.element.scrollTop = this.element.scrollHeight;
  }

  navigateHistory(direction) {
    if (!this.history.length) return;

    if (direction === "prev") {
      this.historyIndex = Math.max(0, this.historyIndex - 1);
    } else {
      this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
    }

    const command = this.history[this.historyIndex] || "";
    this.currentInput.textContent = command;

    // Move cursor to end
    this.focusInput();
  }

  handleTabCompletion() {
    if (this.commandsHandler) {
      const currentText = this.currentInput.textContent;
      const completed = this.commandsHandler.completeCommand(currentText);
      if (completed) {
        this.currentInput.textContent = completed;
        this.focusInput();
      }
    }
  }

  handleCtrlC() {
    this.printLine("^C", "error");
    this.createNewInput();
  }

  clearTerminal() {
    this.terminalContent.innerHTML = "";
    this.createNewInput();
  }

  printLine(text, className = "") {
    const line = document.createElement("div");
    line.className = `line ${className || ""}`;

    // Handle empty or null text
    if (!text) {
      this.terminalContent.appendChild(line);
      return line;
    }

    // Split text into lines to preserve formatting
    const lines = text.split("\n").map((line) => line.trimEnd());

    lines.forEach((lineText, index) => {
      if (index > 0) {
        // Add line break between lines
        this.terminalContent.appendChild(document.createElement("div"));
      }

      const lineElement = document.createElement("div");
      lineElement.className = `line ${className || ""}`;

      if (lineText.includes("```")) {
        // Handle code blocks
        const parts = lineText.split("```");
        parts.forEach((part, i) => {
          if (i % 2 === 0) {
            // Regular text
            if (part.trim()) {
              const span = document.createElement("span");
              // Preserve indentation
              span.textContent = part;
              lineElement.appendChild(span);
            }
          } else {
            // Code block
            const pre = document.createElement("pre");
            pre.className = "code-block";
            pre.textContent = part;
            lineElement.appendChild(pre);
          }
        });
      } else {
        // Preserve whitespace for regular text
        const span = document.createElement("span");
        span.style.whiteSpace = "pre-wrap";
        span.textContent = lineText;
        lineElement.appendChild(span);
      }

      this.terminalContent.appendChild(lineElement);
    });

    // Scroll to bottom
    this.element.scrollTop = this.element.scrollHeight;

    return line;
  }

  printLineWithTypingEffect(
    text,
    className = "",
    speed = this.options.typingSpeed
  ) {
    const line = this.printLine("", className);

    return new Promise((resolve) => {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          const char = document.createTextNode(text[i]);
          line.appendChild(char);
          i++;
          this.element.scrollTop = this.element.scrollHeight;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      type();
    });
  }

  printASCII(art, className = "ascii-art") {
    const pre = document.createElement("pre");
    pre.className = className;
    pre.textContent = art;

    const line = document.createElement("div");
    line.className = "line";
    line.appendChild(pre);

    this.terminalContent.appendChild(line);
    return line;
  }

  registerCommandHandler(commandsHandler) {
    this.commandsHandler = commandsHandler;
    commandsHandler.setTerminal(this);
  }

  registerEasterEggs(easterEggs) {
    this.easterEggs = easterEggs;
    easterEggs.setTerminal(this);
  }
}

export default Terminal;
