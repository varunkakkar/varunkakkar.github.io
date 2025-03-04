import blogLoader from "./blog-loader.js";
import seoManager from "./seo-manager.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Get blog post ID or slug from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const postSlug = urlParams.get("slug");

  // Consistently use sessionStorage for theme preference
  const currentTheme = sessionStorage.getItem("currentTheme") || "dark";

  // Set theme
  document.documentElement.setAttribute("data-theme", currentTheme);

  // Initialize theme switcher
  createThemeSwitcher(currentTheme);

  // Handle window controls
  initWindowControls();

  try {
    // Initialize the blog loader
    await blogLoader.initialize();

    // Get the post (either by ID or by slug)
    let currentPost;
    if (postId) {
      currentPost = await blogLoader.getPostById(postId);
    } else if (postSlug) {
      currentPost = await blogLoader.getPostBySlug(postSlug);
    } else {
      // If no ID or slug provided, get the first post
      const allPosts = await blogLoader.getAllPosts();
      if (allPosts && allPosts.length > 0) {
        currentPost = await blogLoader.getPostById(allPosts[0].id);
      } else {
        throw new Error("No blog posts found");
      }
    }

    // Get all posts for navigation
    const allPosts = await blogLoader.getAllPosts();

    // Render the post
    renderBlogPost(currentPost);

    // Set up navigation
    setupNavigation(currentPost.id);

    // Set up share buttons
    setupShareButtons(currentPost);

    // Apply SEO optimizations
    seoManager.updatePostSeo(currentPost);

    // Initialize Utterances comments with the current post title
    initializeUtterances(currentPost.title);
  } catch (err) {
    displayError("Error loading blog post: " + err.message);
  }
});

function renderBlogPost(post) {
  // Set title and metadata
  document.title = `${post.title} | Terminal Portfolio`;
  document.getElementById("blog-title").textContent = post.title;
  document.getElementById("blog-date").textContent = post.date;

  // Add tags
  const tagsContainer = document.getElementById("blog-tags");
  tagsContainer.innerHTML = "";
  post.tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.className = "tag";
    tagEl.textContent = tag;
    tagEl.addEventListener("click", () => {
      // Navigate to blog list with tag filter
      window.location.href = `index.html#blog?tag=${tag}`;
    });
    tagsContainer.appendChild(tagEl);
  });

  // Render markdown content
  const blogBody = document.getElementById("blog-body");
  blogBody.innerHTML = "";
  renderMarkdownContent(post.content, blogBody);

  // Add animation to the content
  animateContent();
}

async function setupNavigation(currentPostId) {
  const { prev, next } = await blogLoader.getAdjacentPosts(currentPostId);

  const prevButton = document.getElementById("prev-post");
  const nextButton = document.getElementById("next-post");

  // Setup previous post button
  if (prev) {
    prevButton.onclick = () => navigateToBlogPost(prev.id);
    prevButton.title = prev.title;
    prevButton.innerHTML = `← ${prev.title}`;
    prevButton.classList.remove("disabled");
  } else {
    prevButton.classList.add("disabled");
    prevButton.onclick = null;
  }

  // Setup next post button
  if (next) {
    nextButton.onclick = () => navigateToBlogPost(next.id);
    nextButton.title = next.title;
    nextButton.innerHTML = `${next.title} →`;
    nextButton.classList.remove("disabled");
  } else {
    nextButton.classList.add("disabled");
    nextButton.onclick = null;
  }
}

function navigateToBlogPost(postId) {
  window.location.href = `blog.html?id=${postId}`;
}

// Remove or modify this function as its functionality is now handled by seoManager
function updateMetaTags(post) {
  // This function is now replaced by seoManager.updatePostSeo
  // You can remove it or keep it as a simple redirect to the new function
  seoManager.updatePostSeo(post);
}

function animateContent() {
  const elements = document.querySelectorAll("#blog-body > *");
  elements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100 + index * 50);
  });
}

function renderMarkdownContent(markdown, container) {
  if (!markdown || typeof markdown !== "string") {
    container.innerHTML = "<p>No content available.</p>";
    return;
  }

  // Split content by lines for processing
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeContent = "";
  let codeLanguage = "";
  let currentParagraph = null;
  let inList = false;
  let listType = null;
  let listElement = null;
  let inBlockquote = false;
  let blockquoteElement = null;

  lines.forEach((line) => {
    // Fix 1: Better code block detection - handle empty language specification
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        if (codeLanguage && codeLanguage !== "") {
          code.className = `language-${codeLanguage}`;
        }
        code.textContent = codeContent;
        pre.appendChild(code);
        container.appendChild(pre);

        codeContent = "";
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        // Start of code block - check for language
        inCodeBlock = true;
        codeLanguage = line.substring(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      return;
    }

    // Fix 2: Improve blockquote handling
    if (line.startsWith(">")) {
      const quoteContent = line.substring(1).trim();

      if (!inBlockquote) {
        blockquoteElement = document.createElement("blockquote");
        container.appendChild(blockquoteElement);
        inBlockquote = true;
      }

      const p = document.createElement("p");
      p.innerHTML = processInlineMarkdown(quoteContent);
      blockquoteElement.appendChild(p);
      return;
    } else if (inBlockquote && line.trim() === "") {
      // Keep blockquote for empty lines within it
      return;
    } else if (inBlockquote) {
      inBlockquote = false;
      blockquoteElement = null;
    }

    // Fix 3: Improve list handling with better regex
    if (line.match(/^(\s*)[-*+]\s/) || line.match(/^(\s*)\d+\.\s/)) {
      const isOrdered = line.match(/^(\s*)\d+\.\s/) !== null;

      // Check if we need to start a new list or continue an existing one
      if (
        !inList ||
        (isOrdered && listType === "ul") ||
        (!isOrdered && listType === "ol")
      ) {
        inList = true;
        listType = isOrdered ? "ol" : "ul";
        listElement = document.createElement(listType);
        container.appendChild(listElement);
      }

      const listItem = document.createElement("li");
      listItem.innerHTML = processInlineMarkdown(
        line.replace(/^(\s*)[-*+]\s/, "").replace(/^(\s*)\d+\.\s/, "")
      );
      listElement.appendChild(listItem);

      return;
    } else if (line.trim() === "" && inList) {
      // End list if line is empty
      inList = false;
      listType = null;
      listElement = null;
    } else if (
      inList &&
      !line.match(/^(\s*)[-*+]\s/) &&
      !line.match(/^(\s*)\d+\.\s/)
    ) {
      // End list if line is not part of a list anymore
      inList = false;
      listType = null;
      listElement = null;
    }

    // Fix 4: Handle horizontal rules
    if (
      line.match(/^-{3,}$/) ||
      line.match(/^_{3,}$/) ||
      line.match(/^\*{3,}$/)
    ) {
      const hr = document.createElement("hr");
      container.appendChild(hr);
      currentParagraph = null;
      return;
    }

    // Handle headings
    if (line.startsWith("# ")) {
      const h1 = document.createElement("h1");
      h1.innerHTML = processInlineMarkdown(line.substring(2));
      container.appendChild(h1);
      currentParagraph = null;
    } else if (line.startsWith("## ")) {
      const h2 = document.createElement("h2");
      h2.innerHTML = processInlineMarkdown(line.substring(3));
      container.appendChild(h2);
      currentParagraph = null;
    } else if (line.startsWith("### ")) {
      const h3 = document.createElement("h3");
      h3.innerHTML = processInlineMarkdown(line.substring(4));
      container.appendChild(h3);
      currentParagraph = null;
    } else if (line === "") {
      // End paragraph on empty line
      currentParagraph = null;
    } else {
      // Handle images - Fix 5: Improved image handling
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const alt = imageMatch[1];
        const src = imageMatch[2];

        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.title = alt;
        img.loading = "lazy";
        img.className = "blog-image"; // Add class for styling
        container.appendChild(img);
        currentParagraph = null;
        return;
      }

      // Regular text - handle inline markdown
      const processedLine = processInlineMarkdown(line);

      if (!currentParagraph) {
        currentParagraph = document.createElement("p");
        container.appendChild(currentParagraph);
      }

      // If there's already content in the paragraph, add a space
      if (currentParagraph.innerHTML) {
        currentParagraph.innerHTML += " ";
      }

      currentParagraph.innerHTML += processedLine;
    }
  });

  // Fix 6: Handle unclosed code blocks
  if (inCodeBlock) {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    if (codeLanguage) {
      code.className = `language-${codeLanguage}`;
    }
    code.textContent = codeContent;
    pre.appendChild(code);
    container.appendChild(pre);
  }

  // Add copy functionality to code blocks after they're rendered
  const codeBlocks = container.querySelectorAll("pre");
  codeBlocks.forEach((block, index) => {
    // Create copy button
    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy";

    // Add click handler
    copyButton.addEventListener("click", async () => {
      const code =
        block.querySelector("code")?.textContent || block.textContent;
      try {
        await navigator.clipboard.writeText(code);
        copyButton.textContent = "Copied!";
        copyButton.classList.add("copied");

        // Reset button state after 2 seconds
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.classList.remove("copied");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
        copyButton.textContent = "Error!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 2000);
      }
    });

    // Add button to code block
    block.style.position = "relative";
    block.insertBefore(copyButton, block.firstChild);
  });

  // If no content was processed, show a message
  if (container.childNodes.length === 0) {
    container.innerHTML = "<p>No content available.</p>";
  }
}

function processInlineMarkdown(text) {
  // Process inline code with `backticks`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Process bold text with **double asterisks**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Process italic text with *single asterisks*
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Process strikethrough
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // Process links [text](url "optional title")
  text = text.replace(
    /\[([^\]]+)\]\(([^)"]+)(?:\s+"([^"]+)")?\)/g,
    (match, text, url, title) => {
      const isExternal = url.startsWith("http") || url.startsWith("//");
      const attrs = [
        `href="${url}"`,
        title ? `title="${title}"` : "",
        isExternal ? 'target="_blank" rel="noopener noreferrer"' : "",
        isExternal ? 'class="external-link"' : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `<a ${attrs}>${text}${
        isExternal ? '<span class="external-icon">↗</span>' : ""
      }</a>`;
    }
  );

  // Process autolinks (URLs directly in text)
  text = text.replace(
    /(^|\s)(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g,
    (match, space, url) => {
      return `${space}<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${url}<span class="external-icon">↗</span></a>`;
    }
  );

  // Process inline images
  text = text.replace(
    /!\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g,
    '<img src="$2" alt="$1" title="$3" class="inline-image" loading="lazy">'
  );

  return text;
}

function displayError(message) {
  const blogBody = document.getElementById("blog-body");
  blogBody.innerHTML = "";

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
    <p>${message}</p>
    <p><a href="index.html" class="nav-btn">Return to Terminal</a></p>
  `;

  blogBody.appendChild(errorDiv);

  // Also clear title and metadata
  document.getElementById("blog-title").textContent = "Error";
  document.getElementById("blog-date").textContent = "";
  document.getElementById("blog-tags").innerHTML = "";
}

function createThemeSwitcher(currentTheme) {
  const themeSwitcher = document.querySelector(".blog-theme-switcher");
  if (!themeSwitcher) return;

  // Clear existing theme options
  themeSwitcher.innerHTML = "";

  const themes = [
    { name: "dark", label: "Dark" },
    { name: "light", label: "Light" },
    { name: "hacker", label: "Hacker" },
    { name: "retro", label: "Retro" },
  ];

  themes.forEach((theme) => {
    const option = document.createElement("div");
    option.className = `theme-option ${theme.name}`;
    if (theme.name === currentTheme) {
      option.classList.add("active");
    }
    option.title = theme.label;
    option.addEventListener("click", () => {
      // Remove active class from all options
      document.querySelectorAll(".theme-option").forEach((el) => {
        el.classList.remove("active");
      });

      // Add active class to selected option
      option.classList.add("active");

      document.documentElement.setAttribute("data-theme", theme.name);
      // Also save the theme preference
      sessionStorage.setItem("currentTheme", theme.name);
    });
    themeSwitcher.appendChild(option);
  });
}

function initWindowControls() {
  // Handle window control buttons
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const minimizeBtn = document.querySelector(".minimize-btn");
  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      // Visual effect only
      const container = document.querySelector(".blog-container");
      container.style.transition = "transform 0.3s";
      container.style.transform = "translateY(5px) scale(0.98)";
      setTimeout(() => {
        container.style.transform = "translateY(0) scale(1)";
      }, 300);
    });
  }

  const maximizeBtn = document.querySelector(".maximize-btn");
  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      const container = document.querySelector(".blog-container");
      if (container) {
        container.classList.toggle("maximized");

        if (container.classList.contains("maximized")) {
          container.style.maxWidth = "none";
          container.style.margin = "0";
          container.style.borderRadius = "0";
          document.body.style.overflow = "hidden";
          document.body.style.height = "100vh";
        } else {
          container.style.maxWidth = "800px";
          container.style.margin = "40px auto";
          container.style.borderRadius = "8px";
          document.body.style.overflow = "auto";
          document.body.style.height = "auto";
        }
      }
    });
  }
}

function setupShareButtons(post) {
  const shareContainer = document.querySelector(".share-buttons");
  if (!shareContainer) return;

  // Clear existing share buttons
  shareContainer.innerHTML = "<span>Share this post:</span>";

  // Get current URL for sharing
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(post.title || "Blog Post");

  // Create share buttons
  const socials = [
    {
      name: "Twitter",
      icon: "🐦",
      href: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    },
    {
      name: "LinkedIn",
      icon: "💼",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    },
    {
      name: "Facebook",
      icon: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
  ];

  socials.forEach((social) => {
    const btn = document.createElement("a");
    btn.href = social.href;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = "share-btn";
    btn.title = `Share on ${social.name}`;
    btn.innerHTML = social.icon;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Open a popup window for sharing
      window.open(social.href, "share-popup", "height=500,width=600");
      return false;
    });
    shareContainer.appendChild(btn);
  });
}

// Add this new function to initialize Utterances
function initializeUtterances(postTitle) {
  // Remove any existing Utterances script
  const existingScript = document.querySelector(".utterances-script");
  if (existingScript) {
    existingScript.remove();
  }

  const commentsContainer = document.getElementById("comments-container");
  if (!commentsContainer) return;

  // Clear the container
  commentsContainer.innerHTML = "";

  // Create the script element
  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.setAttribute("repo", "varunkakkar/varunkakkar.github.io");
  script.setAttribute("issue-term", postTitle); // Use the exact post title
  script.setAttribute("theme", "github-dark");
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("async", "");
  script.setAttribute("defer", "");
  script.className = "utterances-script";

  // Append to container
  commentsContainer.appendChild(script);
}
