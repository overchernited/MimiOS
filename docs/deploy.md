# Deploy to Supabase Cloud

Publishing the schema and wiring the CI to a cloud Supabase project must run from a network that can reach `api.supabase.co`, `cli.supabase.com` and `platform.supabase.com`. These domains are blocked from the primary dev machine (see AGENTS.md).

## 1. Authenticate the CLI

```bash
supabase login
```

It prints a URL to `https://supabase.com/dashboard/account/tokens`; generate an access token there and paste it back into the CLI.

## 2. Create or link the project

Create a new project (or reuse an existing one):

```bash
supabase projects create MimiOS
```

Then link the working directory to it. The project ref is the id in the dashboard URL (`https://supabase.com/dashboard/project/<ref>`):

```bash
supabase link --project-ref <ref>
```

## 3. Push the schema

Applies `supabase/migrations/` to the linked project:

```bash
supabase db push
```

This creates `apps`, `widgets`, `cartridges`, `firmware`, `profiles`, the RLS policies, the `increment_downloads` RPC and the public `cartridges` storage bucket. The same file is validated locally with `supabase db reset`.

## 4. Configure GitHub Actions secrets

From the Supabase dashboard *Settings → API*:

| Secret | Value |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` (secret) key |

In the GitHub repository: *Settings → Secrets and variables → Actions → New repository secret*, add both names with those values.

## 5. Verify the pipeline

Trigger the workflow from GitHub *Actions → build-firmware → Run workflow* (or push to `main` / a `v*` tag). Each board build uploads its `.bin` to `cartridges/firmware/` in storage and upserts the `firmware` row.

## Notes

- The `service_role` key bypasses RLS — keep it out of the frontend. Only the CI workflow and your tooling use it.
- Local and cloud share the same migration file, so `supabase db reset` (local) and `supabase db push` (cloud) always produce the same schema.
