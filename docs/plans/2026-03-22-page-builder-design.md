# Block-Based Page Builder CMS

## Overview

A lightweight block-based page builder that lets admins create new pages by dragging pre-defined content blocks (headings, paragraphs, lists, images, grid layouts) onto a canvas. Pages are stored as structured JSON and rendered dynamically on the public site via a catch-all route.

## Data Model

### `pages` table

```sql
CREATE TABLE pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content JSON NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### `page_images` table

```sql
CREATE TABLE page_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

The `content` column stores the entire block tree as JSON. No separate blocks table — keeps things simple and avoids complex joins.

## Block JSON Structure

Each block has a `type`, `id` (for drag-and-drop tracking), and type-specific `data`.

### Block Types

**Heading**
```json
{
  "id": "block_1",
  "type": "heading",
  "data": { "level": 2, "text": "Summer Programs" }
}
```

**Paragraph**
```json
{
  "id": "block_2",
  "type": "paragraph",
  "data": { "text": "Join us for an exciting summer...", "bold": false, "italic": false }
}
```

**List**
```json
{
  "id": "block_3",
  "type": "list",
  "data": { "style": "bulleted", "items": ["Ages 3-5", "Ages 6-12", "Teens"] }
}
```

**Image**
```json
{
  "id": "block_4",
  "type": "image",
  "data": {
    "source": "gallery",
    "gallery_id": 15,
    "page_image_id": null,
    "alt": "Kids doing gymnastics",
    "caption": "Summer camp 2025"
  }
}
```

Image blocks reference either a `gallery_id` (existing gallery image) or a `page_image_id` (newly uploaded).

**Grid**
```json
{
  "id": "block_5",
  "type": "grid",
  "data": {
    "preset": "2-equal",
    "columns": [
      {
        "blocks": [
          { "id": "block_6", "type": "heading", "data": { "level": 3, "text": "Morning Session" } }
        ]
      },
      {
        "blocks": [
          { "id": "block_7", "type": "paragraph", "data": { "text": "9am to 12pm..." } }
        ]
      }
    ]
  }
}
```

Grid presets: `2-equal`, `3-equal`, `1-3-2-3`, `2-3-1-3`. Blocks inside grid columns can be any type except another grid (no deep nesting).

## API Endpoints

New `PageController.php`, extends `BaseController`, uses the standard response envelope.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/pages` | Public | List published pages (title, slug only) |
| GET | `/pages/:slug` | Public | Get full page by slug with resolved image URLs |
| GET | `/admin/pages` | Staff+ | List all pages (published + drafts, paginated) |
| GET | `/admin/pages/:id` | Staff+ | Get page by ID for editing |
| POST | `/admin/pages` | Staff+ | Create new page |
| PUT | `/admin/pages/:id` | Staff+ | Update page (title, slug, content, is_published) |
| DELETE | `/admin/pages/:id` | Admin | Delete page |
| POST | `/admin/pages/upload-image` | Staff+ | Upload image for page blocks |
| PATCH | `/admin/pages/:id/toggle` | Staff+ | Toggle published/draft |

The public `GET /pages/:slug` resolves image references, replacing `gallery_id` and `page_image_id` with actual URLs so the frontend doesn't need extra calls.

Image uploads stored in `api/uploads/pages/`, using existing `FileUploadUtility` and `ImageProcessor`.

## Admin UI

### Page List (`/admin/pages`)

Standard list view following existing patterns:
- Table: Title, Slug, Status (Published/Draft), Last Updated
- Search/filter by title
- Inline toggle for published/draft
- Create, Edit, Delete actions

### Page Editor (`/admin/pages/create` and `/admin/pages/:id/edit`)

Two zones:

**Top bar** — Page title input, auto-generated slug (editable), Published toggle, Save button.

**Block canvas** — Blocks rendered vertically. Each block has:
- Drag handle on the left (reordering via Angular CDK `cdkDrag`)
- Block content in the middle (inline editing fields)
- Action buttons on the right: move up, move down, delete

**Adding blocks** — "Add Block" button at the bottom and between each block. Opens a picker with icons: Heading, Paragraph, List, Image, Grid. Clicking inserts the block.

### Block Editing (inline)

- **Heading** — Dropdown for H1-H6, text input
- **Paragraph** — Textarea with bold/italic toggle buttons
- **List** — Toggle bulleted/numbered, dynamic list of text inputs with add/remove item
- **Image** — "Upload" or "Choose from Gallery" buttons, alt text and caption inputs
- **Grid** — Preset selector dropdown, each column becomes a mini drop zone accepting blocks (grid excluded from the nested picker)

Drag-and-drop powered by `@angular/cdk/drag-drop`.

## Public Page Rendering

### Route

Catch-all route at the bottom of `app.routes.ts`:

```typescript
{ path: ':slug', loadComponent: () => import('./views/dynamic-page/dynamic-page') }
```

### DynamicPageComponent

Fetches `/pages/:slug` on init. Redirects to home on 404.

### PageBlockRendererComponent

Takes a block and renders based on type using `@switch`:

- `heading` → `<h1>`-`<h6>`
- `paragraph` → `<p>` with inline bold/italic
- `list` → `<ul>` or `<ol>` with `<li>` items
- `image` → `<img>` with resolved URL, optional `<figcaption>`
- `grid` → Flex/grid container with preset-driven column widths, each column recursively rendering its blocks through the same component

Grids stack to single column on mobile via Tailwind responsive classes.

## Files

### New Files

**Backend:**
- `api/migrations/025_create_pages_tables.sql`
- `api/controllers/PageController.php`
- `api/models/Page.php`
- `api/models/PageImage.php`

**Frontend (admin):**
- `src/app/views/admin/pages/pages.routes.ts`
- `src/app/views/admin/pages/list/` (html, scss, ts)
- `src/app/views/admin/pages/editor/` (html, scss, ts)
- `src/app/views/admin/pages/block-picker/` (html, scss, ts)
- `src/app/views/admin/pages/blocks/` — individual block editor components (heading, paragraph, list, image, grid)

**Frontend (public):**
- `src/app/views/dynamic-page/` (html, scss, ts)
- `src/app/components/page-block-renderer/` (html, scss, ts)

### Modified Files

- `api/routes/api.php` — add page routes
- `src/app/app.routes.ts` — add catch-all `:slug` route at end
- `src/app/views/admin/admin-layout/admin-layout.ts` — add "Pages" to sidebar nav
- `src/app/services/api.service.ts` — add page-related API methods
