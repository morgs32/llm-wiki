---
name: nx-plugins
description: Find and add Nx plugins. USE WHEN user wants to discover available plugins, install a new plugin, or add support for a specific framework or technology to the workspace.
---

## Finding and Installing new plugins

- Follow the workspace's agent instructions and package-manager convention.
- List plugins with the workspace's Nx launcher: `nx list`, `pnpm nx list`,
  `yarn nx list`, `npx nx list`, or `bunx nx list`.
- Install with the matching launcher and `nx add <plugin>`. For example:
  `nx add @nx/react` or `pnpm nx add @nx/react`.
