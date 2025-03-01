/**
 * Blog Loader Module
 * Handles loading blog posts from markdown files
 */

class BlogLoader {
  constructor() {
    this.manifestPath = "blogs/blog-manifest.json";
    this.blogPath = "blogs/";
    this.manifest = null;
    this.posts = [];
  }

  /**
   * Initialize the blog loader by fetching the manifest
   */
  async initialize() {
    try {
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog manifest: ${response.status}`);
      }

      this.manifest = await response.json();
      this.posts = this.manifest.posts || [];
      return this.posts;
    } catch (error) {
      console.error("Error initializing blog loader:", error);
      throw error;
    }
  }

  /**
   * Get all blog posts metadata
   */
  async getAllPosts() {
    if (!this.posts.length) {
      await this.initialize();
    }
    return this.posts;
  }

  /**
   * Get a specific blog post by ID
   */
  async getPostById(id) {
    if (!this.posts.length) {
      await this.initialize();
    }

    // Find the post metadata
    const postMeta = this.posts.find((post) => post.id === parseInt(id));
    if (!postMeta) {
      throw new Error(`Post with ID ${id} not found`);
    }

    // Fetch the markdown content
    const content = await this.fetchPostContent(postMeta.filename);
    return {
      ...postMeta,
      content,
    };
  }

  /**
   * Get a specific blog post by slug
   */
  async getPostBySlug(slug) {
    if (!this.posts.length) {
      await this.initialize();
    }

    // Find the post metadata
    const postMeta = this.posts.find((post) => post.slug === slug);
    if (!postMeta) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    // Fetch the markdown content
    const content = await this.fetchPostContent(postMeta.filename);
    return {
      ...postMeta,
      content,
    };
  }

  /**
   * Fetch the content of a blog post from its markdown file
   */
  async fetchPostContent(filename) {
    try {
      const response = await fetch(`${this.blogPath}${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog post: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching post content for ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Filter posts by tag
   */
  async getPostsByTag(tag) {
    if (!this.posts.length) {
      await this.initialize();
    }

    return this.posts.filter((post) => post.tags.includes(tag));
  }

  /**
   * Get previous and next posts relative to a specific post
   */
  async getAdjacentPosts(postId) {
    if (!this.posts.length) {
      await this.initialize();
    }

    const sortedPosts = [...this.posts].sort((a, b) => a.id - b.id);
    const currentIndex = sortedPosts.findIndex(
      (post) => post.id === parseInt(postId)
    );

    if (currentIndex === -1) {
      return { prev: null, next: null };
    }

    return {
      prev: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
      next:
        currentIndex < sortedPosts.length - 1
          ? sortedPosts[currentIndex + 1]
          : null,
    };
  }
}

export default new BlogLoader();
