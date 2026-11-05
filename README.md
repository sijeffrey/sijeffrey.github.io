# sijeffrey.com

Personal site, built by GitHub Pages with Jekyll.

- Homepage text: `index.md`
- Projects list: `_data/projects.yml`
- New post: copy an existing post in `_posts/` to `_posts/YYYY-MM-DD-title.md`. Front matter: `layout: post`, `title`, optional `subtitle`, and `toc: true` for a contents sidebar from `##` headings. Work in progress can go in `_drafts/`, which is never published.
- Preview locally: `jekyll serve --drafts`, then open http://127.0.0.1:4000

## security.txt

`.well-known/security.txt` has an `Expires` date (RFC 9116). Renew it before it passes, and keep it less than a year ahead.
