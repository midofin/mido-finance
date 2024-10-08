# Mido Finance

[Live Link](https://midofinance.com/)

- **`mido-landing`**: This is the main application for the Mido platform. It contains the landing page, the core staking app, and the backend.
- **`sol-staking`**: This is a Solana anchor program that allows users to stake and unstake their SOL.

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

ORM: Prisma
Server actions for backend.

### Contribution Guidelines
Ensure that each app (mido-landing and mido-app) runs and builds successfully before committing changes.
Use TypeScript for type safety in both projects.
Follow the coding standards outlined in the individual project README files.
