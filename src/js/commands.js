/* filepath: /terminal-portfolio/src/js/commands.js */
import blogLoader from "./blog-loader.js";

class CommandsHandler {
  constructor() {
    this.terminal = null;
    this.commands = {
      help: {
        description: "Display available commands",
        usage: "help [command]",
        action: this.helpCommand.bind(this),
      },
      about: {
        description: "Display information about me",
        usage: "about",
        action: this.aboutCommand.bind(this),
      },
      projects: {
        description: "List my projects",
        usage: "projects",
        action: this.projectsCommand.bind(this),
      },
      skills: {
        description: "List my technical skills",
        usage: "skills",
        action: this.skillsCommand.bind(this),
      },
      contact: {
        description: "Display contact information",
        usage: "contact",
        action: this.contactCommand.bind(this),
      },
      clear: {
        description: "Clear terminal screen",
        usage: "clear",
        action: this.clearCommand.bind(this),
      },
      echo: {
        description: "Print text to terminal",
        usage: "echo [text]",
        action: this.echoCommand.bind(this),
      },
      theme: {
        description: "Change terminal theme",
        usage: "theme [dark|hacker|retro]",
        action: this.themeCommand.bind(this),
      },
      date: {
        description: "Display current date and time",
        usage: "date",
        action: this.dateCommand.bind(this),
      },
      github: {
        description: "Open my GitHub profile",
        usage: "github",
        action: this.githubCommand.bind(this),
      },
      linkedin: {
        description: "Open my LinkedIn profile",
        usage: "linkedin",
        action: this.linkedinCommand.bind(this),
      },
      repo: {
        description: "View the source code of this website",
        usage: "repo",
        action: this.repoCommand.bind(this),
      },
      resume: {
        description: "View or download my resume",
        usage: "resume",
        action: this.resumeCommand.bind(this),
      },
      blog: {
        description: "View my blog posts",
        usage: "blog [post-id or post-slug]",
        action: this.blogCommand.bind(this),
      },
      // Secret commands are handled in easter-eggs.js
    };
  }

  setTerminal(terminal) {
    this.terminal = terminal;
  }

  executeCommand(inputText) {
    const args = inputText.trim().split(" ");
    const commandName = args[0].toLowerCase();
    const params = args.slice(1);

    if (this.commands[commandName]) {
      this.commands[commandName].action(params);
    } else {
      this.terminal.printLine(
        `Command not found: ${commandName}. Type 'help' for available commands.`,
        "error"
      );
    }
  }

  completeCommand(inputText) {
    if (!inputText) return "";

    const possibleCommands = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(inputText.toLowerCase())
    );

    if (possibleCommands.length === 1) {
      return possibleCommands[0];
    }

    if (possibleCommands.length > 0) {
      this.terminal.printLine("");
      this.terminal.printLine(possibleCommands.join("  "));
      this.terminal.createNewInput();
    }

    return "";
  }

  helpCommand(args) {
    if (args.length > 0) {
      const cmd = args[0].toLowerCase();
      if (this.commands[cmd]) {
        this.terminal.printLine(`${cmd} - ${this.commands[cmd].description}`);
        this.terminal.printLine(`Usage: ${this.commands[cmd].usage}`);
      } else {
        this.terminal.printLine(`Command not found: ${cmd}`, "error");
      }
      return;
    }

    this.terminal.printLine("Available commands:", "success");
    Object.keys(this.commands)
      .sort()
      .forEach((cmd) => {
        this.terminal.printLine(
          `  ${cmd.padEnd(12)} - ${this.commands[cmd].description}`
        );
      });
    this.terminal.printLine("");
    this.terminal.printLine(
      'Type "help [command]" for more information about a specific command.'
    );
  }

  aboutCommand() {
    const aboutText = `
Hi there! 👋 I'm a seasoned technology leader with over 10 years of experience in designing 
and implementing scalable, secure solutions for complex systems.

Currently serving as Sr. Engineering Manager of Digital Experience & Engineering at Razorpod,
I specialize in:

  - Backend Development with Node.js, TypeScript, and JavaScript
  - Database Management using MongoDB, Redis, and NoSQL solutions
  - Immersive Technologies and WebXR
  - Frontend Development with Vue.js, Nuxt.js, and modern CSS/SCSS
  - DevOps & Cloud Infrastructure

I'm passionate about pushing technological boundaries and driving innovation.
Feel free to explore my work using the commands listed in 'help'.
    `;

    this.terminal.printLine(aboutText);
  }

  projectsCommand() {
    this.terminal.printLine("Notable Projects:", "success");

    const projects = [
      {
        name: "Cloud Bar",
        description: "Led product development and technology team as CTO",
        tech: "TypeScript, Front-End Development",
        period: "2018-2020",
      },
      {
        name: "GiGlue",
        description:
          "Co-founded and developed complete artist booking solution",
        tech: "Node.js, Nuxt.js, MongoDB, ExpressJS, Azure",
        period: "2017-2018",
      },
      {
        name: "Razorpod Solutions",
        description: "Architected and implemented digital experience solutions",
        tech: "WebXR, Vue.js, Node.js, Cloud Infrastructure",
        period: "2018-Present",
      },
    ];

    projects.forEach((project, i) => {
      this.terminal.printLine(`
      ${i + 1}. ${project.name} (${project.period})
         ${project.description}
         Technologies: ${project.tech}
      `);
    });

    this.terminal.printLine('\nType "github" to see more of my projects.');
  }

  skillsCommand() {
    this.terminal.printLine("Technical Expertise:", "success");

    const skills = {
      "Backend Development": [
        "Node.js",
        "TypeScript",
        "JavaScript",
        "API Design",
        "Distributed Systems",
      ],
      "Frontend Development": [
        "Vue.js",
        "Nuxt.js",
        "Modern CSS/SCSS",
        "WebXR",
        "Responsive Design",
      ],
      "Database & Cache": [
        "MongoDB",
        "Redis",
        "NoSQL",
        "High-Volume Data Management",
      ],
      "DevOps & Cloud": [
        "Linux Administration",
        "CI/CD",
        "Cloud-Native",
        "Infrastructure as Code",
      ],
      "Project Management": [
        "SDLC",
        "Agile",
        "JIRA",
        "Trello",
        "GitLab",
        "Notion",
      ],
      Architecture: [
        "System Design",
        "Scalable Solutions",
        "Security",
        "Cloud Architecture",
      ],
    };

    Object.keys(skills).forEach((category) => {
      this.terminal.printLine(`\n${category}:`);
      this.terminal.printLine(`  ${skills[category].join(", ")}`);
    });
  }

  contactCommand() {
    this.terminal.printLine("Contact Information:", "success");
    this.terminal.printLine("\nEmail: varun@razorpod.in");
    this.terminal.printLine("GitHub: github.com/varunkakkar");
    this.terminal.printLine("LinkedIn: linkedin.com/in/varunemkakkar");
    this.terminal.printLine("Twitter: @markandeykaju");

    this.terminal.printLine(
      "\nFeel free to reach out! I'm always open to interesting conversations and opportunities."
    );
  }

  clearCommand() {
    this.terminal.clearTerminal();
  }

  echoCommand(args) {
    this.terminal.printLine(args.join(" "));
  }

  themeCommand(args) {
    const validThemes = ["dark", "hacker", "retro"];
    const theme = args[0]?.toLowerCase();

    if (!theme || !validThemes.includes(theme)) {
      this.terminal.printLine(
        "Available themes: dark, hacker, retro",
        "warning"
      );
      this.terminal.printLine("Usage: theme [theme-name]", "warning");
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);
    this.terminal.printLine(`Theme switched to ${theme}`, "success");
  }

  dateCommand() {
    const now = new Date();
    this.terminal.printLine(`Current date: ${now.toLocaleDateString()}`);
    this.terminal.printLine(`Current time: ${now.toLocaleTimeString()}`);
  }

  githubCommand() {
    window.open("https://github.com/varunkakkar", "_blank");
    this.terminal.printLine("Opening GitHub profile...", "success");
  }

  linkedinCommand() {
    window.open("https://linkedin.com/in/varunemkakkar", "_blank");
    this.terminal.printLine("Opening LinkedIn profile...", "success");
  }

  repoCommand() {
    window.open("https://github.com/varunkakkar/portfolio-website-vanilla", "_blank");
    this.terminal.printLine("Opening repository...", "success");
  }

  resumeCommand() {
    this.terminal.printLine("Opening resume...", "success");
    this.terminal.printLine(
      "You can view or download my resume from the link below:"
    );
    setTimeout(() => {
      const linkLine = this.terminal.printLine("");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Download Resume (PDF)";
      link.target = "_blank";
      linkLine.innerHTML = "";
      linkLine.appendChild(link);
    }, 500);
  }

  async blogCommand(args) {
    try {
      // Initialize blog loader if not already done
      await blogLoader.initialize();

      // Get all blog posts
      const posts = await blogLoader.getAllPosts();

      if (args.length === 0) {
        // List all blog posts
        this.terminal.printLine("📝 My Blog Posts:", "success");
        this.terminal.printLine("");

        posts.forEach((post) => {
          this.terminal.printLine(`[${post.id}] ${post.title} - ${post.date}`);
          this.terminal.printLine(`     Tags: ${post.tags.join(", ")}`);
          this.terminal.printLine("");
        });

        this.terminal.printLine(
          "To read a post, type: blog [post-id]",
          "warning"
        );
      } else {
        // Try to get specific post
        const query = args.join(" ");

        // Check if it's a numeric ID
        if (/^\d+$/.test(query)) {
          const id = parseInt(query);
          // Store the theme preference
          sessionStorage.setItem(
            "currentTheme",
            document.documentElement.getAttribute("data-theme") || "dark"
          );
          window.open(`blog.html?id=${id}`, "_blank");
          this.terminal.printLine("Opening blog post...", "success");
        } else {
          // Assume it's a slug
          window.open(`blog.html?slug=${query}`, "_blank");
          this.terminal.printLine("Opening blog post...", "success");
        }
      }
    } catch (error) {
      this.terminal.printLine(
        `Error loading blog posts: ${error.message}`,
        "error"
      );
    }
  }
}

export default CommandsHandler;
