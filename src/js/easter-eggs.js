/* filepath: /terminal-portfolio/src/js/easter-eggs.js */
class EasterEggs {
  constructor() {
    this.terminal = null;
    this.commandsHandler = null;
    this.secretCommandsExecuted = new Set();
    this.konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    this.konamiIndex = 0;
    this.matrixRainActive = false;
    this.matrixInterval = null;
  }

  setTerminal(terminal) {
    this.terminal = terminal;
    this.initializeEasterEggs();
  }

  setCommandsHandler(commandsHandler) {
    this.commandsHandler = commandsHandler;
    // Add secret commands to command handler
    this.addSecretCommands();
  }

  initializeEasterEggs() {
    // Listen for special key combinations
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Add special click patterns
    this.addClickPatterns();

    // Set up timers for random effects
    this.setupRandomEffects();
  }

  handleKeyDown(e) {
    // Konami code detection
    if (e.key === this.konami[this.konamiIndex]) {
      this.konamiIndex++;
      if (this.konamiIndex === this.konami.length) {
        this.activateKonamiCode();
        this.konamiIndex = 0;
      }
    } else {
      this.konamiIndex = 0;
    }

    // Secret key combinations
    if (e.ctrlKey && e.key === "m") {
      e.preventDefault(); // Prevent browser's default behavior
      this.toggleMatrixRain();
    }

    if (e.ctrlKey && e.key === "h") {
      e.preventDefault(); // Prevent browser's default behavior
      this.activateHackerMode();
    }
  }

  addClickPatterns() {
    let clickCount = 0;
    let lastClick = 0;

    document.addEventListener("click", (e) => {
      const now = Date.now();
      if (now - lastClick < 500) {
        clickCount++;
        if (clickCount === 5) {
          this.activateRapidClickEasterEgg();
          clickCount = 0;
        }
      } else {
        clickCount = 1;
      }
      lastClick = now;
    });
  }

  setupRandomEffects() {
    // Small chance of a glitch effect when entering commands
    this.terminal.element.addEventListener("command-executed", () => {
      if (Math.random() < 0.05) {
        this.triggerGlitch();
      }
    });
  }

  addSecretCommands() {
    // Add secret commands that don't appear in help
    if (this.commandsHandler) {
      this.commandsHandler.commands["matrix"] = {
        description: "Secret command",
        usage: "matrix",
        action: () => this.toggleMatrixRain(),
        hidden: true,
      };

      this.commandsHandler.commands["42"] = {
        description: "Secret command",
        usage: "42",
        action: () => this.meaningOfLife(),
        hidden: true,
      };

      this.commandsHandler.commands["sudo"] = {
        description: "Secret command",
        usage: "sudo [command]",
        action: (args) => this.sudoCommand(args),
        hidden: true,
      };

      this.commandsHandler.commands["hack"] = {
        description: "Secret command",
        usage: "hack",
        action: () => this.hackSimulation(),
        hidden: true,
      };

      this.commandsHandler.commands["coffee"] = {
        description: "Secret command",
        usage: "coffee",
        action: () => this.brewCoffee(),
        hidden: true,
      };

      this.commandsHandler.commands["starwars"] = {
        description: "Secret command",
        usage: "starwars",
        action: () => this.starWarsAscii(),
        hidden: true,
      };

      this.commandsHandler.commands["snake"] = {
        description: "Secret command",
        usage: "snake",
        action: () => this.snakeGame(),
        hidden: true,
      };

      this.commandsHandler.commands["eastereggs"] = {
        description: "Show easter eggs guide",
        usage: "eastereggs",
        action: () => this.showEasterEggsGuide(),
        hidden: true,
      };
    }
  }

  toggleMatrixRain() {
    const matrixRain = document.getElementById("matrix-rain");
    if (!matrixRain) {
      this.createMatrixRain();
    } else {
      this.matrixRainActive = !this.matrixRainActive;
      matrixRain.classList.toggle("active");

      if (this.matrixRainActive) {
        this.terminal.printLine("Matrix rain activated", "success");
      } else {
        this.terminal.printLine("Matrix rain deactivated", "warning");
        // Clear the interval when matrix is deactivated
        if (this.matrixInterval) {
          clearInterval(this.matrixInterval);
          this.matrixInterval = null;
        }
      }
    }
  }

  createMatrixRain() {
    const canvas = document.createElement("canvas");
    canvas.id = "matrix-rain";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "100";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0.7";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*()<>{}[]|;:,./?~";
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    this.matrixRainActive = true;
    canvas.classList.add("active");

    const drawMatrix = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    this.matrixInterval = setInterval(drawMatrix, 50);
    this.terminal.printLine("Matrix rain activated", "success");

    // Resize handler
    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeHandler);
  }

  activateKonamiCode() {
    this.terminal.printLine("🎮 KONAMI CODE ACTIVATED! 🎮", "success");
    document.documentElement.setAttribute("data-theme", "retro");

    setTimeout(() => {
      const ascii = `
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠖⠋⠉⠀⠀⠀⠀⠀⠀⠉⠙⢦⡀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⢠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⣄⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⢀⣤⡄⠀⠀⠀⣤⡀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀
        ⠀⠀⠀⠀⣰⠃⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⢹⣆⠀⠀⠀
        ⠀⠀⠀⢠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀
        ⠀⠀⠀⣾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣇⠀⠀
        ⠀⠀⠀⢿⡀⠀⠀⠀⠀⠀⠀⠀⠠⡀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡟⠀⠀
        ⠀⠀⠀⠈⢿⣄⠀⠀⣠⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣄⣀⠀⠀⠀⢠⡟⠀⠀⠀
        ⠀⠀⠀⠀⠀⠙⣷⡋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣦⡿⠋⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠈⠻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡞⠋⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠓⠶⠦⣤⣤⣤⣤⠶⠶⠒⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀
      `;

      this.terminal.printASCII(ascii, "ascii-art");
      this.terminal.printLine(
        "\nUp Up Down Down Left Right Left Right B A",
        "success"
      );
      this.terminal.printLine(
        'You unlocked developer mode. Try the "hack" command!',
        "success"
      );

      // Add a secret to local storage
      localStorage.setItem("konami_unlocked", "true");
    }, 500);
  }

  activateHackerMode() {
    document.documentElement.setAttribute("data-theme", "hacker");
    this.terminal.printLine(
      "\nHacker mode activated. Access granted.",
      "success"
    );
    this.createGlitchEffect();
  }

  meaningOfLife() {
    this.terminal.printLine(
      '\n"The Answer to the Ultimate Question of Life, The Universe, and Everything is 42."',
      "success"
    );
    this.terminal.printLine(
      "-- Deep Thought, after 7.5 million years of calculation"
    );
  }

  sudoCommand(args) {
    if (args.length === 0) {
      this.terminal.printLine("Usage: sudo [command]", "warning");
      return;
    }

    this.terminal.printLine("Password required:", "warning");
    setTimeout(() => {
      this.terminal.printLine("Access denied. Nice try though! 😄", "error");
      this.terminal.printLine(
        "Remember: with great power comes great responsibility.",
        "warning"
      );
    }, 1500);
  }

  hackSimulation() {
    if (localStorage.getItem("konami_unlocked") !== "true") {
      this.terminal.printLine("Command not found: hack", "error");
      return;
    }

    this.terminal.printLine("Initiating hacking sequence...", "warning");

    const steps = [
      { text: "Bypassing firewall...", delay: 1000 },
      { text: "Accessing mainframe...", delay: 1500 },
      { text: "Decrypting security protocols...", delay: 2000 },
      { text: "Injecting payload...", delay: 1800 },
      { text: "Covering tracks...", delay: 1200 },
      { text: "Access granted!", delay: 1000, class: "success" },
      {
        text: "Just kidding! This is just a harmless animation. 😄",
        delay: 800,
      },
    ];

    let totalDelay = 0;
    steps.forEach((step) => {
      totalDelay += step.delay;
      setTimeout(() => {
        this.terminal.printLine(step.text, step.class || "warning");
        if (step.text === "Access granted!") {
          this.createGlitchEffect();
        }
      }, totalDelay);
    });
  }

  brewCoffee() {
    this.terminal.printLine("Brewing coffee...", "warning");

    setTimeout(() => {
      this.terminal.printASCII(
        `
        (
          )     (
           )     )
        _____(____(___
        |            |
        |            |
        |            |
        |            |
        |____________|
        |_____  _____|
             |  |
         ____/  \\____
        |___________|
      `,
        "ascii-art"
      );

      setTimeout(() => {
        this.terminal.printLine("Error 418: I'm a teapot", "error");
        this.terminal.printLine("Cannot brew coffee (RFC 2324)", "warning");
      }, 1500);
    }, 1000);
  }

  starWarsAscii() {
    this.terminal.printLine("\nMay the Force be with you...", "success");

    setTimeout(() => {
      this.terminal.printASCII(
        `
       _________________      _________________
      /                /|    /                /|
     /                / |   /                / |
    /_______  _______/  |  /_______  _______/  |
    |       |  |     |  |  |       |  |     |  |
    |       |  |     |  |  |       |  |     |  |
    |       |  |     |  |/ |       |  |     |  |/
    |       |  |     |  /  |       |  |     |  /
    |       |  |     | /   |       |  |     | /
    |_______|  |_____|/    |_______|  |_____|/
      
          _____                  _____
         / ___ \\                / ___ \\
        / /   \\_|              | |___\\|
       | |           _____     |  ___|
       | |          /     \\    | |___|
       | |         | () () |   |___  |
       | |          \\_____/        | |
        \\ \\____/|               ___/ /
         \\_____/               \\____/
      `,
        "ascii-art"
      );
    }, 800);
  }

  snakeGame() {
    this.terminal.printLine("Launching Snake Game...", "success");

    setTimeout(() => {
      const gameContainer = document.createElement("div");
      gameContainer.style.width = "300px";
      gameContainer.style.height = "200px";
      gameContainer.style.backgroundColor = "black";
      gameContainer.style.margin = "20px 0";
      gameContainer.style.position = "relative";
      gameContainer.style.border = "2px solid var(--prompt)";

      const scoreDisplay = document.createElement("div");
      scoreDisplay.style.color = "var(--text)";
      scoreDisplay.style.marginBottom = "10px";
      scoreDisplay.textContent = "Score: 0";

      let snake = [{ x: 0, y: 0 }];
      let food = { x: 0, y: 0 };
      let direction = "right";
      let score = 0;
      let gameLoop = null;
      const gridSize = 10;
      const gameSpeed = 100;

      function createGameElement(className) {
        const element = document.createElement("div");
        element.style.width = gridSize + "px";
        element.style.height = gridSize + "px";
        element.style.position = "absolute";
        element.className = className;
        return element;
      }

      function updateSnake() {
        gameContainer.innerHTML = "";
        snake.forEach((segment) => {
          const snakeElement = createGameElement("snake-segment");
          snakeElement.style.backgroundColor = "green";
          snakeElement.style.left = segment.x * gridSize + "px";
          snakeElement.style.top = segment.y * gridSize + "px";
          gameContainer.appendChild(snakeElement);
        });

        const foodElement = createGameElement("food");
        foodElement.style.backgroundColor = "red";
        foodElement.style.left = food.x * gridSize + "px";
        foodElement.style.top = food.y * gridSize + "px";
        gameContainer.appendChild(foodElement);
      }

      function moveSnake() {
        const head = { ...snake[0] };

        switch (direction) {
          case "up":
            head.y--;
            break;
          case "down":
            head.y++;
            break;
          case "left":
            head.x--;
            break;
          case "right":
            head.x++;
            break;
        }

        // Check collision with walls
        if (
          head.x < 0 ||
          head.x >= gameContainer.clientWidth / gridSize ||
          head.y < 0 ||
          head.y >= gameContainer.clientHeight / gridSize
        ) {
          gameOver();
          return;
        }

        // Check collision with self
        if (
          snake.some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          gameOver();
          return;
        }

        snake.unshift(head);

        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
          score += 10;
          scoreDisplay.textContent = `Score: ${score}`;
          placeFood();
        } else {
          snake.pop();
        }

        updateSnake();
      }

      function placeFood() {
        const maxX = Math.floor(gameContainer.clientWidth / gridSize);
        const maxY = Math.floor(gameContainer.clientHeight / gridSize);

        do {
          food.x = Math.floor(Math.random() * maxX);
          food.y = Math.floor(Math.random() * maxY);
        } while (
          snake.some((segment) => segment.x === food.x && segment.y === food.y)
        );
      }

      function gameOver() {
        clearInterval(gameLoop);
        this.terminal.printLine("Game Over! Score: " + score, "error");
        gameContainer.remove();
        scoreDisplay.remove();
      }

      function handleKeyPress(e) {
        switch (e.key) {
          case "ArrowUp":
            if (direction !== "down") direction = "up";
            break;
          case "ArrowDown":
            if (direction !== "up") direction = "down";
            break;
          case "ArrowLeft":
            if (direction !== "right") direction = "left";
            break;
          case "ArrowRight":
            if (direction !== "left") direction = "right";
            break;
        }
      }

      // Initialize game
      placeFood();
      updateSnake();

      // Start game loop
      gameLoop = setInterval(moveSnake, gameSpeed);

      // Add event listeners
      document.addEventListener("keydown", handleKeyPress);

      // Cleanup function
      this.snakeGameCleanup = () => {
        clearInterval(gameLoop);
        document.removeEventListener("keydown", handleKeyPress);
        if (gameContainer.parentElement) gameContainer.remove();
        if (scoreDisplay.parentElement) scoreDisplay.remove();
      };

      // Add elements to terminal
      const line = this.terminal.printLine("");
      line.innerHTML = "";
      line.appendChild(scoreDisplay);
      line.appendChild(gameContainer);

      // Focus game container
      gameContainer.tabIndex = 0;
      gameContainer.focus();
    }, 1000);
  }

  activateRapidClickEasterEgg() {
    this.terminal.printLine("\n🚀 Speed clicker detected! 🚀", "success");
    this.createFireworks();
  }

  createGlitchEffect() {
    const glitch =
      document.querySelector(".glitch") || document.createElement("div");
    glitch.className = "glitch";
    if (!glitch.parentElement) document.body.appendChild(glitch);

    // Trigger multiple glitch animations
    let glitchCount = 0;
    const glitchInterval = setInterval(() => {
      glitch.style.opacity = Math.random() > 0.7 ? "0.3" : "0";
      glitchCount++;
      if (glitchCount > 20) {
        clearInterval(glitchInterval);
        if (glitch.parentElement) {
          document.body.removeChild(glitch);
        }
      }
    }, 50);
  }

  createFireworks() {
    const fireworks = document.createElement("div");
    fireworks.className = "fireworks";
    fireworks.style.position = "fixed";
    fireworks.style.top = "0";
    fireworks.style.left = "0";
    fireworks.style.width = "100%";
    fireworks.style.height = "100%";
    fireworks.style.pointerEvents = "none";
    fireworks.style.zIndex = "999";
    document.body.appendChild(fireworks);

    // Create 10 fireworks
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createFirework(fireworks);
      }, i * 300);
    }

    // Clean up after the animation
    setTimeout(() => {
      if (fireworks.parentElement) {
        document.body.removeChild(fireworks);
      }
    }, 5000);
  }

  createFirework(container) {
    const colors = ["#ff0", "#0ff", "#f0f", "#0f0", "#f00", "#00f"];
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;

    // Create firework
    const firework = document.createElement("div");
    firework.style.position = "absolute";
    firework.style.width = "5px";
    firework.style.height = "5px";
    firework.style.borderRadius = "50%";
    firework.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    container.appendChild(firework);

    // Animate firework going up
    const destinationY = Math.random() * (window.innerHeight * 0.5);

    const duration = 1000 + Math.random() * 1000;
    firework.animate(
      [
        { top: `${y}px`, opacity: 1 },
        { top: `${destinationY}px`, opacity: 1 },
      ],
      { duration, fill: "forwards" }
    );

    // Create explosion after firework reaches destination
    setTimeout(() => {
      container.removeChild(firework);
      this.createExplosion(
        container,
        x,
        destinationY,
        colors[Math.floor(Math.random() * colors.length)]
      );
    }, duration);
  }

  createExplosion(container, x, y, color) {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.width = "3px";
      particle.style.height = "3px";
      particle.style.borderRadius = "50%";
      particle.style.backgroundColor = color;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const destinationX = x + Math.cos(angle) * distance;
      const destinationY = y + Math.sin(angle) * distance;

      particle.animate(
        [
          { left: `${x}px`, top: `${y}px`, opacity: 1, transform: "scale(1)" },
          {
            left: `${destinationX}px`,
            top: `${destinationY}px`,
            opacity: 0,
            transform: "scale(0)",
          },
        ],
        { duration: 1000 + Math.random() * 1000, fill: "forwards" }
      );

      // Clean up particles
      setTimeout(() => {
        if (particle.parentElement) {
          container.removeChild(particle);
        }
      }, 2000);
    }
  }

  showEasterEggsGuide() {
    this.terminal.printLine("🥚 EASTER EGGS GUIDE 🥚", "success");
    this.terminal.printLine("\nSecret Commands:", "success");
    this.terminal.printLine(
      "  matrix   - Toggle the Matrix rain animation effect"
    );
    this.terminal.printLine("  42       - The answer to the ultimate question");
    this.terminal.printLine(
      "  sudo     - Attempt to use administrator privileges"
    );
    this.terminal.printLine(
      "  hack     - Start a hacking simulation (requires Konami code)"
    );
    this.terminal.printLine("  coffee   - Request a hot beverage");
    this.terminal.printLine("  starwars - Display Star Wars ASCII art");
    this.terminal.printLine("  snake    - Launch a simple Snake game");

    this.terminal.printLine("\nKeyboard Shortcuts:", "success");
    this.terminal.printLine(
      "  Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) - Unlock developer mode"
    );
    this.terminal.printLine("  Ctrl+M - Toggle Matrix rain effect");
    this.terminal.printLine("  Ctrl+H - Activate hacker theme");
    this.terminal.printLine("  Ctrl+L - Clear the terminal");

    this.terminal.printLine("\nHidden Interactions:", "success");
    this.terminal.printLine(
      "  Rapid Clicking - Click quickly 5 times in a row"
    );
    this.terminal.printLine(
      "  Random Glitches - Commands occasionally trigger glitch effects"
    );
  }

  triggerGlitch() {
    this.createGlitchEffect();
  }

  checkCommand(command) {
    // Check if command is a secret command
    if (this.commandsHandler && command) {
      const cmd = command.split(" ")[0].toLowerCase();
      const secretCommands = [
        "matrix",
        "42",
        "sudo",
        "hack",
        "coffee",
        "starwars",
        "snake",
      ];
      if (secretCommands.includes(cmd)) {
        return true;
      }
    }
    return false;
  }
}

export default EasterEggs;
