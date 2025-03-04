/**
 * Sitemap Generator
 * Run this script to generate a sitemap.xml file based on your blog posts
 */
const fs = require("fs");
const path = require("path");

// Configuration
const DOMAIN = "https://yourdomain.com"; // Replace with your actual domain
const MANIFEST_PATH = path.join(__dirname, "../../blogs/blog-manifest.json");
const OUTPUT_PATH = path.join(__dirname, "../../../sitemap.xml");

// Read blog manifest
function generateSitemap() {
  try {
    // Read manifest file
    const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    const posts = manifestData.posts || [];

    // Start XML content
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/index.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/blog.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add each blog post
    posts.forEach((post) => {
      const postUrl = post.slug
        ? `${DOMAIN}/blog.html?slug=${post.slug}`
        : `${DOMAIN}/blog.html?id=${post.id}`;

      sitemapContent += `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${post.dateIso || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Close XML
    sitemapContent += `
</urlset>`;

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, sitemapContent);
    console.log(`Sitemap generated at: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Error generating sitemap:", err);
  }
}

// Run generator
generateSitemap();
