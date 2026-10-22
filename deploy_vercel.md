# Guia de desenvolvimento + Git + Deploy no Vercel

> **Como usar este arquivo:** peça à IA: *"Leia `deploy_vercel.md` e siga esse passo a passo para este projeto."*
>
> Regras para a IA seguir:
> 1. Execute as etapas **na ordem** e **confirme cada resultado** antes de avançar.
> 2. Antes de qualquer ação que altere estado (commit, push, criação de projeto, deploy), **peça autorização ao usuário** listando exatamente o que será feito.
> 3. Se algum comando falhar, **não siga em frente**: diagnostique (ver seção 9) e corrija até o objetivo estar cumprido.
> 4. Nunca exiba, copie ou comita tokens, chaves ou `.env`.

---

## 1. Pré-requisitos

Conta e ferramentas:

| Item | Onde | Observação |
|---|---|---|
| Conta GitHub | github.com | dono do repositório |
| Conta Vercel | vercel.com | Hobby basta; mesma identidade do GitHub facilita |
| Node.js LTS | nodejs.org | `node -v` (neste guia: v24) |
| Git | git-scm.com | `git --version` |
| VS Code | code.visualstudio.com | terminal integrada `Ctrl+`` |

Extensões VS Code úteis: **ESLint**, **Prettier - Code formatter**, **GitLens**, **REST Client** (opcional).

---

## 2. Desenvolvimento no VS Code

1. Abra a pasta do projeto: `File → Open Folder`.
2. Terminal integrada (`Ctrl+``), verifique as versões:

```bash
node -v
npm -v
git --version
```

3. Instale dependências e confirme que tudo roda **antes** de qualquer commit:

```bash
npm install
npm run dev      # servidor local (ex.: http://localhost:8080)
npm run lint     # sem erros
npm test         # sem falhas
npm run build    # deve terminar com "built in Xs"
```

4. **Convenção**: o `package.json` deve ter os scripts `dev`, `build`, `lint`, `test`. A Vercel usará `build` automaticamente — se não existir, a detecção de framework falha.

5. Nunca suba segredos no código: use `.env.local` (gitignorado) localmente e as **Environment Variables do painel da Vercel** em produção.

---

## 3. Versionamento com Git

### 3.1 Primeira configuração (uma vez por máquina)

```bash
git config --global user.name  "Seu Nome"
git config --global user.email "seu@email.com"   # use o mesmo e-mail do GitHub
```

> **Pegadinha:** sem isso o Git grava autor automático tipo
> `Admin <Admin@minha-maquina>` — incorreto para GitHub/auditoria.
> Para corrigir um commit recente: `git commit --amend --reset-author`.

### 3.2 `.gitignore` mínimo (adicione o que faltar do seu stack)

```gitignore
node_modules
dist
dist-ssr
.output
.nitro
.vinxi
*.local

# Vercel (gerado pela CLI)
.vercel
.env*
```

> **Nunca versione:** `.vercel/` (contém `.env.local` com token OIDC), `.env*`, `node_modules`, `dist`.

### 3.3 Primeiro commit e push

```bash
git init
git add .
git status                    # confira NADA sensível sendo incluído
git commit -m "mensagem curta e descritiva"
git branch -M main
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

Convenção de mensagens usada neste projeto (funciona bem): curta, em português, no imperativo:
`adiciona tabela de votos por cidade`, `chore: ignora .vercel e .env locais`.

**Antes de cada push:** `npm run lint && npm test && npm run build`.

---

## 4. Como a Vercel constrói o projeto

- **Detecção automática:** a Vercel lê `package.json`, `vite.config.*`, `next.config.*` etc. e preenche *Build Command* e *Output Directory* sozinha (frameworks suportados: Next, Vite, TanStack Start, Nitro, Nuxt, Astro...).
- **Saídas comuns:**
  - SPA/Vite estático → `dist/`
  - Next.js → `.next/`
  - Nitro/TanStack Start (preset `vercel`) → **Build Output API**: `.vercel/output/` (`static/` + `functions/`). Se existir `.vercel/output/config.json`, a Vercel o usa automaticamente.
- **`vercel.json` só é necessário** em casos especiais:

```jsonc
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "tanstack-start",     // quando a detecção falhar
  "buildCommand": "npm run build",   // quando o padrão estiver errado
  "outputDirectory": "dist",         // quando a saída não for a padrão
  "installCommand": "npm ci",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **Variáveis de ambiente:** cadastre em `Project → Settings → Environment Variables` (Production/Preview/Development). Prefixo `NITRO_` = exposto ao servidor via `useRuntimeConfig()`.

---

## 5. Deploy — Opção A: Integração Git (recomendada)

Cada `git push` em `main` gera um deploy automático de produção.

### 5.1 Login

```bash
npx --yes vercel@latest login
```

Abre um link de autenticação no navegador (GitHub, GitLab ou e-mail). Confirme:

```bash
npx --yes vercel@latest whoami      # deve mostrar seu usuário
```

### 5.2 Criar projeto e linkar a pasta

```bash
# nome do projeto: minúsculas, SEM espaço, travessão ou maiúsculas
npx vercel project create meu-projeto

# linka a pasta local ao projeto (cria .vercel/project.json, gitignorado)
npx vercel link --yes --project meu-projeto --scope <seu-escopo>
```

> O `--scope` é o time/conta (aparece em `npx vercel project ls`, ex.: `Fetching projects in <escopo>`).

### 5.3 Conectar o repositório GitHub

```bash
npx vercel git connect https://github.com/<usuario>/<repo>.git \
  --project meu-projeto --scope <escopo> --yes
# esperado: > Connected
```

**Se falhar com `Failed to connect ... Make sure there aren't any typos...`:**

| # | Causa provável | Correção |
|---|---|---|
| 1 | O **App GitHub da Vercel** não foi autorizado (fazer *login com GitHub* **não** instala o App — são coisas separadas) | Painel: `https://vercel.com/<escopo>/<projeto>/settings/git` → **Connect** → GitHub → **Authorize Vercel** → selecione o repositório → Connect. Depois rode o `vercel git connect` de novo. |
| 2 | CLI rodando em modo **agente/CI/sem TTY** (`nonInteractive=true`) → não abre o navegador e devolve `400` | Use o painel (item 1) **ou** rode o comando num PowerShell/terminal **interativo** normal. |
| 3 | Conta GitHub conectada ≠ dono do repositório | Confirme o usuário logado em `github.com` e na Vercel. |
| 4 | Repositório privado sem acesso do App | `github.com/settings/installations` → Vercel → dar acesso ao repo. |

Confirme o vínculo (API leitura):

```bash
npx vercel project ls
# Project Name | Latest Production URL | Updated
```

### 5.4 Validar o pipeline (teste de fogo)

1. Faça um commit real (mesmo pequeno) e `git push origin main`.
2. Acompanhe:

```bash
npx vercel ls                      # deployments mais recentes
npx vercel inspect <deployment-url> # logs do build
```

3. Critério de sucesso: novo deployment com `state = READY` e `target = production`.

---

## 6. Deploy — Opção B: Manual via CLI (sem integração Git)

```bash
npx vercel deploy --prod            # build roda NA Vercel, sobe para produção
# ou build local + upload pré-construído:
npx vercel build
npx vercel deploy --prebuilt --prod
```

- Sem `--prod` o deploy vira **preview** (URL temporária).
- Para atualizar depois, repita o comando (nada automático).

---

## 7. Checklist de conferência antes de considerar "pronto"

- [ ] `npm run lint` sem erros
- [ ] `npm test` sem falhas
- [ ] `npm run build` conclui
- [ ] `git status` limpo; sem `.env`, `.vercel` ou `node_modules` versionados
- [ ] Git com `user.name`/`user.email` corretos (autor = você)
- [ ] Projeto criado e `vercel link` feito
- [ ] `vercel git connect` → **Connected**
- [ ] Push em `main` gera deployment automático `READY`
- [ ] URL de produção responde **HTTP 200** e mostra o conteúdo esperado:

```bash
# PowerShell
$r = Invoke-WebRequest "https://<projeto>.vercel.app" -UseBasicParsing
$r.StatusCode                      # 200
if ($r.Content -match '<title>([^<]+)</title>') { $Matches[1] }
```

- [ ] Acesso **anônimo** (sem login) funciona — se o HTML vier como página de login da Vercel, desative a proteção em `Settings → Deployment Protection` para produção (os *previews* podem continuar protegidos).
- [ ] `robots.txt`, favicon e meta description presentes (SEO básico).
- [ ] Variáveis de ambiente cadastradas no painel (se o app precisar).

---

## 8. Comandos de referência rápida

```bash
npx vercel --version          # versão da CLI
npx vercel whoami             # quem está logado
npx vercel project ls         # projetos do escopo atual
npx vercel link --yes --project <nome> --scope <escopo>
npx vercel git connect <url-do-repo> --project <nome> --scope <escopo> --yes
npx vercel git disconnect     # desconecta o repositório
npx vercel ls                 # deployments
npx vercel inspect <url>      # detalhes/logs
npx vercel logs <url>         # logs da função
npx vercel env ls             # variáveis cadastradas
npx vercel curl <url>         # requisição respeitando proteção
npx vercel deploy --prod      # deploy manual de produção
npx vercel logout             # sair
```

Diagnóstico avançado (token fica em `%APPDATA%\com.vercel.cli\Data\auth.json` no Windows — **nunca imprima o token**):

```powershell
$t = (Get-Content "$env:APPDATA\com.vercel.cli\Data\auth.json" -Raw | ConvertFrom-Json).token
$h = @{ Authorization = "Bearer $t" }
Invoke-RestMethod "https://api.vercel.com/www/user" -Headers $h | % user | % username
```

---

## 9. Solução de problemas

| Erro / sintoma | Causa | Correção |
|---|---|---|
| `Logged out` | sessão expirada/não autenticada | `npx vercel login` |
| `Failed to connect <repo> to project` (400) | App GitHub não autorizado, CLI sem TTY, ou conta errada | Seção 5.3 (tabela de causas) |
| `Output directory ... not found` | framework/output mal detectados | `vercel.json` com `outputDirectory`/`framework`, ou ajuste em `Settings → Build & Development Settings` |
| Deploy cria página vazia/404 | build publica em pasta diferente da servida | mesma correção acima; se usar Build Output API, confirme `.vercel/output/config.json` |
| Site exige login da Vercel | Deployment Protection em "Protection Everywhere" | `Settings → Deployment Protection` → desative para produção |
| CI/push não gera deploy | webhook/App desconectado | `settings/git` do projeto → reconecte; confirme branch de produção = `main` |
| Commit com autor errado | `user.name`/`user.email` ausentes | config + `git commit --amend --reset-author` (só se não enviado; se enviado, não reescreva) |
| `npm run lint` falha antes do commit | formatação/erros | `npx prettier --write .` e corrija o ESLint; nunca use `--no-verify` |
| Erro de permissão no repo privado | App sem acesso ao repositório | GitHub → Settings → Installations → Vercel → conceder acesso |

---

## 10. Sequência real usada neste projeto (estudo de caso)

```bash
# 1. código pronto: lint + test + build locais
npm run lint && npm test && npm run build

# 2. autor git correto (falta de config gerava "Admin@maquina")
git config --global user.name  "Uyran Costa"
git config --global user.email "uyrancosta@gmail.com"
git commit --amend --reset-author --no-edit

# 3. push inicial
git push origin main

# 4. login e projeto
npx vercel login
npx vercel project create dash-verceljp
npx vercel link --yes --project dash-verceljp --scope uyran
# → Detected Nitro (Build Command: nitro build, Output Directory: dist)

# 5. conexão Git falhou (App não autorizado) → painel:
#    vercel.com/uyran/dash-verceljp/settings/git → Connect → autorizar GitHub → escolher repo
npx vercel git connect https://github.com/uyran/Dash_VercelJP.git --project dash-verceljp --scope uyran --yes
# → Connected

# 6. primeiro deploy (opcional, já deixa online)
npx vercel deploy --prod
# → Production URL: https://dash-verceljp.vercel.app

# 7. prova do pipeline: commit + push reais
git add .gitignore && git commit -m "chore: ignora .vercel e arquivos .env locais gerados pela CLI"
git push origin main
# → novo deployment automático com state=READY, target=production

# 8. conferência final
Invoke-WebRequest "https://dash-verceljp.vercel.app" -UseBasicParsing   # 200 + <title> correto
```

**Resultado:** site público em produção, atualizado a cada push em `main`.
