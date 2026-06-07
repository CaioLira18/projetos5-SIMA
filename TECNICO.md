# SIMA — Contexto Técnico (Código & Estrutura)

> Para o contexto do produto (problema, persona, pesquisa, decisões de escopo), ver [`PROJETO.md`](PROJETO.md).
>
> **Estado atual:** projeto rodando ponta-a-ponta via `docker compose up`. Fluxo Cidadão (login → mapa → reportar) e Defesa Civil (login → painel com KPIs / mapa / bairros críticos / tabela / gráficos) implementados. Pendentes: filtros (US08), gatilho automático (US07), WhatsApp (US02/US05), sensores IoT (US09), notebooks da trilha de dados.

---

## 1. Stack Atual

| Camada | Tecnologia | Versão / nota |
| --- | --- | --- |
| **Frontend** | React 19 + Vite 8 | SPA, `src/` organizado em `pages/ components/ contexts/ lib/`. |
| **Estilização** | **Tailwind CSS v4** | Via plugin oficial `@tailwindcss/vite`. Sem `tailwind.config.js` — `@import "tailwindcss";` em [`src/index.css`](frontend/src/index.css). |
| **Roteamento** | React Router v7 | `BrowserRouter`, rotas aninhadas pro painel (`/dashboard`, `/dashboard/graficos`). |
| **HTTP** | Axios | Instância em [`src/lib/api.js`](frontend/src/lib/api.js) com interceptor que injeta `Bearer` e renova access via refresh quando dá 401. |
| **Mapa** | Leaflet + react-leaflet | Tiles CartoDB Voyager, contorno de bairros via GeoJSON, áreas de risco pintadas (círculos geográficos coloridos por nível de severidade — Atenção/Alerta/Crítico). |
| **Gráficos** | Recharts 2.x | `BarChart`, `PieChart`, `ResponsiveContainer` na aba "Gráficos" do painel. |
| **Backend** | **Python 3.12 + Django 6 + DRF** | Apps modulares em `backend/apps/`. |
| **Auth** | `djangorestframework-simplejwt[crypto]` | Email como `USERNAME_FIELD`. Access 60min + refresh 7d com rotação + blacklist. |
| **Imagens** | Pillow + `MEDIA_URL` / `MEDIA_ROOT` | `Relato.imagem` (ImageField). Servido pelo Django em DEBUG. |
| **Banco** | PostgreSQL 16 | Decisão consciente de NÃO usar NoSQL no MVP — volume controlado, relacional cobre. |
| **Análise de dados** | pandas + matplotlib + scikit-learn | Configurados em [`ml/requirements-ml.txt`](ml/requirements-ml.txt). Notebooks ainda não escritos. |
| **Dashboard analítico** | Streamlit | Pasta [`ml/streamlit_app/`](ml/streamlit_app/) existe mas vazia. Trilha de dados ainda não começou. |
| **Comunicação tempo real** | Polling HTTP (30s) | **NÃO** usar WebSockets no MVP — questionário mostrou conectividade instável durante chuvas. |
| **Canal de alerta** | WhatsApp Cloud API (Meta) | Vars de ambiente já reservadas no `.env.example`; cliente Python ainda não codado (US02/US05). |
| **APIs meteorológicas** | OpenWeather + Tomorrow.io + (APAC) | Chaves reservadas no `.env.example`; integração ainda não codada. |
| **Orquestração local** | **Docker Compose** | 3 serviços (postgres + backend + frontend) com healthcheck e hot-reload nos dois lados. |
| **Deploy** | *A definir* | Decisão adiada — alinhar mais pra frente conforme o produto for tomando forma. |

**Sobre Streamlit vs React:** os dois vão conviver. **React** é o produto pra cidadão e Defesa Civil (mapa, reportar, painel). **Streamlit** é o dashboard analítico exigido pela trilha de Análise e Visualização de Dados — fica mais próximo dos notebooks. Não há motivo pra reimplementar a análise no React.

---

## 2. Arquitetura (Estado Atual)

```text
                  Browser (localhost:5173 / :8000)
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
     ┌──────────────────┐             ┌──────────────────┐
     │ Frontend React   │  REST/JSON  │ Django + DRF     │
     │ Vite dev server  │ ──────────▶ │ runserver        │
     │ Tailwind + Leaf. │  Bearer JWT │ JWT (simplejwt)  │
     │ Router + Recharts│             │ /api/...         │
     └──────────────────┘             └────────┬─────────┘
                                               │ ORM
                                               ▼
                                      ┌──────────────────┐
                                      │  PostgreSQL 16   │
                                      │  (volume Docker) │
                                      └──────────────────┘

  Tudo orquestrado via docker-compose.yml (postgres → backend → frontend).
  Migrações rodam automaticamente no boot do backend.
```

**Fluxo atual ponta-a-ponta:**

1. **Cidadão** abre `/`, autentica (`POST /api/users/login/`), cai no mapa de Recife (Leaflet) com relatos das últimas 6h carregados via `GET /api/relatos/?ultimas_horas=6`. Polling de 30s.
2. **Cidadão** clica em "Reportar", envia `POST /api/relatos/` com `lat`, `lng`, `bairro_id`, `nivel`, `descricao` e (opcional) `imagem` multipart.
3. **Defesa Civil** autentica (ou usa sessão prévia) e é redirecionada pra `/dashboard`, que faz dois fetches em paralelo: `GET /api/dashboard/resumo/` (agregações) e `GET /api/relatos/?ultimas_horas=24` (mapa + tabela). Polling de 30s.
4. **Defesa Civil** alterna entre as abas "Visão geral" e "Gráficos" — esta segunda calcula séries horárias / distribuição / top bairros no client a partir da mesma lista de relatos.

**O que ainda não existe no fluxo (próximas USs):**

- Gatilho automático que cria entidade `Alerta` quando threshold é cruzado (US07).
- Cliente WhatsApp Cloud API enviando alertas pros moradores cadastrados naquele raio (US02/US05).
- Job periódico (Django command + cron) consultando APIs meteorológicas.
- Modelo `sklearn` treinado pra prever tendência de risco.

---

## 3. Estrutura Atual de Pastas

```text
projetos5-SIMA/
├── docker-compose.yml              # postgres + backend + frontend
├── .env.example                    # vars de ambiente (copiar pra .env)
│
├── frontend/                       # React 19 + Vite 8 + Tailwind v4
│   ├── Dockerfile                  # node:22-alpine, vite dev na 5173
│   ├── package.json
│   ├── vite.config.js              # plugins: react + tailwindcss
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # BrowserRouter + AuthProvider + rotas
│       ├── index.css               # @import "tailwindcss";
│       ├── pages/
│       │   ├── Login.jsx           # tabs Cidadão / Defesa Civil
│       │   ├── Register.jsx        # cadastro público (cria role=cidadao)
│       │   ├── Mapa.jsx            # US01 — mapa do cidadão
│       │   ├── Reportar.jsx        # US04 — form de relato (com foto)
│       │   ├── Alertas.jsx         # placeholder (US02)
│       │   ├── Dashboard.jsx       # US06 — visão geral
│       │   └── DashboardGraficos.jsx  # US06 — aba gráficos
│       ├── components/
│       │   ├── ProtectedRoute.jsx  # ProtectedRoute + PublicOnly + RoleProtectedRoute
│       │   ├── MenuPerfil.jsx      # dropdown de perfil + sair
│       │   ├── MapaRecife.jsx      # Leaflet + áreas pintadas + marcadores
│       │   ├── AreaRisco.jsx       # círculo geográfico colorido por nível
│       │   ├── MarcadorRelato.jsx
│       │   ├── LegendaNiveis.jsx
│       │   ├── NivelSelector.jsx
│       │   ├── BairroSelect.jsx
│       │   ├── BuscaCEP.jsx
│       │   └── dashboard/
│       │       ├── DashboardLayout.jsx  # header + tabs + Outlet
│       │       ├── KpiCard.jsx
│       │       ├── BairrosCriticos.jsx
│       │       └── TabelaRelatos.jsx    # com coluna Foto + lightbox
│       ├── contexts/
│       │   └── AuthContext.jsx     # user + login/register/logout
│       └── lib/
│           ├── api.js              # axios instance + interceptors JWT
│           ├── relatos.js          # service de relatos
│           ├── dashboard.js        # service do painel
│           ├── seriesHorarias.js   # agregações pros gráficos
│           ├── bairros.js
│           ├── bairrosGeo.js       # GeoJSON dos bairros
│           ├── geocoder.js
│           └── demoMode.jsx        # *temporário* — modo demo
│
├── backend/                        # Django 6 + DRF
│   ├── Dockerfile                  # python:3.12-slim, migrate + runserver
│   ├── manage.py
│   ├── requirements.txt
│   ├── sima/                       # projeto Django
│   │   ├── settings.py             # AUTH_USER_MODEL, SIMPLE_JWT, DRF, CORS
│   │   ├── urls.py                 # /api/users/ /api/relatos/ /api/dashboard/ etc.
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/                  # ✅ US10 — login JWT, role, permissions
│   │   ├── relatos/                # ✅ US04 — CRUD com imagem
│   │   ├── areas_risco/            # ✅ Bairro + seed migration
│   │   ├── dashboard/              # ✅ US06 — endpoint agregado
│   │   ├── alertas/                # ⏳ vazio — reservado pra US07
│   │   └── clima/                  # ⏳ vazio — reservado pra integração meteo
│   ├── services/
│   │   ├── whatsapp_cloud.py       # ⏳ stub
│   │   ├── ml_predict.py           # ⏳ stub
│   │   └── trigger_alerta.py       # ⏳ stub
│   └── tests/
│
└── ml/                             # ⏳ trilha de Análise/Visualização de Dados
    ├── requirements-ml.txt         # pandas, sklearn, matplotlib, jupyter, streamlit
    ├── notebooks/                  # vazio — EDA / regressão / classificador
    ├── data/                       # vazio (gitignored)
    ├── models/                     # vazio (gitignored)
    └── streamlit_app/              # vazio
```

**Convenção `apps.*`:** todos os apps Django ficam dentro de `backend/apps/` e são referenciados como `apps.users`, `apps.relatos`, etc. nos `INSTALLED_APPS`.

---

## 4. Modelo de Dados (Estado Atual)

Apenas três tabelas modeladas até agora: `users`, `bairros`, `relatos`. As demais ficam pra próximas USs.

```sql
-- ✅ users (apps.users.User — AbstractBaseUser + PermissionsMixin)
users (
  id PK,
  nome,
  email UNIQUE,            -- USERNAME_FIELD
  password,                -- hash do Django
  telefone,                -- pra WhatsApp (US02/US05)
  bairro_id FK → bairros,  -- bairro principal de monitoramento
  lat, lng,                -- coordenadas opcionais
  role,                    -- 'cidadao' | 'defesa_civil' | 'admin'
  is_active, is_staff, is_superuser,
  date_joined
)

-- ✅ bairros (apps.areas_risco.Bairro — populado via data migration)
bairros (
  id PK,
  nome UNIQUE,
  slug UNIQUE,
  rpa                      -- Região Político-Administrativa (1–6), opcional
)

-- ✅ relatos (apps.relatos.Relato — US04)
relatos (
  id PK,
  user_id FK → users (PROTECT),
  lat, lng,                -- DecimalField(9,6)
  bairro_id FK → bairros (SET_NULL),
  nivel,                   -- 'baixo' | 'medio' | 'alto'
  descricao TEXT(500),
  imagem,                  -- ImageField, upload_to='relatos/'
  created_at
)
-- índices: bairro_id, -created_at

-- ⏳ sensores (US09 — apps.sensores ainda não criado)
-- ⏳ alertas (US07 — apps.alertas existe vazio)
-- ⏳ areas_risco (polígonos + threshold — fora do MVP atual)
-- ⏳ clima_historico (cache de APIs meteorológicas — US07)
```

`User.bairro` virou FK pra `Bairro` (não é mais string livre como no schema original), o que casa com `Relato.bairro` e permite agregação consistente no painel.

---

## 5. Endpoints da API (Estado Atual)

Todas as rotas vivem sob `/api/`:

| Método | Rota | Auth | O que faz |
| --- | --- | --- | --- |
| POST | `/api/users/register/` | público | Cadastro (sempre cria `role=cidadao`). Devolve `access` + `refresh` + `user`. |
| POST | `/api/users/login/` | público | Login JWT por email+senha. Devolve `access` + `refresh` + `user`. |
| POST | `/api/users/refresh/` | refresh | Renova access (rotação + blacklist do refresh anterior). |
| POST | `/api/users/logout/` | bearer | Blacklist do refresh token. |
| GET / PATCH | `/api/users/me/` | bearer | Perfil do usuário. `role` é read-only — promoção via Django admin. |
| GET / POST | `/api/relatos/` | listagem livre p/ logados; POST exige bearer | Lista (com paginação) e cria relatos. Aceita `?ultimas_horas=N`, `?bairro=<slug>`. |
| GET / PATCH / DELETE | `/api/relatos/<id>/` | bearer + dono | Detalhe / editar / apagar relato. |
| GET | `/api/bairros/` | livre | Lista de bairros (pro `BairroSelect`). |
| GET | `/api/dashboard/resumo/` | bearer + role ∈ `{defesa_civil, admin}` | KPIs (hoje/7d/30d), `por_nivel`, top `por_bairro`, `ultimo_relato_em`. |
| (admin) | `/admin/` | Django admin | Promover usuários, ver dados crus. |

**Permission custom:** `apps.users.permissions.IsDefesaCivilOrAdmin` (libera operador, admin role e superuser).

---

## 6. Convenções de Código

- **Idioma:** comentários, nomes de variáveis e mensagens de UI em **português**. Identificadores de framework (Django, React) seguem o padrão da lib.
- **Commits:** conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Branches:** `main` protegida; trabalho em `feat/<nome>` ou `fix/<nome>`. PRs aceitos via merge commit (ver histórico).
- **Variáveis sensíveis:** em `.env` na raiz (carregado por `django-environ` no backend e por `VITE_*` no frontend). Nunca commitar.
- **Testes Django:** rodar com `docker compose exec backend python manage.py test`. Hoje ~50 testes (users, relatos, dashboard, areas_risco).
- **Markdown:** lint pede `*` pra emphasis (não `_`).
- **Linters/formatters:** *ainda não configurados*. Black/ruff (Python) e ESLint/Prettier (frontend) ficam pra introduzir quando a base crescer.

---

## 7. Plano da Trilha de Análise de Dados (Pendente)

A trilha do 5º CC exige entregáveis específicos que devem viver em `ml/`. **Nada disso foi começado ainda** — pasta criada com `requirements-ml.txt` mas notebooks/streamlit vazios.

1. **Plano de análise** — perguntas investigativas documentadas (markdown).
2. **EDA notebook** — distribuição de relatos por bairro, correlação chuva×nível, séries temporais.
3. **Modelo de regressão** — treino, métricas (MAE, RMSE, R²), serialização (`joblib`).
4. **Modelo classificador** — risco binário (alagará / não alagará nas próximas N horas), métricas de classificação (matriz de confusão, curva ROC).
5. **Streamlit dashboard** — filtros, gráficos, modelo treinado direto.
6. **Documentação das decisões analíticas** — ADRs simples ou seção no README.

---

## 8. Status (atualizado conforme USs entram)

### 8.1. ✅ Entregue

- [x] Docker Compose com postgres + backend (Django auto-migrate) + frontend (Vite dev), hot-reload nos dois lados
- [x] `.env.example` na raiz com vars de DB / Vite / OpenWeather / Tomorrow / WhatsApp / Django
- [x] **US10** — User customizado (email), JWT (access + refresh + rotação + blacklist), endpoints register/login/refresh/logout/me, admin customizado, tabs Cidadão/Defesa Civil no front, `RoleProtectedRoute`, seed automático de conta `defesa@sima.local/defesa123` via data migration (credenciais exibidas na própria tela de login)
- [x] **Bairros** — model + seed migration com bairros oficiais de Recife (`apps.areas_risco`)
- [x] **US04** — model `Relato` com FK pra Bairro, `nivel`, `descricao`, `imagem` (ImageField + Pillow); ViewSet DRF com CRUD; form React + Leaflet pra escolher ponto; suporte a edição/exclusão (PR #1)
- [x] **US01** — mapa do cidadão com Leaflet + contornos GeoJSON de bairros + áreas de risco pintadas (círculos geográficos coloridos) + marcadores clicáveis; polling 30s
- [x] **US03** — vocabulário Atenção/Alerta/Crítico em toda UI (rótulos centralizados em `lib/relatos.js`); áreas pintadas no mapa em verde/âmbar/vermelho com raio crescente por severidade (60/90/130m); marcadores e badges combinando; legenda fixa explica os 3 níveis com descrição
- [x] **US06** — endpoint `/api/dashboard/resumo/`, permission `IsDefesaCivilOrAdmin`, painel React com 4 KPIs, mapa, "Bairros críticos", tabela com coluna Foto + lightbox, aba "Gráficos" com Recharts (barras empilhadas, pizza, top bairros), polling 30s, redirect automático de operador pra `/dashboard`

### 8.2. 🔜 Próxima fila

- [ ] **US08** — `?bairro=<slug>&nivel=<n>` no `RelatoViewSet` + dropdowns de filtro no painel (provavelmente <1 dia)
- [ ] **US07** — model `Alerta`, lógica de threshold por bairro, job periódico (Django management command) que cria alertas quando o conjunto de relatos cruza o limite
- [ ] **US02/US05** — cliente `whatsapp_cloud.py` real, envio de alertas pra moradores no raio, possivelmente login via WhatsApp OTP
- [ ] **US09** — app `sensores` + CRUD admin + marcadores diferenciados no mapa

### 8.3. ⏳ Trilha de dados (depois das USs)

- [ ] Notebook `01_eda.ipynb` rodando contra o Postgres
- [ ] Modelo de regressão treinado + serializado (joblib)
- [ ] Modelo classificador (risco binário) + métricas
- [ ] Streamlit dashboard apontando pro mesmo banco
- [ ] Integração OpenWeather coletando precipitação

### 8.4. Outras pendências técnicas

- [ ] Ordenação alfabética da seed de bairros desalinhada com o teste `test_ordenacao_alfabetica` em `apps.areas_risco.tests` (1 falha pré-existente)
- [ ] Setup de linters (black/ruff + ESLint/Prettier)
- [ ] Definir alvo de deploy (cloud provider, CI/CD)
- [ ] Limpar marcadores `DEMO-MODE` (ver [`lib/demoMode.jsx`](frontend/src/lib/demoMode.jsx)) antes de qualquer demo "séria"

---

## 9. Como Rodar Localmente

Pré-requisito: Docker Desktop ligado.

```powershell
# 1ª vez: copiar o exemplo de env
Copy-Item .env.example .env

# Subir tudo (build na 1ª vez, depois reusa imagens)
docker compose up -d

# Uma conta de Defesa Civil é criada automaticamente pelo seed:
#   email: defesa@sima.local
#   senha: defesa123
# As credenciais aparecem na própria tela de login (aba Defesa Civil).
# Pra acessar o /admin/, ainda dá pra criar um superuser:
docker compose exec backend python manage.py createsuperuser

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Rodar testes
docker compose exec backend python manage.py test

# Depois de mexer em package.json (frontend), volume anônimo precisa reset:
docker compose up -d --build --renew-anon-volumes frontend

# Depois de mexer em requirements.txt (backend):
docker compose up -d --build backend
```

URLs:

- Frontend: <http://localhost:5173>
- API: <http://localhost:8000/api/>
- Admin: <http://localhost:8000/admin/>
- Postgres: `localhost:5432` (user/pass/db `sima` por padrão)
