# Style Guide

[中文](./style-guide.md)

This guide documents the `next-supabase-scaffold` visual system. The interface
uses a restrained developer-console direction. Authentication fields, validation,
feedback, and accessibility remain stable core behavior.

## 1. Direction

- Use near-black neutral surfaces with a green authentication signal.
- Show the project name and a local HTML/CSS authentication pipeline without external images or abstract SVGs.
- Explain completed infrastructure without inventing business data or features.
- Keep the private workspace quiet and scannable.
- Reserve cards for repeated capabilities and genuine status items.

## 2. Tokens

Tokens live in `:root` inside `src/app/globals.css`:

- `--background`, `--foreground`: page and text.
- `--card`, `--popover`: panel and elevated surfaces.
- `--primary`: authentication success, primary actions, and connection status.
- `--muted`, `--muted-foreground`: secondary surfaces and text.
- `--border`, `--input`, `--ring`: boundaries, controls, and focus.
- `--font-ui`, `--font-display`, `--font-code`: body, display, and code fonts.
- `--app-shadow-*`: authentication card and terminal shadows.

Prefer semantic utilities rather than raw colors in business components.

## 3. Typography

- Body: Avenir Next, Segoe UI, PingFang SC.
- Display: Iowan Old Style, Songti SC, Georgia.
- Project names, paths, status, and code: SFMono-Regular, Consolas.
- Use fixed type levels with changes only at the 980px and 640px breakpoints.
- Keep body line height at or above `1.6` and multiline Chinese display headings at or above `1.1`.
- Keep letter spacing at zero or positive values and allow long names to wrap.

## 4. Layout

- Page content is capped at `1440px`.
- Use a three-column desktop homepage navigation: brand, centered menu, and trailing action.
- Keep the homepage navigation sticky without borders; reveal its full-width downward shadow and subtle brand-color reflection only after the page scrolls.
- Keep the authenticated workspace header sticky without borders; reveal its full-width downward shadow and subtle brand-color reflection only after the page scrolls.
- Desktop padding uses `clamp()`; mobile retains at least `12px`.
- Use only the `980px` and `640px` responsive breakpoints.
- The homepage first viewport reveals part of the status strip.
- Fixed controls need stable heights so dynamic state cannot shift adjacent layout.

## 5. Controls

- Interactive targets are at least `44px`.
- Compact header commands may use a 32px visual shell only when a transparent extension preserves a 44px hit target.
- Use Lucide icons. Icon-only buttons require an accessible name.
- Use `Tabs` for related content panels and Checkbox for binary consent.
- Link buttons use `buttonVariants()` to preserve native link semantics.
- Disabled states block interaction and remain visually explicit.

## 6. Forms

- Compose forms with `FieldGroup`, `Field`, `FieldLabel`, and `FieldError`.
- Use `InputGroup` for input actions and retain accessible password visibility.
- Give every input a clear placeholder; render placeholders at the secondary body size so they remain quieter than entered values.
- Render field labels at the secondary body size and place smaller validation text immediately after the label.
- Keep error color on input boundaries and error messages without recoloring field labels.
- Keep the email-code request action as a native text link aligned right beside the label, with the input on the next row.
- The sign-in method tabs and email-code sign-in are temporarily hidden through the `auth-email-code-hidden` style state while their components and interaction code remain intact.
- Associate errors through `aria-invalid` and `aria-describedby`.
- Describe the supported common providers below the registration email field and show unsupported-domain errors beside its label.
- Require at least eight characters for new passwords in both local and hosted Supabase configuration.
- Email-code input keeps digits only without imposing a length, supports `one-time-code`, and enforces a 60-second cooldown.
- Login and registration retain consent, pending state, localized errors, and strength feedback; weak, medium, and strong use the destructive, amber, and primary colors.

## 7. Motion

- Prefer CSS and animate only `transform` and `opacity`.
- Keep entry motion brief and avoid continuous decoration around form fields.
- Disable entry and hover movement under `prefers-reduced-motion: reduce`.
- Do not add an animation runtime for simple effects.

## 8. Accessibility

- Preserve semantic headings and keyboard order.
- Tabs use the full `tablist`, `tab`, and `tabpanel` relationship.
- Focus states remain visible without relying on color alone.
- Mark decorative images and graphics with `aria-hidden`; content images need useful alt text.
- Before delivery, check overflow, overlap, and wrapping at 390px and wide desktop sizes.
