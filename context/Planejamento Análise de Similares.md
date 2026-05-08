### ![][image1]

### Planejamento Análise de Similares

### **1\. Definição do Ecossistema de Análise**

Identifique quem olhar e por quê.

* **Concorrentes Diretos:**   
  * **Defesa Civil:**   
    * **Porque estamos analisando ?** A Defesa Civil é o principal agente de resposta a desastres naturais no Brasil e atua diretamente no mesmo problema que queremos resolver. Analisá-la nos permite entender o modelo atual de alertas e identificar suas lacunas: os avisos são reativos, genéricos e chegam tarde, muitas vezes quando o risco já é iminente. Isso valida a necessidade do nosso projeto, que propõe antecipação via sensores e IA, personalização por localização e comunicação acessível em tempo real.  
  * **Sistemas Oficiais (APAC):**   
    * **Porque estamos analisando ?**  A APAC já monitora níveis de rios e dados climáticos em Pernambuco, ou seja, opera no mesmo contexto geográfico e técnico do nosso projeto. Analisá-la nos mostra o que já existe em termos de infraestrutura de dados e onde está o gap: as informações são técnicas, pouco acessíveis e não traduzidas para o morador comum de área de risco. Nosso projeto se diferencia ao transformar esses dados em alertas simples e acionáveis para quem mais precisa. 

  * **Cemaden:**  
    * **Porque ?** O Cemaden representa o estado da arte em monitoramento de desastres naturais no Brasil, com tecnologia avançada e dados históricos robustos. Analisá-lo nos ajuda a entender o teto tecnológico do setor e, ao mesmo tempo, sua principal limitação: opera em escala nacional, o que sacrifica a precisão local. Isso reforça o diferencial do nosso projeto, uma solução hipercontextualizada para bairros vulneráveis específicos do Recife, com sensores próprios e previsão localizada.   
* **Concorrentes Indiretos:**   
  * **Waze:**   
    * **Porque estamos analisando ?** O Waze consegue monitorar alagamentos através de alertas colaborativos de usuários, informando as pessoas em tempo real sobre riscos no espaço urbano. Analisá-lo nos ensina como engajar a comunidade como fonte de dados, como entregar alertas de forma clara e urgente, e como manter um sistema "vivo" que atualiza continuamente sem sobrecarregar o usuário. Esses princípios são diretamente aplicáveis ao nosso dashboard e sistema de notificações.   
  * **Google Maps:**  
    * **Porque estamos analisando ?** O Google Maps é a referência mundial em traduzir dados complexos geoespaciais em interfaces simples e intuitivas. Analisá-lo nos mostra como usar camadas visuais: cores, ícones e níveis de risco para facilitar decisões rápidas, algo essencial para moradores em situação de emergência. O mapa interativo de áreas de risco do nosso projeto é diretamente inspirado nessa lógica de UX. 

  * **AlertaBlu:**   
    * **Porque estamos analisando ?** O AlertaBlu é o similar mais próximo funcionalmente do que queremos construir: monitorar o nível de rios em tempo real e comunicar isso à população de Blumenau. Analisá-lo é essencial porque nos mostra o que já funciona nesse modelo e onde há espaço para evolução, ele é geograficamente limitado, não usa IA preditiva e tem pouca escalabilidade. Nosso projeto aprende com o que ele acerta e avança onde ele para. 

* **Referência Analógica:**  
  * Google Maps:  
    * **Porque estamos analisando ?** O Google Maps resolve um desafio central para o nosso projeto: como representar dados complexos e dinâmicos no espaço urbano de forma que qualquer pessoa consiga tomar uma decisão rápida sem precisar interpretar números ou relatórios técnicos.   
    * **Como funciona ?** No modo trânsito, ele coleta velocidade de milhares de dispositivos simultaneamente, agrega esses dados, e os traduz em uma escala de cores (verde → amarelo → vermelho) mapeada sobre as vias. O usuário vê uma rua vermelha e instintivamente desvia.   
    * **Por que isso é interessante para o nosso problema ?** Moradores de áreas de risco em situação de emergência não têm tempo nem condições de interpretar gráficos de nível de água em centímetros. Precisamos de uma lógica visual semelhante à do Maps: um mapa onde as áreas de risco mudam de cor conforme o nível da água sobe, onde o usuário olha e imediatamente entende se deve ou não evacuar 

  * Uber:  
    * **Porque estamos analisando isso ?** O Uber resolve um problema de ansiedade informacional em tempo real: o usuário precisa saber o que está acontecendo agora, sem precisar perguntar ou atualizar a tela. Esse é exatamente o desafio do nosso dashboard durante uma chuva intensa.   
    * **Como Funciona ?** O Uber transforma cada motorista em uma fonte de dado. A posição, velocidade e rota de milhares de usuários simultâneos alimentam o sistema continuamente, tornando a informação mais precisa e abrangente do que qualquer sensor centralizado conseguiria sozinho. O dado não vem de uma infraestrutura cara, vem da própria comunidade de usuários, que sem perceber está contribuindo para a qualidade do sistema.   
    * **Por que isso é interessante para o nosso problema ?** Inspirados nessa lógica, buscamos adotar o crowdsourcing como mecanismo central de atualização: os próprios moradores de áreas de risco enviam alertas quando identificam alagamentos no seu entorno. Isso resolve um problema real do projeto, sensores físicos têm cobertura limitada e custo alto, enquanto a comunidade já está presente em todos os pontos críticos. Quanto mais usuários engajados, mais preciso e abrangente fica o mapeamento de risco, criando um sistema que cresce com o uso. 

  ### **2\. Inventário de Funcionalidades (O "O Quê")**

Crie uma matriz comparativa para listar o que está presente em cada similar.

* **Funcionalidade:** Ex: "Busca Global", "Dashboard de Prazos", "Chatbot de Triagem".  
* **Presença:** (Sim / Não / Parcial).  
* **Nível de Maturidade:** (Básico, Intermediário, Avançado).

| Similar | Alerta em Tempo Real | Geolocalização | Funciona sem internet | Sensores Físicos | Previsão com IA | Maturidade Geral |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Waze | Sim | Sim (GPS) | Não | Não | Não | Avançado |
| Defesa Civil | Parcial | Parcial | Sim | Não | Não | Básico |
| Sistemas Oficiais (APAC) | Sim | Sim | Não | Não | Parcial | Avançado |
| Cemaden | Sim | Sim | Não | Sim | Parcial | Avançado |
| AlertaBlu | Sim | Parcial | Não | Sim | Não | Intermediário |

**Padrões Observados:** 

* Todos os similares entregam algum nível de alerta, mas nenhum combina as três camadas juntas: sensor físico \+ previsão com IA \+ participação da comunidade.  
* Os sistemas mais maduros tecnologicamente (APAC, Cemaden) são os menos acessíveis para o usuário comum, há uma correlação clara entre complexidade técnica e baixa usabilidade.  
* Apenas o Waze usa crowdsourcing, mas aplicado ao contexto de trânsito. Nenhum dos similares voltados especificamente para monitoramento de alagamentos adota esse mecanismo, o que representa uma lacuna clara e uma oportunidade para o projeto aplicar essa lógica no contexto de emergências climáticas em comunidades vulneráveis.   
* A maioria depende de internet para funcionar, o que é uma fragilidade crítica considerando que eventos de chuva intensa frequentemente afetam a infraestrutura de comunicação.

**Lacunas Identificadas:**

* Nenhum similar entrega uma solução hiperlocal focada em bairros vulneráveis específicos do Recife.  
* A combinação de sensores físicos com IA preditiva e alertas acessíveis via WhatsApp ainda não existe em nenhum dos sistemas analisados.  
* A participação ativa da comunidade como fonte de dados é inexplorada por todos os similares, sendo uma oportunidade clara de diferenciação.  
* Nenhum sistema traduz dados técnicos em linguagem simples e acionável para moradores sem familiaridade com tecnologia.

  ### **3\. Engenharia Reversa e Lógica de Programação (O "Como")**

Aqui é onde traduzimos a interface para a tecnologia. Para cada funcionalidade chave, analise os seguintes pilares:

#### **A. Input de Dados e Fontes**

* **Waze:** Captura dados de localização e velocidade dos próprios usuários via GPS do smartphone em tempo real. Complementa com relatórios manuais da comunidade (acidentes, alagamentos, radares) e consome APIs externas de mapas base. O dado não vem de infraestrutura própria, vem do comportamento passivo e ativo dos usuários.   
* **Defesa Civil:** Recebe dados principalmente por canais manuais: ligações, denúncias via aplicativo e relatórios de agentes de campo. Em alguns municípios consome dados da APAC e Cemaden como fonte secundária. O input é majoritariamente humano e reativo, só entra quando alguém reporta.  
* **APAC:** Opera uma rede própria de pluviômetros e réguas de nível de rio distribuídos por Pernambuco. Os sensores enviam leituras periódicas para um servidor central. Os dados são abertos e consultáveis, mas em formato técnico, sem tratamento para o usuário final.   
* **Cemaden:** Mantém uma rede nacional de sensores meteorológicos, pluviômetros e estações hidrológicas. Consome também dados de satélite e de radares meteorológicos do INMET. O volume de dados é massivo e o processamento é feito em servidores próprios de alta capacidade.   
* **AlertaBlu:** Utiliza sensores de nível instalados nos rios de Blumenau, com leituras automáticas enviadas periodicamente ao sistema. Complementa com dados pluviométricos e integra informações da Defesa Civil local. 

  #### **B. Processamento e Lógica de Negócio (Backend)**

* **Waze:** Agrega os dados de velocidade de milhares de usuários simultâneos e aplica algoritmos para detectar lentidão, acidentes e rotas alternativas. Usa histórico de tráfego para prever condições futuras em horários específicos. Relatórios manuais passam por validação cruzada, só são exibidos se confirmados por múltiplos usuários na mesma região.   
* **Defesa Civil:** O processamento é majoritariamente humano. Técnicos analisam os dados recebidos e decidem manualmente quando emitir alertas. Não há camada de IA ou automação significativa, a inteligência está nas pessoas, não no sistema.    
* **APAC:** Processa séries temporais de nível de rio e volume de chuva. Compara leituras atuais com históricos para identificar situações de risco. Gera boletins técnicos periódicos, mas sem automação de alertas para o público geral.   
* **Cemaden:** Utiliza modelos meteorológicos numéricos e algoritmos de machine learning para prever eventos extremos com antecedência. Cruza dados de múltiplas fontes (satélite, radar, sensores terrestres) para aumentar a precisão das previsões. É o sistema com maior capacidade preditiva entre os analisados.   
* **AlertaBlu:** Define limites de nível de rio para cada estágio de alerta (atenção, alerta, emergência). Quando o sensor ultrapassa um threshold, o sistema dispara automaticamente o alerta correspondente. Não usa IA, a lógica é baseada em regras fixas definidas previamente. 

  #### **C. Performance e Feedback (Frontend)**

* **Waze:** Entrega alertas visuais no mapa e notificações sonoras dentro do próprio app. A comunicação é contextual, o usuário só recebe o alerta quando está próximo da ocorrência.  
* **Defesa Civil:** Comunica via SMS, redes sociais e sirenes físicas em algumas cidades. Os alertas são genéricos, enviados para regiões amplas sem segmentação por proximidade real do risco.  
* **APAC:** Publica boletins no site e redes sociais. Não possui canal de alerta direto ao cidadão, a informação precisa ser buscada ativamente pelo usuário.  
* **Cemaden:** Envia alertas para a Defesa Civil dos municípios, que então decide como comunicar à população. O cidadão comum raramente recebe a informação diretamente.  
* **AlertaBlu:** Envia notificações push pelo app e disponibiliza o nível do rio em tempo real numa interface simples. É o similar com a comunicação mais direta ao cidadão entre os sistemas oficiais analisados.


* #### **Sobre nosso projeto:**

  * **Estados da Interface:** Como o sistema lida com carregamento (Loading), erro e sucesso?  
    * **Loading:**  
      * Consulta dados meteorológicos  
      * Atualiza previsões do modelo de IA  
      * Carrega mapa e sensores  
      * Processa histórico de alertas  
    * **Erro:**  
      * Falha de conexão com API  
      * Sensor offline  
      * Timeout no modelo preditivo  
      * Falha no envio de alerta  
    * **Sucesso:**  
      * Alerta enviado com sucesso  
      * Previsão recalculada  
      * Dados sincronizados  
  * **Atualização em tempo real via CrowdSourcing:**  
    * Em vez de depender exclusivamente de sensores físicos ou APIs externas, nosso sistema adota crowdsourcing como mecanismo de atualização: os próprios moradores enviam relatos de alagamento em tempo real diretamente pelo app. Isso é especialmente relevante porque comunidades vulneráveis já estão presentes nos pontos de risco, elas enxergam o problema antes de qualquer sensor. 

Referências:

* [https://www.defesacivil.pe.gov.br/](https://www.defesacivil.pe.gov.br/)  
  * [https://www.apac.pe.gov.br/](https://www.apac.pe.gov.br/)  
  * [https://www.gov.br/cemaden/pt-br](https://www.gov.br/cemaden/pt-br)  
  * Waze atuando também no alerta de áreas alagadas: [https://g1.globo.com/mt/mato-grosso/noticia/2026/03/12/defesa-civil-e-app-de-rotas-por-gps-orientam-motoristas-sobre-areas-alagadas-pela-chuva-em-mt.ghtml](https://g1.globo.com/mt/mato-grosso/noticia/2026/03/12/defesa-civil-e-app-de-rotas-por-gps-orientam-motoristas-sobre-areas-alagadas-pela-chuva-em-mt.ghtml)  
  *  [https://defesacivil.blumenau.sc.gov.br/p/home](https://defesacivil.blumenau.sc.gov.br/p/home)

Declaração de Uso de Inteligência Artificial:

A metodologia de execução do grupo foi otimizada através do **Claude (Anthropic)**, como auxiliar de pesquisa e revisão, que permitiu focar o esforço humano na análise crítica dos similares e na argumentação estratégica do projeto. O uso da IA para organização de informações, correção gramatical e pesquisa de materiais sobre monitoramento de alagamentos não apenas acelerou o cronograma, mas elevou o rigor da entrega ao garantir maior clareza na estruturação dos conteúdos e consistência na apresentação das análises.

[image1]: <data:image/png;base64,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>