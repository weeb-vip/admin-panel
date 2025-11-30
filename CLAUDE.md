# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Transplex frontend admin panel - a React-based web application for managing anime content. The application uses TypeScript, React 18, Vite, and integrates with a GraphQL API.

## Development Commands

```bash
# Install dependencies (using Yarn 4)
yarn install

# Run development server (port 8081)
yarn dev

# Build for production
yarn build

# Type checking
tsc

# Preview production build
yarn preview

# Generate GraphQL types from schema
yarn graphql-codegen
```

## Architecture

### Core Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + SCSS
- **State Management**: Zustand for global state, React Query for server state
- **API Integration**: GraphQL (Apollo Client) + REST (Axios)
- **Routing**: React Router v6
- **Feature Flags**: Flagsmith

### Directory Structure

- `/src/components/` - Reusable UI components (Button, Card, Modal, etc.)
- `/src/views/` - Page components and route definitions
- `/src/services/` - API clients, state management, and utilities
- `/src/services/api/` - API integration (auth, search, GraphQL queries)
- `/src/layouts/` - Layout wrapper components
- `/src/gql/` - Generated GraphQL types and utilities
- `/src/config/` - Configuration management
- `/src/config/static/` - Environment-specific config files (development, staging, production)

### Key Application Flow

1. **Bootstrap Process** (`src/bootstrap.tsx`):
   - Fetches configuration from `/config.json`
   - Initializes Flagsmith feature flags
   - Sets up QueryProvider for React Query
   - Lazy loads the main App component

2. **Authentication** (`src/auth.tsx`, `src/services/api/auth.ts`):
   - Uses cookie-based authentication with `withCredentials: true`
   - Token refresh mechanism via `token_refresher.ts`
   - Global auth state managed with Zustand

3. **API Configuration**:
   - REST API endpoint configured via `config.api_host`
   - GraphQL endpoint configured via `config.graphql_host`
   - Environment configs in `/src/config/static/{environment}/index.json`

4. **Routing Structure**:
   - `/` - Home page
   - `/search` - Search page
   - `/show/:id` - Show details page
   - Protected routes handled via `ProtectedRoute` component

### Environment Configuration

The app uses environment-specific configurations loaded at runtime:
- Development: `src/config/static/development/index.json`
- Staging: `src/config/static/staging/index.json`
- Production: Configured via `APP_CONFIG` environment variable

### GraphQL Code Generation

GraphQL types are auto-generated using `@graphql-codegen/cli`:
- Schema source: `https://gateway.weeb.vip/graphql`
- Generated files: `/src/gql/`
- Documents scanned: All `.ts` and `.tsx` files in `/src/`

### Development Server

Vite dev server runs on port 8081 with proxy configuration for `/config.json` to serve environment-specific configs dynamically.

## TypeScript Configuration

- Target: ESNext
- Strict mode enabled
- JSX: react-jsx
- Module resolution: Node
- No emit (Vite handles compilation)
