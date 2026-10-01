<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- App code imports `@/integrations/supabase/app-client` (and `app-auth-attacher` in start.ts), never the generated `client`/`auth-attacher` — the app runs on the user's own Supabase (bnezw...), while the generated files and .env point at the paused Lovable Cloud.
