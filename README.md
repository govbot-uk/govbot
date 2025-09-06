# GovBot MonoRepo

## Prerequisites

Before starting, make sure the following programs are installed:

- **Git**
- **Yarn**
- **Node.js** >= 22.0.0
- **Dotenvx**

## Development Setup

```bash
git clone --branch development --recurse-submodules https://github.com/govbot-uk/govbot.git
cd govbot

git submodule foreach '
  git fetch origin
  git checkout main
  git reset --hard origin/main
'
```

### Dotenvx Install

#### Windows

```bash
winget install dotenvx
```

#### Linux/MacOS

```bash
curl -sfS https://dotenvx.sh | sh
dotenvx help
```