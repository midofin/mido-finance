# Mido Finance

This repository contains two separate Next.js applications that together form the Mido Finance platform:

- **`mido-landing`**: This is the landing page for the Mido platform. It contains information, marketing content, and promotional materials to attract new users.
- **`mido-app`**: This is the core application where users interact with the core features and services of the Mido platform.

Both applications are managed within the same repository using `pnpm` workspaces.

## Project Structure
## Prerequisites

To work with this repository, ensure you have the following installed:

- **Node.js**: Version 20 or later.
- **pnpm**: Version 9 or later.
  - Install `pnpm` globally if you don't have it:
    ```
    npm install -g pnpm
    ```

## Installation

### 1. Clone the repository
``` bash
git clone https://github.com/midofin/mido-finance.git
cd mido-finance
```

### Install dependencies
```bash
pnpm install
```
### 3. Development
You can run each app independently using the pnpm workspace commands.

Running the Landing Page (mido-landing)
To start the development server for the landing page:

```bash
pnpm dev:landing
```

### Running the Core App (mido-app)
To start the development server for the core app:

```bash
pnpm dev:app
```
By default, the app will be available at http://localhost:3000 or another available port.

### Building the Projects
To build each project for production, use the following commands:

Building the Landing Page (mido-landing)
```bash
pnpm build:landing
```
Building the Core App (mido-app)
```bash
pnpm build:app
```
The production-ready build for each app will be created in their respective .next directories.

### Contribution Guidelines
Ensure that each app (mido-landing and mido-app) runs and builds successfully before committing changes.
Use TypeScript for type safety in both projects.
Follow the coding standards outlined in the individual project README files.
