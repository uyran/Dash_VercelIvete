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

- Keep ranking pagination independent in each chart and derive tooltip summaries from the same city aggregates as the dashboard, so navigation and totals remain consistent.
- Prebundle the dashboard's Radix hover-card and slot dependencies at startup to avoid late dependency optimization splitting React instances during preview updates.
