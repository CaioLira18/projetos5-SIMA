# projetos5-SIMA

## 🌧️ **Sobre o Projeto**

O **SIMA** (Sistema Inteligente de Monitoramento e Alerta de Alagamentos) é uma plataforma hiperlocal, preventiva e acessível desenvolvida em parceria com a **Prefeitura do Recife** para proteger comunidades vulneráveis a enchentes urbanas. O sistema tem como motor central a **antecipação do risco** e a **acessibilidade do alerta**, garantindo que a informação chegue ao morador *antes* da água, transformando o comportamento da população de reativo para preventivo, da captação comunitária do relato à inteligência preditiva multivariada.

---

## ⭐ **Funcionalidades Principais**

### **🚨 Reporte e Crowdsourcing Comunitário**

- **Registro de Alagamento com Geolocalização Inteligente:** Captura formal do relato do morador via app web com localização manual ou GPS automático, classificação tri-nível de severidade (baixo, médio, alto) e descrição opcional do contexto. Formaliza o comportamento informal de "olhar o nível da água na calçada" identificado no questionário com 43 moradores.
- **Validação Coletiva por Confirmação Cruzada:** Motor de confiabilidade que permite que vizinhos confirmem ou denunciem relatos existentes via contadores de confirmações e denúncias, mitigando *fake alerts* e elevando a precisão do mapa de risco através da inteligência distribuída da comunidade.
- **Atualização de Status em Tempo Real:** Fluxo de manutenção do dado que permite ao morador sinalizar normalização do alagamento ou persistência da ocorrência, mantendo o painel sempre coerente com a realidade de campo e evitando ruído histórico no dataset de treino.

### **🤖 Inteligência Preditiva e Análise de Dados**

- **Motor de Regressão Linear sobre Histórico Multivariado:** Modelo treinado em `scikit-learn` que cruza relatos consolidados, precipitação acumulada e variáveis meteorológicas para identificar tendência crescente de risco por região, serializado via `joblib` e consumido pelo backend Django para previsões em produção.
- **Integração Meteorológica Multi-Fonte com Redundância:** Camada de coleta que orquestra OpenWeather (1.000 req/dia), Tomorrow.io (precisão hiperlocal por GPS) e APAC quando viável, alimentando o modelo preditivo e permitindo classificação por bairro com tolerância a indisponibilidade de fonte.
- **Algoritmo de Gatilho Automático com Threshold por Área:** Pipeline orientado a polígonos geográficos que monitora cada área de risco cadastrada e dispara alertas automaticamente quando a tendência cruza limites críticos, eliminando dependência de intervenção humana, gargalo central da Defesa Civil tradicional.

### **📱 Notificação e Comunicação Direta**

- **Disparo Automatizado via WhatsApp Cloud API:** Canal de comunicação prioritário definido a partir da pesquisa com usuários (>85% de preferência), implementado via API oficial da Meta com mensagens em linguagem simples, mapa anexo, nível atual e orientação clara, tolerante à conectividade instável durante chuvas intensas.
- **Notificação Hiperlocal por Raio Geográfico:** Motor de segmentação que cruza a localização cadastrada do morador com o polígono da área afetada, garantindo que apenas usuários efetivamente expostos recebam o alerta, eliminando o ruído dos alertas genéricos da Defesa Civil tradicional.
- **Multi-Canal Tolerante a Falhas:** Estratégia de redundância que combina notificação no app, e-mail e WhatsApp para maximizar a entrega mesmo sob conectividade degradada, com SMS via Cell Broadcast como evolução futura para cenários de queda total de internet.

### **🗺️ Visualização e Mapa de Risco**

- **Mapa Interativo com Classificação Tri-Nível:** Painel geográfico inspirado na lógica visual do Google Maps com hierarquia de cores e severidade — **Atenção / Alerta / Emergência** — sem sobrecarga visual, marcadores diferenciados por nível e atualização contínua via polling HTTP (escolha consciente sobre WebSockets dada a instabilidade de rede).
- **Lista de Áreas Mais Afetadas com Ranking Temporal:** Visualização ordenada por quantidade de alertas em janelas de 24 horas e 7 dias, permitindo identificação rápida de regiões reincidentes e priorização operacional pela equipe de gestão pública.
- **Filtros Multidimensionais por Bairro e Severidade:** Sistema de filtragem por bairro, tipo de risco e nível de urgência que permite a moradores e gestores recortar a visualização para a sua área de interesse imediato.

### **📊 Dashboard Analítico e Trilha de Dados**

- **Painel Streamlit Independente do Produto:** Dashboard analítico autônomo construído em Streamlit que lê o mesmo Postgres do produto e expõe EDA, séries temporais, distribuições por bairro e métricas do modelo (MAE, RMSE, R², matriz de confusão, curva ROC), atendendo aos entregáveis específicos da Trilha de Análise e Visualização de Dados do 5º CC.
- **Notebooks de Análise Reproduzíveis:** Conjunto de notebooks Jupyter versionados (`01_eda` → `04_classificador`) que documentam o pipeline completo de exploração, pré-processamento, regressão e classificação binária de risco, garantindo reprodutibilidade científica e auditabilidade das decisões analíticas.
- **Documentação das Decisões Analíticas:** Registro estruturado das escolhas técnicas (regressão linear sobre RNN, polling sobre WebSockets, PostgreSQL relacional sobre NoSQL híbrido), explicitando o trade-off entre complexidade e validação rápida do MVP.

### **🛡️ Gestão Pública e Tomada de Decisão**

- **Painel da Defesa Civil com Status por Ponto Monitorado:** Interface de comando que exibe o status agregado (Normal / Atenção / Alerta) de todas as áreas de risco cadastradas, eliminando a necessidade de monitoramento manual contínuo e fornecendo visão executiva do estado da cidade.
- **Filtro Operacional por Região para Priorização de Atendimento:** Recorte por bairro e severidade que permite ao gestor concentrar recursos nas áreas mais críticas, integrando o trabalho com a operação da Defesa Civil sem substituí-la.
- **Histórico Auditável de Alertas Disparados:** Registro imutável de cada alerta enviado pelo sistema com origem (crowdsourcing, API meteorológica, modelo ML), canal (WhatsApp, e-mail, app), nível e timestamp, garantindo rastreabilidade para análise pós-evento.

### **🔐 Identidade e Acesso**

- **Cadastro com Vínculo Geográfico:** Registro de usuário com nome, e-mail, senha, telefone para WhatsApp e bairro principal de monitoramento, permitindo a segmentação hiperlocal das notificações desde o primeiro acesso.
- **Autenticação Padrão com Validação:** Login seguro por e-mail e senha com mensagens de erro claras, hash de senha e suporte futuro a autenticação via WhatsApp para minimizar fricção de adoção.

---

> [!WARNING]
> **📦 Entregáveis do Projeto**
>
> Abaixo estão os principais artefatos da fase de ideação organizados na pasta [`/context`](./context):
>
> - 📽️ [Modelo de Proposição](./context/Modelo%20de%20Proposição.md)
> - 🔍 [Pesquisa Desk Research](./context/Pesquisa%20Desk%20Research.md)
> - 🧩 [Planejamento de Análise de Similares](./context/Planejamento%20Análise%20de%20Similares.md)
> - 🧠 [Jornada do Usuário](./context/Jornada%20do%20Usuário.md)
> - 🗺️ [Backlog e Histórias do Usuário](./context/Backlog.md)
>

---

## 🏛️ **Arquitetura Técnica**

O sistema é estruturado em **três camadas independentes** com responsabilidades bem delimitadas, conectadas pelo banco PostgreSQL como fonte única da verdade.

```text
┌─────────────┐         ┌──────────────────┐        ┌────────────────┐
│  Frontend   │ ──────▶ │  Django + DRF    │ ─────▶ │  PostgreSQL    │
│  (React)    │  REST   │  (API REST)      │        │                │
└─────────────┘         └──────┬───────────┘        └────────────────┘
                               │                            ▲
                               │ APIs externas              │ leitura
                               ▼                            │
                        ┌──────────────┐            ┌───────┴─────────┐
                        │  OpenWeather │            │   Streamlit     │
                        │  Tomorrow.io │            │   (dashboard    │
                        │  APAC (opt)  │            │   analítico)    │
                        └──────────────┘            └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Modelo sklearn   │
                        │ (regressão)      │
                        └──────┬───────────┘
                               │ trigger
                               ▼
                        ┌──────────────────┐
                        │ WhatsApp Cloud   │
                        │ API (Meta)       │
                        └──────────────────┘
```

### **Stack Definida**

| Camada | Tecnologia | Decisão |
| --- | --- | --- |
| **Frontend** | React.js (Vite) | Interface do produto para morador e Defesa Civil |
| **Backend** | Python + Django + DRF | Integra direto com pipeline de dados/ML |
| **Banco** | PostgreSQL | Relacional — volume controlado no MVP |
| **Análise** | pandas + matplotlib | EDA, séries temporais, correlação chuva×nível |
| **ML** | scikit-learn (regressão linear) | Interpretável e treina com pouco dado |
| **Dashboard analítico** | Streamlit | Trilha de Análise e Visualização de Dados |
| **Tempo real** | Polling HTTP | WebSockets descartado por instabilidade de rede |
| **Canal de alerta** | WhatsApp Cloud API (Meta) | 85%+ dos usuários preferiram |

---

## 📋 **Distribuição de Tarefas**

### **Funcionalidades por Responsável**

| Funcionalidade | Responsável |
| --- | --- |
| **1 - Cadastro de Usuário com Vínculo Geográfico** | 🎯 *A definir* |
| **2 - Login e Autenticação Segura** | 🎯 *A definir* |
| **3 - Logout e Gestão de Sessão** | 🎯 *A definir* |
| **4 - Reporte de Alagamento com Geolocalização** | 🎯 *A definir* |
| **5 - Visualização de Alertas em Lista e Mapa** | 🎯 *A definir* |
| **6 - Atualização de Status do Alerta** | 🎯 *A definir* |
| **7 - Confirmação Comunitária de Alerta (Crowdsourcing)** | 🎯 *A definir* |
| **8 - Reporte de Alerta Falso (Anti-Fake Alerts)** | 🎯 *A definir* |
| **9 - Recebimento de Alertas Próximos via WhatsApp** | 🎯 *A definir* |
| **10 - Mapa de Risco com Classificação Tri-Nível** | 🎯 *A definir* |
| **11 - Lista de Áreas Mais Afetadas com Ranking Temporal** | 🎯 *A definir* |
| **12 - Modelo de Regressão Linear e Pipeline Preditivo** | 🎯 *A definir* |
| **13 - Integração Meteorológica Multi-Fonte** | 🎯 *A definir* |
| **14 - Dashboard Analítico Streamlit (Trilha de Dados)** | 🎯 *A definir* |
| **15 - Painel da Defesa Civil com Filtros Operacionais** | 🎯 *A definir* |

### **Equipe — 5º B Ciência da Computação**

- 🎯 Artur Sales
- 🎯 Bruno Assunção
- 🎯 Caio Ferreira
- 🎯 Carlos Espósito
- 🎯 Felipe Marques
- 🎯 Samuel Abreu
- 🎯 Thiago Vinicius

---

> Projeto acadêmico — **Cesar School**, 5º Período de Ciência da Computação, Trilha de Análise e Visualização de Dados, em parceria com a **Prefeitura do Recife**.
