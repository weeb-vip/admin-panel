# admin-panel

The internal admin panel for weeb.vip — the screens for managing anime content,
rather than the public site.

React 18 and TypeScript on Vite, talking to the same GraphQL API the front end
uses, with types generated from the schema.

## Running it

Requires the Node version in `.nvmrc` and Yarn 4 (Berry — the repo carries its
own `.yarnrc.yml`, so no global install is needed beyond corepack).

```sh
yarn install
yarn dev        # dev server on :8081
yarn build      # type-check and build
yarn preview    # serve the build locally
```

## GraphQL

Queries live in `operation.graphql` and the schema in `schema.graphql`;
`codegen.ts` turns them into typed documents:

```sh
yarn graphql-codegen
```

Generated output is committed, so regenerate and commit it alongside any schema
change.

## How it is put together

- **Styling** — Tailwind, with SCSS where a component needs more than utilities.
- **State** — Zustand for global state, TanStack Query for anything from the
  server.
- **Routing** — React Router v6.
- **Feature flags** — Flagsmith.
- **Components** — one directory each under `src/components`, with an
  `index.ts` re-export, so imports do not reach into a component's internals.

## Deployment

Built to static files and served by nginx — see `Dockerfile` and `nginx.conf`.
`src/_redirects` keeps client-side routing working on hosts that read it.
