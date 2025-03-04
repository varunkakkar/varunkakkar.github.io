/**
 * SEO Manager
 * Handles SEO-related functionality for the blog
 */

class SeoManager {
  /**
   * Update all SEO-related elements for a blog post
   * @param {Object} post - The blog post object
   */
  updatePostSeo(post) {
    this.updateTitleAndMeta(post);
    this.addStructuredData(post);
    this.updateCanonicalUrl(post);
  }

  /**
   * Update meta tags and title
   */
  updateTitleAndMeta(post) {
    // Set page title with post title
    document.title = `${post.title} | Terminal Portfolio`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      // Create a description from the first 160 characters of content without markdown
      const plainText = post.content ? this.stripMarkdown(post.content).substring(0, 160) + "..." : post.title;
      metaDesc.setAttribute("content", plainText);
    }
    
    // Update OpenGraph tags
    const tags = [
      { property: "og:title", content: post.title },
      { property: "og:description", content: this.stripMarkdown(post.content).substring(0, 160) + "..." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: window.location.href },
      { property: "article:published_time", content: post.dateIso || post.date },
      { property: "article:section", content: post.category || "Technology" },
      { property: "article:tag", content: post.tags.join(", ") }
    ];
    
    // Twitter card tags
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: this.stripMarkdown(post.content).substring(0, 160) + "..." }
    ];
    
    // Add all tags to head
    this.updateOrCreateMetaTags([...tags, ...twitterTags]);
  }
  
  /**
   * Add schema.org structured data for blog post
   */
  addStructuredData(post) {
    // Remove any existing JSON-LD
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create BlogPosting schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": post.dateIso || post.date,
      "author": {
        "@type": "Person",
        "name": "Portfolio Owner"
      },
      "keywords": post.tags.join(","),
      "description": this.stripMarkdown(post.content).substring(0, 160) + "..."
    };
    
    // Add schema to page
    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
  
  /**
   * Ensure canonical URL is set properly
   */
  updateCanonicalUrl(post) {
    // Remove existing canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Create canonical URL using slug if available
    let canonicalUrl = window.location.origin + window.location.pathname;
    if (post.slug) {
      canonicalUrl = `${window.location.origin}/blog.html?slug=${post.slug}`;
    }
    
    const link = document.createElement('link');
    link.rel = "canonical";
    link.href = canonicalUrl;
    document.head.appendChild(link);
  }
  
  /**
   * Update or create meta tags in the head
   */
  updateOrCreateMetaTags(tags) {
    tags.forEach(tag => {
      const property = tag.property || tag.name;
      const selector = tag.property ? 
        `meta[property="${tag.property}"]` : 
        `meta[name="${tag.name}"]`;
      
      let metaTag = document.querySelector(selector);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (tag.property) {
          metaTag.setAttribute('property', tag.property);
        } else {
          metaTag.setAttribute('name', tag.name);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', tag.content);
    });
  }
  
  /**
   * Remove markdown formatting
   */
  stripMarkdown(markdown) {
    if (!markdown) return "";
    
    return markdown
      .replace(/#{1,6}\s?/g, '') // Remove headings
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Replace links with just the text
      .replace(/!\[(.+?)\]\(.+?\)/g, '$1') // Replace images with alt text
      .replace(/```[\s\S]+?```/g, '') // Remove code blocks
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces into one
      .trim();
  }
}

export default new SeoManager();
