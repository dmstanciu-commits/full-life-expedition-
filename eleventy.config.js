const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // --- Pass static files straight through ---
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });
  // 404 is a standalone page (its own minimal styles) — copy verbatim, don't templatize.
  eleventyConfig.ignores.add("src/404.html");
  eleventyConfig.addPassthroughCopy({ "src/404.html": "404.html" });

  // --- Inline a project file (CSS/JS) into the page at build time ---
  eleventyConfig.addFilter("inlineFile", function (relPath) {
    const full = path.join(__dirname, "src", relPath);
    try {
      return fs.readFileSync(full, "utf8");
    } catch (e) {
      return `/* inlineFile: could not read ${relPath} */`;
    }
  });

  // --- Human date for essays (e.g. "June 2026") ---
  eleventyConfig.addFilter("readableDate", function (value) {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("isoDate", function (value) {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().slice(0, 10);
  });

  // --- Essays collection (newest first) ---
  eleventyConfig.addCollection("essays", function (api) {
    return api.getFilteredByGlob("src/essays/*.md").sort((a, b) => b.date - a.date);
  });

  // --- Essays of a given category, helper for thematic pages ---
  eleventyConfig.addFilter("byCategory", function (essays, cat) {
    return (essays || []).filter((e) => (e.data.category || "").toLowerCase() === String(cat).toLowerCase());
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
