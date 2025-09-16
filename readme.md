# prisma-dynamic-query

A lightweight, reusable **dynamic query builder** for Prisma that supports pagination, search, filters, relation filters, and includes.  
Drop it into your Node.js / TypeScript project to avoid rewriting the same query boilerplate.

---

## 🚀 Installation

```bash
npm i prisma-query-shatab
```

or with yarn:

```bash
yarn add prisma-query-shatab
```

---

## 📦 Quick usage

### Import
```ts
import { dynamicQueryBuilder } from "prisma-query-shatab";
```

### Example (basic)
```ts
import { PrismaClient } from "@prisma/client";
import { dynamicQueryBuilder } from "prisma-query-shatab";

const prisma = new PrismaClient();

async function getUsers(query: any) {
  return dynamicQueryBuilder({
    model: prisma.user,
    query,
    searchableFields: ["name", "email"],
    forcedFilters: { isActive: true },
    includes: { profile: true },
    relationFilters: [
      { profile: { country: { equals: "USA" } } },
    ],
  });
}
```

### Example (Express route)
```ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { dynamicQueryBuilder } from "prisma-query-shatab";

const app = express();
const prisma = new PrismaClient();

app.get("/users", async (req, res) => {
  try {
    const result = await dynamicQueryBuilder({
      model: prisma.user,
      query: req.query,
      searchableFields: ["name", "email", "profile.city", "profile.gender"],
      forcedFilters: { isActive: true },
      includes: { profile: true },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal error", detail: err.message });
  }
});
```

---

## 🔍 Query Parameters

Pass these query parameters from client to control results:

| Param       | Type     | Default     | Description                                                                 |
|-------------|----------|-------------|-----------------------------------------------------------------------------|
| `page`      | number   | `1`         | Current page number                                                         |
| `limit`     | number   | —           | Number of items per page                                                    |
| `search`    | string   | —           | Search keyword to match against `searchableFields`                          |
| `sortBy`    | string   | `createdAt` | Field to sort by                                                            |
| `order`     | string   | `desc`      | Sort order (`asc` or `desc`)                                                |
| ...filters  | any      | —           | Any other Prisma-supported filter (e.g. `role=ADMIN`, `status=ACTIVE`)      |

Examples:
- `GET /users?page=2&limit=10`
- `GET /users?search=john&role=ADMIN&order=asc`

---

## 📑 Options (function params)

| Option             | Type                  | Description                                                                 |
|--------------------|-----------------------|-----------------------------------------------------------------------------|
| `model`            | any (Prisma model)    | Prisma model instance (e.g. `prisma.user`)                                  |
| `query`            | any                   | Request query object (e.g. `req.query`)                                     |
| `searchableFields` | string[]              | Fields to include in `search` matching                                        |
| `forcedFilters`    | Record<string, any>   | Filters always applied (e.g. `{ isActive: true }`)                           |
| `includes`         | Record<string, any>   | Prisma `include` object for eager-loading relations                          |
| `relationFilters`  | any[]                 | Additional relation-based filters combined via `AND`                         |

---

## 📊 Response format

The function returns an object with pagination meta and the `data` array:

```json
{
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "perPage": 10
  },
  "data": [ /* array of model records */ ]
}
```

---

## 🛠 Development & Local testing

- Build:
```bash
npm run build
```

- Test locally from another project:
```bash
# from package root
npm pack        # creates tarball
# or from test project
npm install ../path/to/prisma-dynamic-query
# OR use npm link
cd prisma-dynamic-query
npm link
cd ../your-test-project
npm link prisma-dynamic-query
```

---

## 🧩 Recommended project config (TypeScript + dual ESM/CJS output)

**package.json** (important bits)
```json
{
  "name": "prisma-query-shatab",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "@prisma/client": ">=3"
  },
  "devDependencies": {
    "tsup": "^6",
    "typescript": "^5"
  }
}
```

**tsconfig.json** (suggested)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"]
}
```

- The `tsup` command will emit both `cjs` and `esm` bundles plus `.d.ts` types.
- `peerDependencies` ensures the host project provides `@prisma/client`.

---

## 📌 Tips & caveats

- The library expects a `Prisma` model-like object with `findMany` and `count` methods (i.e., `prisma.model`).
- If you need advanced filtering conversions (strings → numbers / dates), handle conversions in `forcedFilters` or pre-process `query` before passing in.
- Keep `searchableFields` limited to fields suitable for `contains` queries to avoid performance issues.
- For large datasets, prefer `cursor`-based pagination — this utility uses offset-based `skip` / `take`.

---

## 🧾 Changelog & Versioning

- Keep semantic versioning (semver). Update `CHANGELOG.md` with notable changes per release.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please open an issue or a PR on the repo.

---

## 📄 License

MIT © 2025 [MD Shahriar Shatab](https://github.com/Shatab99)
