# Privacy Policy Page + Form Notices

**Date:** 2026-06-29
**Status:** Design approved, ready for implementation

## Problem

The site collects personal information (including children's names and ages) through
two public forms but has no published privacy policy and no notice at the point of
collection. This is a legal-soundness gap: visitors should be able to read how their
data is handled, and the forms should give conspicuous notice linking to that policy
before submission.

## Solution

1. Add a static **Privacy Policy** page rendering the approved policy text.
2. Link to it sitewide from the footer.
3. Add a short privacy notice with a link above the submit button on both public
   forms (Contact Us, Party Request).

No backend, no database, no consent checkbox. Notice + link is the industry-standard,
legally-sound approach for low-risk inquiry forms; it can be upgraded to a required
consent checkbox later if stricter consent records are ever needed.

## Privacy Policy Page

### Component

New standalone view at `src/app/views/privacy-policy/`, mirroring the existing
`contact-us` view:

- `privacy-policy.ts` — standalone component, imports `CommonModule` and the shared
  `ViewHeader` component
- `privacy-policy.html` — the policy banner via `<app-view-header>` plus the full
  policy text
- `privacy-policy.scss` — styles
- `privacy-policy.routes.ts` — `{ path: '', component: PrivacyPolicy }`

### Content & accessibility

The full approved policy text is hardcoded in `privacy-policy.html`, rendered as
semantic, accessible markup consistent with the site's recent ADA work:

- Proper `<h1>`/`<h2>` heading hierarchy (page title, then each section)
- Real `<ul>`/`<li>` for every bulleted section
- Effective date prominent at the top
- Contact email as a `mailto:` link, phone as a `tel:` link
- Readable line length and contrast

Editing the policy is a code change + deploy — appropriate for legal text that
changes roughly once a year. (Admin-editable storage was considered and rejected as
YAGNI.)

### Routing

Add a lazy-loaded route to `src/app/app.routes.ts`, matching the existing pattern:

```ts
{
  path: 'privacy-policy',
  loadChildren: () =>
    import('./views/privacy-policy/privacy-policy.routes')
      .then(m => m.privacyPolicyRoutes)
}
```

### Navigation

Append a single link to the footer `quickLinks` array in
`src/app/components/footer/footer.ts`:

```ts
{ name: 'Privacy Policy', href: '/privacy-policy' }
```

Footer only — **not** the main header nav. The footer is the conventional, expected
location, keeps the top nav uncluttered, and satisfies the "reasonably conspicuous,
sitewide" requirement.

## Form Notices

Both forms get a short notice directly above the submit button, where the existing
helper text ("We'll respond within 24 hours") already sits. Purely additive template
markup — no `FormGroup` / `FormControl` changes, no new validation.

### Contact Us (`src/app/views/contact-us/contact-us.html`)

Above the Send Message button:

```html
<p class="text-sm text-gray-500 mt-3 text-center">
  By submitting this form, you agree to our
  <a routerLink="/privacy-policy" target="_blank" rel="noopener"
     class="underline hover:text-gray-700">Privacy Policy</a>.
</p>
```

### Party Request (`src/app/views/parties/parties.html`)

Above the Submit Party Request button. Includes a TCPA-safety clarification because
the form collects a phone number with a "can text" option:

```html
<p class="text-sm text-gray-500 mt-3 text-center">
  By submitting, you agree to our
  <a routerLink="/privacy-policy" target="_blank" rel="noopener"
     class="underline hover:text-gray-700">Privacy Policy</a>.
  If you opt in to texts, we'll only text you about your party inquiry.
</p>
```

### Key details

- **`target="_blank"` / `rel="noopener"`** — opening the policy must not navigate away
  and wipe data the user has already entered into the form.
- **`RouterLink` import** — verify `RouterLink` is in the `imports` array of the
  `contact-us` and `parties` components; add it where missing.
- **Styling** — reuse the existing `text-sm text-gray-500` helper-text style so the
  notice sits naturally next to the existing helper line rather than looking bolted on.

## Testing

Walk the happy path in a browser:

1. `/privacy-policy` loads, renders the full policy with correct headings, lists, and
   working `mailto:`/`tel:` links.
2. Footer "Privacy Policy" link navigates to the page from any route.
3. Contact Us form shows the notice above the submit button; the link opens the policy
   in a new tab without losing entered form data.
4. Party Request form shows the notice plus the texting clarification; link behaves the
   same.
5. Type-check passes; lazy route loads without console errors.

## Out of Scope (YAGNI)

- Admin-editable policy content (DB + controller + editor)
- Required consent checkbox / stored consent records
- Terms of Service or other legal pages
- Cookie consent banner
- Header-nav placement of the policy link
