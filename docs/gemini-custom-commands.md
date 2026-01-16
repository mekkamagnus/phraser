# Gemini CLI Custom Commands Guide

This document explains how to create and use custom commands (slash commands) in the Gemini CLI.

## Overview
Custom commands allow you to define reusable prompts and workflows. They are configured using `.toml` files where the filename defines the command name.

## 1. File Locations and Scoping

### Project-Specific Commands
Store these in the `.gemini/commands/` directory at the root of your project.
- **Path:** `./.gemini/commands/<command-name>.toml`
- **Use Case:** Project-specific tasks, shared with the team via version control.

### Global (User-Scoped) Commands
Store these in the `.gemini/commands/` directory in your home folder.
- **Path:** `~/.gemini/commands/<command-name>.toml`
- **Use Case:** Generic utilities available across all projects.

## 2. Command Naming and Namespacing

- **Filename to Command:** The filename (without extension) becomes the command name. `fix.toml` becomes `/fix`.
- **Namespacing:** Subdirectories create namespaces using a colon `:` separator.
    - Path: `.gemini/commands/git/commit.toml`
    - Command: `/git:commit`

## 3. TOML Configuration Structure

Each `.toml` file requires a `prompt` and can optionally include a `description`.

```toml
description = "A brief description of what this command does"
prompt = '''
Your detailed instructions for the AI model go here.
You can use placeholders for dynamic content.
'''
```

## 4. Dynamic Placeholders

Commands support the following placeholders to inject context dynamically:

| Placeholder | Description |
| :--- | :--- |
| `{{args}}` | Replaced by the text provided after the command (e.g., `/cmd my args`). |
| `!{command}` | Executes a shell command and injects its `stdout`. Requires user confirmation. |
| `@{path}` | Injects the content of the file or directory at the specified path. |

### Example: `review.toml`
```toml
description = "Review a specific file for potential bugs"
prompt = '''
Act as a senior software engineer. Please review the following code and provide feedback on bugs, style, and performance.

File Content:
@{ {{args}} }
'''
```

## 5. How to Use

Once the `.toml` file is created, you can invoke it directly in the Gemini CLI:

```bash
/command_name [arguments]
```

Example:
```bash
/git:commit "Fix the login bug"
```
