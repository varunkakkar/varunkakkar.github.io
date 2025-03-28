import blogLoader from "./blog-loader.js";

class Terminal {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      welcomeMessage: options.welcomeMessage || "Welcome to vgi!",
      promptString: options.promptString || "visitor@vgi:~$ ",
      typingSpeed: options.typingSpeed || 50,
      maxHistory: options.maxHistory || 100,
      ...options,
    };

    this.history = [];
    this.historyIndex = -1;
    this.commandsHandler = null;
    this.easterEggs = null;

    // Add initialization lock to prevent premature scrolling
    this._initializing = true;
    this._scrollLocked = false;

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

    // Remove the immediate scroll call during initialization
    // Instead, use a proper initialization sequence
    this.finalizeInitialization();

    // Add event listeners
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.element.addEventListener("click", () => {
      if (document.getSelection().toString() === "") {
        this.focusInput();
      }
    });
  }

  // New method for proper initialization sequence
  finalizeInitialization() {
    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Wait for another frame to ensure styles are applied
      requestAnimationFrame(() => {
        // Set scroll position manually to top (prevents auto-scroll)
        this.element.scrollTop = 0;

        // Set flag to allow normal scrolling operations
        this._initializing = false;

        // Add a small delay before allowing scrolling to work normally
        setTimeout(() => {
          this._scrollLocked = false;
          // If user has already interacted, then allow scroll to bottom
          if (this._userInteracted) {
            this.scrollToBottom(true);
          }
        }, 100);
      });
    });
  }

  // Modify printWelcome to not trigger auto-scroll
  printWelcome() {
    // Lock scrolling during welcome message
    this._scrollLocked = true;

    const welcomeLines = this.options.welcomeMessage.split("\n");
    welcomeLines.forEach((line) => {
      this.printLine(line, "success", false); // Don't scroll
    });

    const dateString = new Date().toLocaleString();
    this.printLine(`System initialized at: ${dateString}`, "success", false);
    this.printLine('Type "help" to see available commands.', "warning", false);
    this.printLine("", "", false); // Empty line for spacing
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

    // Add input event listener to update cursor position
    command.addEventListener("input", this.updateCursorPosition.bind(this));

    inputLine.appendChild(command);

    // Create cursor as a separate element after the command
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    inputLine.appendChild(cursor);

    this.terminalContent.appendChild(inputLine);
    this.currentInput = command;
    this.currentCursor = cursor;
    this.focusInput();

    // Initial positioning of the cursor
    this.updateCursorPosition();

    // Only scroll if not in initialization phase
    if (!this._initializing) {
      this.scrollToBottom();
    }
  }

  // Improved method to update cursor position with better accuracy
  updateCursorPosition() {
    if (!this.currentInput || !this.currentCursor) return;

    // Get the current selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Create a temporary range to measure text width
    const tempRange = document.createRange();

    try {
      // Handle empty input or selection in different nodes
      if (this.currentInput.childNodes.length === 0) {
        this.currentInput.appendChild(document.createTextNode(""));
      }

      tempRange.setStart(this.currentInput, 0);
      tempRange.setEnd(range.endContainer, range.endOffset);
    } catch (e) {
      // Fallback positioning if there's an error
      const inputRect = this.currentInput.getBoundingClientRect();
      this.currentCursor.style.position = "absolute";
      this.currentCursor.style.left = `${inputRect.left}px`;
      this.currentCursor.style.top = `${inputRect.top}px`;
      this.currentCursor.style.height = `${inputRect.height}px`;
      return;
    }

    // Get dimensions
    const inputRect = this.currentInput.getBoundingClientRect();

    // Get text content before cursor
    const textBeforeCursor = tempRange.toString();

    // Create a temporary span to measure text width accurately
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.font = window.getComputedStyle(this.currentInput).font;
    tempSpan.textContent = textBeforeCursor || "";
    document.body.appendChild(tempSpan);

    // Calculate position
    const cursorLeft = tempSpan.getBoundingClientRect().width;

    // Position the cursor
    this.currentCursor.style.position = "absolute";
    this.currentCursor.style.left = `${inputRect.left + cursorLeft}px`;
    this.currentCursor.style.top = `${inputRect.top}px`;
    this.currentCursor.style.height = `${inputRect.height}px`;

    // Clean up
    document.body.removeChild(tempSpan);
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
    // Mark that user has interacted with the terminal
    this._userInteracted = true;

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

    // Update cursor position with a slight delay to ensure DOM has updated
    setTimeout(() => this.updateCursorPosition(), 10);
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
    if (this.currentCursor) {
      this.currentCursor.remove();
      this.currentCursor = null;
    }
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

    // Create new input (which no longer calls scrollToBottom internally)
    this.createNewInput();

    // Use slight scroll instead of full forced scroll
    this.scrollSlightly();
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

    // Update cursor position after history navigation
    setTimeout(() => this.updateCursorPosition(), 0);
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

  printLine(text, className = "", shouldScroll = true) {
    const line = document.createElement("div");
    line.className = `line ${className || ""}`;

    // Handle empty or null text
    if (!text) {
      this.terminalContent.appendChild(line);
      if (shouldScroll && !this._initializing) this.scrollToBottom();
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

    // Only scroll if shouldScroll is true AND not initializing
    if (shouldScroll && !this._initializing) this.scrollToBottom();

    return line;
  }

  printLineWithTypingEffect(
    text,
    className = "",
    speed = this.options.typingSpeed
  ) {
    const line = this.printLine("", className, false); // Don't scroll yet

    return new Promise((resolve) => {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          const char = document.createTextNode(text[i]);
          line.appendChild(char);
          i++;
          // Only scroll occasionally during typing for performance
          if (i % 10 === 0) this.scrollToBottom();
          setTimeout(type, speed);
        } else {
          // Final scroll after typing is complete
          this.scrollToBottom();
          resolve();
        }
      };
      type();
    });
  }

  // Improved scrollToBottom with safeguards against unwanted scrolling
  scrollToBottom(force = false) {
    // Don't scroll during initialization or when locked
    if ((this._initializing || this._scrollLocked) && !force) return;

    // Clear any existing timeout
    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
    }

    // Set a timeout to prevent multiple rapid scroll operations
    this._scrollTimeout = setTimeout(() => {
      // Use a single requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        // Skip scrolling if terminal isn't visible yet
        if (!this.element.offsetParent) {
          this._scrollTimeout = null;
          return;
        }

        const scrollHeight = this.element.scrollHeight;
        const clientHeight = this.element.clientHeight;

        // Only scroll if we're not already at the bottom or if forced
        if (
          force ||
          this.element.scrollTop < scrollHeight - clientHeight - 10
        ) {
          try {
            this.element.scrollTop = scrollHeight;
          } catch (e) {
            console.warn("Scroll failed:", e);
          }
        }

        this._scrollTimeout = null;
      });
    }, 10);
  }

  // New method for subtle scrolling
  scrollSlightly() {
    // Don't scroll during initialization or when locked
    if (this._initializing || this._scrollLocked) return;

    // Clear any existing timeout
    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
    }

    this._scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        if (!this.element.offsetParent) {
          this._scrollTimeout = null;
          return;
        }

        const scrollHeight = this.element.scrollHeight;
        const clientHeight = this.element.clientHeight;
        const currentScroll = this.element.scrollTop;

        // Calculate position to show just the last input line
        // Get the last input line height or use a default
        const lastLine = this.terminalContent.lastElementChild;
        const lineHeight = lastLine ? lastLine.offsetHeight : 20;

        // Calculate target scroll position to show at least the last 3 lines
        const targetScroll = Math.max(
          currentScroll,
          scrollHeight - clientHeight - lineHeight * 3
        );

        // Smoothly scroll to the calculated position
        try {
          this.element.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
        } catch (e) {
          // Fallback for browsers that don't support smooth scrolling
          this.element.scrollTop = targetScroll;
        }

        this._scrollTimeout = null;
      });
    }, 10);
  }

  printASCII(art, className = "ascii-art") {
    const pre = document.createElement("pre");
    pre.className = className;
    pre.textContent = art;

    const line = document.createElement("div");
    line.className = "line";
    line.appendChild(pre);

    this.terminalContent.appendChild(line);
    this.scrollToBottom(); // Keep a single scroll after adding ASCII art

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
