import Terminal from "./terminal.js";
import CommandsHandler from "./commands.js";
import EasterEggs from "./easter-eggs.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize terminal
  const terminalElement = document.getElementById("terminal");
  const terminal = new Terminal(terminalElement, {
    welcomeMessage: `Welcome to varunkakkar.github.io!\n=================================\nType 'help' to see available commands.`,
    promptString: "visitor@varunkakkar.github.io:~$ ",
    typingSpeed: 50,
  });

  // Initialize command handler
  const commandsHandler = new CommandsHandler();
  terminal.registerCommandHandler(commandsHandler);

  // Initialize easter eggs
  const easterEggs = new EasterEggs();
  terminal.registerEasterEggs(easterEggs);
  easterEggs.setCommandsHandler(commandsHandler);

  // Set initial theme
  document.documentElement.setAttribute("data-theme", "dark");

  // Add theme switcher UI
  createThemeSwitcher();

  // Initialize window control buttons
  initWindowControls();
});

function createThemeSwitcher() {
  const themeSwitcher = document.createElement("div");
  themeSwitcher.className = "theme-switcher";

  const themes = [
    { name: "dark", label: "Dark" },
    { name: "hacker", label: "Hacker" },
    { name: "retro", label: "Retro" },
  ];

  themes.forEach((theme) => {
    const option = document.createElement("div");
    option.className = `theme-option ${theme.name}`;
    option.title = theme.label;
    option.addEventListener("click", () => {
      document.documentElement.setAttribute("data-theme", theme.name);

      // Update the window title bar color to match the theme
      const titleBar = document.querySelector(".terminal-titlebar");
      if (theme.name === "hacker") {
        titleBar.style.backgroundColor = "rgba(10, 20, 10, 0.9)";
      } else if (theme.name === "retro") {
        titleBar.style.backgroundColor = "rgba(43, 43, 43, 0.9)";
      } else {
        titleBar.style.backgroundColor = "rgba(20, 20, 20, 0.8)";
      }
    });
    themeSwitcher.appendChild(option);
  });

  const terminalContainer = document.querySelector(".terminal-container");
  terminalContainer.appendChild(themeSwitcher);
}

function initWindowControls() {
  // Close button - minimize the terminal with animation
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    const container = document.querySelector(".terminal-container");
    container.style.transition = "transform 0.3s, opacity 0.3s";
    container.style.transform = "scale(0.95)";
    container.style.opacity = "0";

    // After animation, show a message that this is just for show
    setTimeout(() => {
      container.style.transform = "scale(1)";
      container.style.opacity = "1";

      // Show message in terminal
      const terminal = document.getElementById("terminal");
      const message = document.createElement("div");
      message.className = "line warning";
      message.textContent =
        "Nice try! This is a web app - the window controls are just for show 😉";
      terminal.querySelector(".terminal-content").appendChild(message);
      terminal.scrollTop = terminal.scrollHeight;
    }, 300);
  });

  // Minimize and maximize buttons - show similar effects
  const minBtn = document.querySelector(".minimize-btn");
  const maxBtn = document.querySelector(".maximize-btn");

  minBtn.addEventListener("click", () => {
    const container = document.querySelector(".terminal-container");
    container.style.transition = "transform 0.3s";
    container.style.transform = "translateY(5px) scale(0.98)";
    setTimeout(() => {
      container.style.transform = "translateY(0) scale(1)";
    }, 300);
  });

  maxBtn.addEventListener("click", () => {
    const container = document.querySelector(".terminal-container");
    container.classList.toggle("maximized");

    if (container.classList.contains("maximized")) {
      container.style.width = "100%";
      container.style.height = "100vh";
      container.style.maxWidth = "none";
      container.style.maxHeight = "none";
      container.style.borderRadius = "0";
    } else {
      container.style.width = "90%";
      container.style.height = "80vh";
      container.style.maxWidth = "900px";
      container.style.maxHeight = "700px";
      container.style.borderRadius = "8px";
    }
  });
}
