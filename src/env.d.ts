/// <reference types="astro/client" />

// ============================================================================
// Cloudflare Workers Runtime Types
// ============================================================================

type D1Database = import("@cloudflare/workers-types").D1Database;
type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;

/**
 * Cloudflare Workers environment bindings.
 *
 * Add your bindings here as you configure them in wrangler.toml.
 * These types flow through to `locals.runtime.env` in API routes and middleware.
 *
 * @example wrangler.toml
 * ```toml
 * [[d1_databases]]
 * binding = "DB"
 * database_name = "my-app-db"
 * database_id = "xxxx"
 *
 * [[kv_namespaces]]
 * binding = "CACHE"
 * id = "xxxx"
 *
 * [[r2_buckets]]
 * binding = "STORAGE"
 * bucket_name = "my-app-uploads"
 * ```
 */
interface Env {
  // D1 Database (uncomment when using D1)
  // DB: D1Database;

  // KV Namespace (uncomment when using KV)
  // CACHE: KVNamespace;

  // R2 Bucket (uncomment when using R2)
  // STORAGE: R2Bucket;

  // Secrets (available via wrangler secret or dashboard)
  // API_SECRET_KEY: string;

  // Add your bindings here...
  [key: string]: unknown;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
