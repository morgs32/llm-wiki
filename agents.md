# Agent guidelines

## Component file naming

- **Name the file after the component name exactly.** Use PascalCase for component files (e.g. `AppSidebar.tsx` for a component named `AppSidebar`).
- **Exception: shadcn components** may use dash-case (e.g. `app-sidebar.tsx` in `components/ui/`). This keeps shadcn’s default naming and avoids unnecessary renames when adding or syncing components.

## Sidebar nav links (Button + asChild + Link)

Use **Button with `asChild`** and a **Link** as the single child for sidebar nav items. This keeps real links (good for accessibility and navigation) while applying button styling. The icon goes left of the text via flex + gap.

```tsx
<Button asChild variant="ghost" className="w-full justify-start gap-2">
  <Link href={item.url}>
    {item.icon && <item.icon className="size-4 shrink-0" />}
    <span>{item.title}</span>
  </Link>
</Button>
```

- `variant="ghost"` fits sidebar style; `w-full justify-start gap-2` gives full-width, left-aligned, icon-left-of-text layout.
- Do not use a raw `<a>` or an unstyled Link; use this pattern so nav items look like buttons and still navigate correctly.
