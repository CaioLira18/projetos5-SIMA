# SIMA — Contexto Técnico (Código & Estrutura)

> Para o contexto do produto (problema, persona, pesquisa, decisões de escopo), ver [`PROJETO.md`](PROJETO.md).
>
> **Estado atual:** projeto rodando ponta-a-ponta via `docker compose up`. **Todas as 10 histórias do usuário do MVP estão implementadas.** Pendente apenas a trilha de análise de dados (notebooks, Streamlit, integração meteo).

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
| **Canal de alerta** | WhatsApp (Twilio ou Meta) | `apps/alertas/whatsapp.py` suporta ambos os provedores. Signal `post_save` do Relato dispara envio em thread separada. Webhook de recebimento implementado. |
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

1. **Cidadão** abre `/`, autentica (`POST /api/users/login/`), cai no mapa de Recife (Leaflet) com relatos das últimas 6h carregados via `GET /api/relatos/?ultimas_horas=6`. Polling de 30s. Sensores ativos aparecem com marcadores diferenciados.
2. **Cidadão** clica em "Reportar", envia `POST /api/relatos/` com `lat`, `lng`, `bairro_id`, `nivel`, `descricao`, `endereco` e (opcional) `imagem` multipart.
3. **Signal `post_save`** do Relato (em thread separada) chama `services.relato_criado()` → geofencing Haversine → envia email + WhatsApp pra usuários no raio. Em seguida, `services.verificar_threshold_bairro()` → cria `AlertaBairro` se threshold cruzado.
4. **Defesa Civil** autentica e vai pra `/dashboard` com: 4 KPIs, banner de gatilhos automáticos ativos (US07), mapa + barra de filtros bairro/nível (US08), "Bairros críticos", tabela. Polling de 30s.
5. **Defesa Civil** pode marcar gatilhos como resolvidos (`POST /api/alertas/bairros/<id>/resolver/`) e filtrar por bairro/nível no mapa e tabela.
6. **Admin** acessa `/dashboard/sensores` para CRUD de sensores IoT e `/dashboard/usuarios` para gestão de usuários.

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
│       │   ├── Alertas.jsx         # US02/US04 — meus relatos (editar/deletar)
│       │   ├── Perfil.jsx          # edição de perfil do usuário
│       │   ├── Dashboard.jsx       # US06/US07/US08 — visão geral + filtros + gatilhos
│       │   ├── DashboardGraficos.jsx  # US06 — aba gráficos
│       │   ├── SensoresAdmin.jsx   # US09 — CRUD de sensores (role=admin)
│       │   └── UsuariosAdmin.jsx   # gestão de usuários (role=admin)
│       ├── components/
│       │   ├── ProtectedRoute.jsx  # ProtectedRoute + PublicOnly + RoleProtectedRoute
│       │   ├── MenuPerfil.jsx      # dropdown de perfil + sair
│       │   ├── MapaRecife.jsx      # Leaflet + áreas pintadas + marcadores relatos + sensores
│       │   ├── AreaRisco.jsx       # círculo geográfico colorido por nível
│       │   ├── MarcadorRelato.jsx
│       │   ├── MarcadorSensor.jsx  # US09 — ícone diferenciado por tipo de sensor
│       │   ├── LegendaNiveis.jsx
│       │   ├── NivelSelector.jsx
│       │   ├── BairroSelect.jsx
│       │   ├── BuscaCEP.jsx
│       │   ├── TelefoneInput.jsx   # input com máscara E.164 pra WhatsApp
│       │   ├── BotaoDenuncia.jsx   # denunciar relato como falso
│       │   ├── BotaoConfirmacao.jsx # confirmar que relato é verdadeiro
│       │   └── dashboard/
│       │       ├── DashboardLayout.jsx  # header + tabs + Outlet
│       │       ├── KpiCard.jsx
│       │       ├── BairrosCriticos.jsx
│       │       ├── GatilhosAtivos.jsx   # US07 — banner de AlertaBairro ativos
│       │       └── TabelaRelatos.jsx    # com coluna Foto + lightbox
│       ├── contexts/
│       │   └── AuthContext.jsx     # user + login/register/logout
│       └── lib/
│           ├── api.js              # axios instance + interceptors JWT
│           ├── relatos.js          # service de relatos (+ ?meus=true, ?nivel=, ?bairro=)
│           ├── dashboard.js        # service do painel (resumo + gatilhos)
│           ├── sensores.js         # service de sensores (US09)
│           ├── usuarios.js         # service de usuários (admin)
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
│   │   ├── settings.py             # AUTH_USER_MODEL, SIMPLE_JWT, DRF, CORS, SIMA_ALERTAS
│   │   ├── urls.py                 # /api/users/ /api/relatos/ /api/alertas/ /api/sensores/ etc.
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/                  # ✅ US10 — login JWT, role, permissions, CRUD usuários
│   │   ├── relatos/                # ✅ US04 — CRUD com imagem, Denuncia, Confirmacao
│   │   ├── areas_risco/            # ✅ Bairro + seed migration
│   │   ├── dashboard/              # ✅ US06 — endpoint agregado
│   │   ├── alertas/                # ✅ US02/US05/US07 — Alerta + AlertaBairro + signal + WA
│   │   │   ├── models.py           # Alerta (por usuário) + AlertaBairro (threshold bairro)
│   │   │   ├── services.py         # relato_criado() + verificar_threshold_bairro()
│   │   │   ├── signals.py          # post_save(Relato) → despacha em thread separada
│   │   │   ├── whatsapp.py         # adaptador Twilio + Meta + webhook view
│   │   │   └── views.py            # AlertaBairroListView + AlertaBairroResolverView
│   │   ├── sensores/               # ✅ US09 — Sensor IoT CRUD
│   │   └── clima/                  # ⏳ reservado pra integração meteorológica
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

```sql
-- ✅ users (apps.users.User — AbstractBaseUser + PermissionsMixin)
users (
  id PK,
  nome,
  email UNIQUE,            -- USERNAME_FIELD
  password,                -- hash do Django
  telefone,                -- E.164 normalizado (pra WhatsApp — US02/US05)
  bairro_id FK → bairros,  -- bairro principal de monitoramento
  lat, lng,                -- coordenadas opcionais (geofencing US02)
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
  endereco VARCHAR(512),   -- endereço reverso (geocoder)
  descricao TEXT(500),
  imagem,                  -- ImageField, upload_to='relatos/'
  created_at
)
-- índices: bairro_id, -created_at

-- ✅ denuncias / confirmacoes (apps.relatos — crowdsourcing de veracidade)
denuncias    (id PK, relato_id FK, user_id FK, created_at) -- unique(relato, user)
confirmacoes (id PK, relato_id FK, user_id FK, created_at) -- unique(relato, user)

-- ✅ alertas (apps.alertas.Alerta — US02/US05 — 1 registro por relato×usuário×canal)
alertas (
  id PK,
  relato_id FK → relatos (CASCADE),
  usuario_id FK → users (CASCADE),
  canal,    -- 'email' | 'whatsapp' | 'push'
  status,   -- 'pendente' | 'enviado' | 'falhou'
  detalhe,  -- erro ou ID externo do envio
  created_at
)
-- unique_together: (relato, usuario, canal)

-- ✅ alertas_bairro (apps.alertas.AlertaBairro — US07 — gatilho por threshold)
alertas_bairro (
  id PK,
  bairro_id FK → bairros (CASCADE),
  nivel,         -- 'atencao' | 'alerta' | 'critico'
  status,        -- 'ativo' | 'resolvido'
  total_relatos, -- relatos na janela que dispararam
  criado_em,
  resolvido_em,
  resolvido_por FK → users (SET_NULL)
)

-- ✅ sensores (apps.sensores.Sensor — US09)
sensores (
  id PK,
  nome VARCHAR(120),
  tipo,           -- 'pluviometro' | 'regua_nivel' | 'camera' | 'iot_generico'
  descricao TEXT(500),
  lat, lng,       -- DecimalField(9,6)
  bairro_id FK → bairros (SET_NULL),
  ativo BOOL,
  ultimo_dado_em, -- última leitura recebida
  created_at
)

-- ⏳ areas_risco (polígonos + threshold por área — fora do MVP)
-- ⏳ clima_historico (cache de APIs meteorológicas — pendente)
```

`User.bairro` é FK pra `Bairro` (não string livre), o que permite geofencing por bairro quando `lat/lng` do usuário não está preenchido.

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
| GET | `/api/users/` | bearer + admin | Lista todos os usuários (gestão). |
| GET / PATCH / DELETE | `/api/users/<id>/` | bearer + admin | Detalhe / editar / remover usuário. |
| GET / POST | `/api/relatos/` | bearer | Lista e cria relatos. Aceita `?ultimas_horas=N`, `?bairro=<id ou slug>`, `?nivel=`, `?meus=true`. |
| GET / PATCH / DELETE | `/api/relatos/<id>/` | bearer + dono | Detalhe / editar / apagar relato. |
| POST | `/api/relatos/<id>/denunciar/` | bearer | Denuncia relato como falso (idempotente). |
| DELETE | `/api/relatos/<id>/denunciar/` | bearer | Retira denúncia. |
| POST | `/api/relatos/<id>/confirmar/` | bearer | Confirma relato como verdadeiro (idempotente). |
| DELETE | `/api/relatos/<id>/confirmar/` | bearer | Retira confirmação. |
| GET | `/api/bairros/` | livre | Lista de bairros (pro `BairroSelect`). |
| GET | `/api/dashboard/resumo/` | bearer + DC/admin | KPIs (hoje/7d/30d), `por_nivel`, top `por_bairro`, `ultimo_relato_em`. |
| GET | `/api/alertas/bairros/` | bearer + DC/admin | Gatilhos automáticos ativos por bairro (US07). |
| POST | `/api/alertas/bairros/<id>/resolver/` | bearer + DC/admin | Marca AlertaBairro como resolvido (US07). |
| GET / POST | `/api/alertas/whatsapp/webhook/` | público | Verificação Meta (GET) e recebimento de mensagens WA (POST). |
| GET / POST | `/api/sensores/` | bearer (leitura); admin (escrita) | Lista e cadastra sensores IoT (US09). Aceita `?ativo=true/false`. |
| GET / PATCH / DELETE | `/api/sensores/<id>/` | bearer (leitura); admin (escrita) | Detalhe / editar / remover sensor. |
| (admin) | `/admin/` | Django admin | Promover usuários, ver dados crus. |

**Permissions custom:** `apps.users.permissions.IsDefesaCivilOrAdmin` (libera operador, admin role e superuser). `SoAdminEscrita` em sensores (leitura para qualquer autenticado, escrita somente admin).

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

## 7. Trilha de Análise e Visualização de Dados (AVD)

O PDF `context/requisitos_avd.pdf` lista **10 entregáveis CC** que cobrem o ciclo completo: planejamento → dados → EDA → modelos → dashboard → documentação. Todos vivem em `ml/`. A ferramenta de publicação escolhida é **Streamlit** (já no stack, já em `requirements-ml.txt`).

---

### 7.1. Mapeamento Entregáveis CC → Tarefas SIMA

| Entregável CC | Tarefa | Arquivo principal | Status |
| --- | --- | --- | --- |
| Plano de análise | AVD-01 | `ml/docs/01_plano_analise.md` | ⏳ |
| Plano de preparação dos dados | AVD-02 | `ml/docs/02_plano_dados.md` | ⏳ |
| EDA com visualizações | AVD-03 | `ml/notebooks/01_eda.ipynb` | ⏳ |
| Notebook de regressão | AVD-04 | `ml/notebooks/02_regressao.ipynb` | ⏳ |
| Visualizações de classificadores | AVD-05 | `ml/notebooks/03_classificador.ipynb` | ⏳ |
| Primeira versão do dashboard interativo | AVD-06 | `ml/streamlit_app/` (v1) | ⏳ |
| Proposta de integração visual | AVD-07 | `ml/docs/03_proposta_visual.md` | ⏳ |
| Dashboard consolidado | AVD-08 | `ml/streamlit_app/` (completo) | ⏳ |
| Versão quase final | AVD-09 | `ml/streamlit_app/` (refinado) | ⏳ |
| Documentação final | AVD-10 | `ml/docs/04_documentacao_final.md` | ⏳ |

---

### 7.2. Estratégia de Dados

O sistema está em produção há pouco tempo, então o banco real tem poucos relatos. A análise combina três fontes:

| Fonte | O que fornece | Como usar |
| --- | --- | --- |
| **PostgreSQL (real)** | Relatos reais, bairros, alertas_bairro, sensores | Leitura direta via `psycopg2` + `pandas.read_sql` |
| **Dados simulados históricos** | 6 meses de relatos com sazonalidade realista (mais alagamentos em abril-agosto, picos em horários de chuva) | Script `ml/scripts/gerar_dados_historicos.py` insere no Postgres |
| **Precipitação sintética** | Série temporal de chuva por bairro (correlacionada com os relatos simulados) | CSV gerado pelo mesmo script, salvo em `ml/data/precipitacao_historica.csv` |

**Por que dados simulados?** A integração meteorológica real (OpenWeather) ainda não foi codada, e o banco novo não tem volume suficiente pra análise estatística. Dados simulados com distribuição realista permitem demonstrar o pipeline completo sem bloquear a trilha. A documentação final declarará explicitamente as fontes.

---

### 7.3. Perguntas de Análise (AVD-01)

As cinco perguntas que guiam toda a análise:

1. **Distribuição temporal:** Qual é o padrão de alagamentos em Recife por hora do dia, dia da semana e mês? Existe sazonalidade?
2. **Concentração geográfica:** Quais bairros concentram mais ocorrências e qual o nível médio de severidade por bairro?
3. **Correlação chuva × relatos:** Existe correlação estatisticamente relevante entre precipitação acumulada e volume de relatos em uma janela de tempo?
4. **Tendência por regressão:** É possível prever o número de relatos nas próximas horas com base em precipitação e histórico recente?
5. **Classificação de risco:** Um classificador simples consegue prever o nível de risco de um bairro (Atenção / Alerta / Crítico) com base em features derivadas do histórico e da chuva?

---

### 7.4. Estrutura de Pastas `ml/` (alvo final)

```text
ml/
├── requirements-ml.txt            # pandas, sklearn, matplotlib, seaborn, jupyter, streamlit, psycopg2
├── docs/
│   ├── 01_plano_analise.md        # AVD-01 — perguntas, métricas, justificativa de gráficos
│   ├── 02_plano_dados.md          # AVD-02 — fontes, formatos, limpeza, normalização
│   ├── 03_proposta_visual.md      # AVD-07 — estrutura do Streamlit, organização por seções
│   └── 04_documentacao_final.md   # AVD-10 — histórico de decisões, insights, capturas
├── notebooks/
│   ├── 01_eda.ipynb               # AVD-03 — EDA: distribuições, correlações, séries temporais
│   ├── 02_regressao.ipynb         # AVD-04 — regressão linear, dispersão, resíduos
│   └── 03_classificador.ipynb     # AVD-05 — Random Forest simples, matriz confusão, ROC
├── scripts/
│   └── gerar_dados_historicos.py  # seed: 6 meses de relatos simulados + CSV precipitação
├── streamlit_app/
│   ├── app.py                     # entrada principal (st.set_page_config + navegação)
│   ├── pages/
│   │   ├── 01_visao_geral.py      # KPIs, mapa de calor por bairro, distribuição por nível
│   │   ├── 02_temporal.py         # séries temporais, sazonalidade, padrão por hora/dia
│   │   ├── 03_correlacao.py       # scatter chuva × relatos, linha de tendência, resíduos
│   │   ├── 04_modelos.py          # matriz de confusão, ROC, métricas do classificador
│   │   └── 05_sobre.py            # documentação analítica inline
│   └── utils/
│       ├── db.py                  # conexão PostgreSQL via psycopg2 (lê DB_URL do env)
│       └── modelos.py             # carrega .pkl serializados de ml/models/
├── data/                          # gitignored — precipitacao_historica.csv gerado pelo script
└── models/                        # gitignored — regressao.pkl, classificador.pkl
```

---

### 7.5. Serviço Streamlit no Docker Compose

Adicionar quarto serviço `streamlit` ao `docker-compose.yml`:

- Imagem base: `python:3.12-slim`
- Porta: `8501:8501`
- Volume: `./ml:/app` (hot-reload no desenvolvimento)
- Depende de: `postgres`
- Variável de ambiente: `DATABASE_URL=postgresql://sima:sima@postgres:5432/sima`
- Comando: `streamlit run /app/streamlit_app/app.py --server.port 8501 --server.address 0.0.0.0`

URL local após subir: `http://localhost:8501`

---

### 7.6. Detalhamento das Tarefas

#### AVD-01 — Plano de Análise (`ml/docs/01_plano_analise.md`)

Documento markdown com:

- As 5 perguntas de análise (§7.3) com hipóteses associadas
- Tabela: pergunta → métrica esperada → tipo de gráfico → justificativa perceptual (ex.: série temporal usa linha porque mapeia ordem temporal; distribuição categórica usa barra horizontal porque facilita comparação de magnitudes)
- Princípios de design visual aplicados: contraste de cor para severidade (vermelho/âmbar/verde), hierarquia tipográfica, uso de espaço negativo

#### AVD-02 — Plano de Preparação dos Dados (`ml/docs/02_plano_dados.md`)

Documento markdown com:

- Tabela de fontes: PostgreSQL real (relatos, bairros, alertas_bairro) + simulados (script Python) + CSV precipitação sintética
- Estratégia de limpeza: tratar nulos em `bairro_id`, remover relatos duplicados num raio de 50m em janela de 5min, normalizar `nivel` para ordinal (0/1/2)
- Variáveis derivadas: `hora_do_dia`, `dia_semana`, `relatos_na_janela_1h`, `precipitacao_acumulada_3h`, `nivel_maximo_bairro_6h`
- Justificativa por variável: por que cada transformação é necessária

#### AVD-03 — EDA (`ml/notebooks/01_eda.ipynb`)

Seções do notebook:

1. Conexão ao PostgreSQL e carregamento
2. Estatísticas descritivas (count, mean, std, quartis por variável)
3. Distribuição de relatos por nível (barplot)
4. Top 10 bairros por volume de relatos (barplot horizontal)
5. Distribuição temporal: relatos por hora do dia (barplot), por dia da semana (heatmap), por mês (linha)
6. Correlação: matrix de correlação (heatmap seaborn) entre features numéricas
7. Análise multivariada: scatter precipitação × relatos colorido por nível
8. Interpretação textual em cada seção (células markdown)

#### AVD-04 — Regressão (`ml/notebooks/02_regressao.ipynb`)

Seções:

1. Feature engineering: `precipitacao_acumulada_3h`, `hora_do_dia`, `relatos_janela_anterior`
2. Regressão Linear Simples: precipitação → número de relatos nas próximas 2h
3. Gráficos: scatter com linha de tendência (matplotlib), intervalo de confiança
4. Análise de resíduos: histograma + QQ-plot
5. Métricas: MAE, RMSE, R²
6. Regressão Múltipla com todas as features → comparação de R²
7. Serialização do modelo: `joblib.dump` em `ml/models/regressao.pkl`

#### AVD-05 — Classificador (`ml/notebooks/03_classificador.ipynb`)

Seções:

1. Definição do target: `nivel_risco_bairro` (0=atenção, 1=alerta, 2=crítico)
2. Features: `relatos_1h`, `relatos_3h`, `precipitacao_3h`, `hora_do_dia`, `dia_semana`
3. Split treino/teste (80/20), estratificado por classe
4. Modelo: `RandomForestClassifier` (simples, interpretável, adequado ao volume de dados)
5. Visualizações obrigatórias:
   - Matriz de confusão (heatmap normalizado)
   - Relatório: acurácia, precisão, recall, F1-score por classe
   - Curva ROC multi-classe (One-vs-Rest) com AUC
   - Curva Precision-Recall
   - Importância de features (barplot)
6. Análise textual das métricas e implicações práticas (ex.: o que significa alta precisão mas baixo recall para "crítico"?)
7. Serialização: `joblib.dump` em `ml/models/classificador.pkl`

#### AVD-06 / AVD-08 / AVD-09 — Streamlit Dashboard (v1 → consolidado → quase final)

O dashboard tem 5 páginas (ver estrutura §7.4). A evolução segue três marcos:

- **v1 (AVD-06):** Páginas 01 e 02 funcionando com dados carregados, filtros de bairro e período, narrativa visual básica
- **Consolidado (AVD-08):** Todas as 5 páginas completas, modelos `.pkl` integrados, filtros globais na sidebar, elementos interpretativos em cada seção
- **Quase final (AVD-09):** Refinamentos de UX (cores consistentes com o padrão SIMA verde/âmbar/vermelho, fontes, mobile-friendly), feedback incorporado, sem erros de carregamento

#### AVD-07 — Proposta de Integração Visual (`ml/docs/03_proposta_visual.md`)

Documento com:

- Diagrama da estrutura de páginas do Streamlit
- Paleta de cores (consistente com o frontend React: `#16a34a` atenção, `#d97706` alerta, `#dc2626` crítico)
- Hierarquia visual: título da página → métrica KPI → gráfico principal → gráfico de detalhe → texto interpretativo
- Decisão de ferramenta: Streamlit (justificativa: já no stack, próximo dos notebooks, Python nativo, sem curva de aprendizado extra)

#### AVD-10 — Documentação Final (`ml/docs/04_documentacao_final.md`)

- Histórico de decisões analíticas (ex.: por que Random Forest e não Logistic Regression; por que janela de 3h e não 1h)
- Capturas de tela das páginas do Streamlit
- Síntese dos 5 principais insights gerados
- Limitações e trabalhos futuros (dados simulados vs reais, integração OpenWeather)

---

## 8. Status (atualizado conforme USs entram)

### 8.1. ✅ Entregue — todas as 10 USs do MVP

- [x] Docker Compose com postgres + backend (Django auto-migrate) + frontend (Vite dev), hot-reload nos dois lados
- [x] `.env.example` na raiz com vars de DB / Vite / OpenWeather / Tomorrow / WhatsApp / Twilio / Django
- [x] **US10** — User customizado (email), JWT (access + refresh + rotação + blacklist), endpoints register/login/refresh/logout/me, admin customizado, tabs Cidadão/Defesa Civil no front, `RoleProtectedRoute`, seed automático de contas `defesa@sima.local/defesa123` e `admin@sima.local/admin123` via data migration. Edição de perfil em `/perfil`. Gestão de usuários em `/dashboard/usuarios` (admin).
- [x] **Bairros** — model + seed migration com bairros oficiais de Recife (`apps.areas_risco`)
- [x] **US04** — model `Relato` com FK pra Bairro, `nivel`, `endereco`, `descricao`, `imagem` (ImageField + Pillow); ViewSet DRF com CRUD; form React + Leaflet pra escolher ponto; suporte a edição/exclusão. Models `Denuncia` e `Confirmacao` para crowdsourcing de veracidade.
- [x] **US01** — mapa do cidadão com Leaflet + contornos GeoJSON de bairros + áreas de risco pintadas (círculos geográficos coloridos) + marcadores clicáveis + `MarcadorSensor` para sensores IoT ativos; polling 30s
- [x] **US03** — vocabulário Atenção/Alerta/Crítico em toda UI; áreas pintadas em verde/âmbar/vermelho com raio crescente (60/90/130m); legenda fixa
- [x] **US06** — endpoint `/api/dashboard/resumo/`, painel React com 4 KPIs, mapa com filtros, "Bairros críticos", tabela Foto + lightbox, aba "Gráficos" com Recharts (barras empilhadas, pizza, top bairros), polling 30s
- [x] **US08** — `?bairro=<id|slug>&nivel=<n>` no `RelatoViewSet`; dropdowns de filtro no painel (bairro + nível) com reload automático
- [x] **US07** — model `AlertaBairro`, `services.verificar_threshold_bairro()` (configurable via `SIMA_ALERTAS`), signal `post_save(Relato)` dispara em thread, endpoint `GET /api/alertas/bairros/` e `POST .../resolver/`, componente `GatilhosAtivos` no painel
- [x] **US02** — `services.relato_criado()`: geofencing Haversine, seleção de usuários no raio ou mesmo bairro, disparo de email (Django `send_mail`) + WhatsApp; model `Alerta` persiste histórico com status (enviado/falhou)
- [x] **US05** — `apps/alertas/whatsapp.py`: suporta Twilio (Content Template + session message) e Meta Cloud API; webhook GET/POST para verificação e recebimento de mensagens WA
- [x] **US09** — model `Sensor` com tipo/lat/lng/bairro/ativo; CRUD via DRF (`/api/sensores/`); página `SensoresAdmin` em `/dashboard/sensores` (role=admin); `MarcadorSensor` no mapa

### 8.2. ⏳ Trilha AVD (pendente)

#### Fase 1 — Fundação de dados (pré-requisito de tudo)

- [ ] Script `ml/scripts/gerar_dados_historicos.py` — gera 6 meses de relatos simulados + `precipitacao_historica.csv`
- [ ] Serviço `streamlit` adicionado ao `docker-compose.yml` (porta 8501)
- [ ] `ml/streamlit_app/utils/db.py` — conector PostgreSQL via `DATABASE_URL`

#### Fase 2 — Documentos de planejamento

- [ ] AVD-01: `ml/docs/01_plano_analise.md`
- [ ] AVD-02: `ml/docs/02_plano_dados.md`
- [ ] AVD-07: `ml/docs/03_proposta_visual.md`

#### Fase 3 — Notebooks

- [ ] AVD-03: `ml/notebooks/01_eda.ipynb` — EDA completa com gráficos e interpretação
- [ ] AVD-04: `ml/notebooks/02_regressao.ipynb` — regressão + resíduos + serialização
- [ ] AVD-05: `ml/notebooks/03_classificador.ipynb` — Random Forest + matriz confusão + ROC

#### Fase 4 — Streamlit

- [ ] AVD-06: `ml/streamlit_app/` v1 — páginas Visão Geral e Temporal funcionando com filtros
- [ ] AVD-08: Dashboard consolidado — todas as 5 páginas + modelos `.pkl` integrados
- [ ] AVD-09: Versão quase final — paleta de cores SIMA, feedback incorporado, sem erros

#### Fase 5 — Documentação

- [ ] AVD-10: `ml/docs/04_documentacao_final.md` — decisões, capturas, insights, limitações

### 8.3. Outras pendências técnicas

- [ ] Ordenação alfabética da seed de bairros desalinhada com o teste `test_ordenacao_alfabetica` em `apps.areas_risco.tests` (1 falha pré-existente)
- [ ] Setup de linters (black/ruff + ESLint/Prettier)
- [ ] Definir alvo de deploy (cloud provider, CI/CD)
- [ ] Limpar marcadores `DEMO-MODE` (ver [`lib/demoMode.jsx`](frontend/src/lib/demoMode.jsx)) antes de qualquer demo "séria"
- [ ] Implementar opt-out de WhatsApp: webhook já recebe "PARAR" mas a flag no `User` ainda não é persistida

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
