# Qwen Code CLI Custom Commands Guide

This document explains how to create and use custom commands in the Qwen Code CLI.

## Overview
The Qwen Code CLI allows you to extend its functionality by defining custom commands. These are typically organized in directories and configured using `.toml` files.

## 1. File Locations and Directory Structure

### User-Scoped Commands
Custom commands are stored in the `.qwen/commands/` directory within your home folder.
- **Root Directory:** `~/.qwen/commands/`

### Creating a Command
To create a new command, you need to create a subdirectory for the command group (optional but recommended for organization) and then a `.toml` file for the specific command logic.

**Example Structure:**
```bash
~/.qwen/commands/
└── refactor/           # Command group directory
    └── pure.toml       # Command definition file
```

In this example, the command would likely be invoked as `/refactor:pure` or similar, depending on the specific CLI version's parsing logic.

## 2. Command Definition (.toml)

The `.toml` file defines the behavior of your custom command. While the exact schema may evolve, it typically includes:

- **Prompt/Logic:** The core instruction or prompt template that the command will execute.
- **Description:** A brief explanation of what the command does.

*(Note: Ensure you verify the exact TOML keys supported by your version of the Qwen Code CLI, as they may parallel other CLI tools like Gemini or Claude.)*

## 3. Built-in Command Categories

In addition to custom commands, Qwen Code CLI provides several built-in command types:

- **Slash Commands (`/`)**: For meta-level control.
    - `/summary`, `/compress`, `/restore`, `/init`: Session management.
    - `/clear`, `/theme`, `/directory`, `/editor`: Interface and workspace control.
    - `/language`: Set the language.
- **At Commands (`@`)**: For context injection.
    - Usage: `@filename` to inject the content of a local file into the conversation.
- **Exclamation Commands (`!`)**: For shell execution.
    - Usage: `!git status` to run system commands directly.

## 4. Configuration

The CLI itself is configured via `settings.json` files, not `.toml`.
- **User Settings:** `~/.qwen/settings.json`
- **Project Settings:** `.qwen/settings.json` (overrides user settings)
- **Environment Variables:** Can be set in `.env` files or the system environment (e.g., `OPENAI_API_KEY`).

## 5. How to Use

1.  **Define:** Create your directory and `.toml` file in `~/.qwen/commands/`.
2.  **Invoke:** Use the slash command syntax corresponding to your directory structure (e.g., `/mygroup:mycommand`).
