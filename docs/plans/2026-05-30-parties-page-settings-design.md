# Parties Page Settings — Admin-Editable Pricing

**Date:** 2026-05-30
**Status:** Design approved, ready for implementation

## Problem

The public Parties page (`src/app/views/parties/parties.html`) has pricing and package content hardcoded in the template. Updating any package — name, price, description, bullets — requires a code change and a deploy. Admins need to edit this content from the admin UI, the same way they edit the Classes page settings.

## Solution

Mirror the existing `class-page-settings` pattern end-to-end. Add a new admin "Page Settings" screen for parties, persist content via a new backend endpoint, and rewire the public parties page to read from the API.

## Data Model

A single settings row, with packages stored as a JSON column.

```typescript
export interface PartyPackage {
  id?: number;
  name: string;          // "Private Party"
  price: string;         // free-text: "$200", "Contact for pricing"
  description: string;
  bullets: string[];
  display_order: number;
  active: boolean;
}

export interface PartyPageSettings {
  id?: number;
  intro: string;         // page-level intro paragraph
  footer_note: string;   // page-level fine print below packages
  packages: PartyPackage[];
  updated_at?: string;
}
```

JSON column over a separate `party_packages` table: small dataset, always read and written as a unit, reordering is trivial (rewrite the array), no joins on the public page.

## Backend (PHP)

### Migration

Create `party_page_settings` table:

- `id INT PRIMARY KEY`
- `intro TEXT`
- `footer_note TEXT`
- `packages JSON`
- `updated_at TIMESTAMP`

Seed with one row carrying the current hardcoded content:

- **Private Party** — $200, bullets include "Up to 15 kids", "$10 per additional child"
- **Open Gym Party** — $150, bullets include "Up to 15 kids", "$8 per additional child"
- **Groups & Field Trips** — "Contact for pricing"

All three seeded as `active: true`, `display_order: 1..3`.

### Controller

`api/controllers/PartyPageSettingsController.php` — three methods matching `ClassPageSettingsController`:

- `getPublic()` — returns the row; filters `packages` to `active: true`, sorted by `display_order`. No auth.
- `getAdmin()` — returns the full row including inactive packages. Auth required.
- `update()` — accepts the full settings object, validates, writes back. Auth required.

### Routes

Added to `api/routes/api.php` next to the existing class-page-settings routes, using the same auth middleware:

- `GET /party-page-settings/public`
- `GET /party-page-settings`
- `PUT /party-page-settings`

### Validation (update)

- `intro`, `footer_note` — strings, may be empty
- `packages` — array; each item requires `name` (non-empty), `price` (non-empty), `description` (string), `bullets` (array of strings), `display_order` (int), `active` (bool)
- Server normalizes `display_order` to sequential 1..n on save so reordering doesn't leave gaps

## Admin UI (Angular)

### Component

New component at `src/app/views/admin/parties/settings/` with `settings.ts`, `settings.html`, `settings.scss`. Mirrors `admin/classes/settings/`.

### Routing

Add a child route under the existing admin parties routes: `/admin/parties/settings` → `PartiesSettings`.

### Navigation

Add a "Page Settings" link on the existing `admin/parties/list` page, positioned the same way the classes admin surfaces its settings link.

### Service

Add to `src/app/services/parties.ts` (create or extend):

- `getPartyPageSettingsPublic()`
- `getPartyPageSettingsAdmin()`
- `updatePartyPageSettings(settings)`

### Form

Reactive Forms:

```
FormGroup {
  intro:       FormControl<string>
  footer_note: FormControl<string>
  packages:    FormArray<FormGroup>
}

Each package FormGroup {
  id:            hidden
  name:          required
  price:         required
  description:   optional
  bullets:       FormArray<FormControl<string>>
  display_order: hidden, managed by reorder buttons
  active:        boolean
}
```

### Layout

1. Page header: "Parties Page Settings" + Save button
2. Intro section — textarea
3. Packages section — vertical stack of package cards, each with:
   - Up/down arrow buttons (reorder)
   - Active toggle (switch)
   - Name + Price inputs on one row
   - Description textarea
   - Bullets — dynamic list with "+ Add bullet" and trash-icon-per-row
   - "Remove package" button with confirmation
   - "+ Add package" button at the bottom of the list
4. Footer note section — textarea

Reordering uses up/down arrows rather than drag-and-drop: no extra dependency, accessible by default, fine for the small number of packages expected.

Single Save button writes the whole settings object via `PUT`. Loading + success/error toast feedback matching the classes settings page.

## Public Page Integration

### Component (`src/app/views/parties/parties.ts`)

- Inject the parties service, call `getPartyPageSettingsPublic()` on init
- Hold `settings: PartyPageSettings | null`
- Existing contact form logic untouched — purely additive

### Template (`src/app/views/parties/parties.html`)

- Replace the hardcoded intro paragraph with `{{ settings.intro }}`
- Replace the three hardcoded package cards with `@for (pkg of settings.packages; track pkg.id) { ... }` rendering name, price, description, and bullets
- Add `@if (settings.footer_note) { <p class="footer-note">{{ settings.footer_note }}</p> }` below the package list
- Server already filters to active packages and sorts by `display_order`, so the template stays dumb

### Loading & error states

- Loading: render page chrome with a subtle skeleton in the packages section. Don't blank out the contact form.
- API error: log it, render an empty package list. Contact form still works. No banner — parties is a marketing page.

Existing party-card CSS classes are reused. The shape of each card is identical to the current hardcoded version, so the visual output is unchanged after the initial seed.

## Testing

### Backend

- Verify all three endpoints manually with the existing auth setup
- Confirm the migration runs cleanly and seeds the three packages
- Confirm public endpoint filters inactive and sorts by `display_order`

### Frontend

Walk the happy path in a browser:

1. Public parties page loads with seeded content matching the current hardcoded version
2. Admin → Parties → Page Settings loads; all three packages render in the form
3. Edit a package name, save, reload — change persists on public page
4. Toggle `active: false` on a package → disappears from public, still visible in admin
5. Reorder with arrows → public reflects new order after save
6. Add a new package + new bullets → appears on public page
7. Delete a package → confirms, removed from both admin and public

Type-check passes.

## Rollout

1. Merge backend (migration + controller + routes)
2. Deploy backend; verify `GET /party-page-settings/public` returns seeded data
3. Merge frontend (admin component + service + public page rewire)
4. Deploy frontend; verify public parties page renders identically to before
5. Log in to admin and tweak content as desired

## Out of Scope (YAGNI)

- Image uploads per package
- Drag-and-drop reorder (arrows only)
- Revision history / undo
- Per-package custom key/value fields beyond bullets
- CTA/button text editing
