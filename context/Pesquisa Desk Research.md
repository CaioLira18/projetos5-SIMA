###  ![][image1]

### **Pesquisa Desk Research**

Integrantes: Artur Sales \- CC, Bruno Assunção \- CC, Caio Ferreira \- CC, Carlos Espósito \- CC, Felipe Marques \- CC, Thiago Vinicius \- CC e Samuel Abreu \- CC

Título do Projeto: SOS-REC – Sistema Inteligente de Monitoramento e Alerta de Alagamentos 

Descrição: Levantamento de dados secundários sobre o problema, mercado, concorrência e tecnologias similares com base em informações secundárias. O objetivo é evitar "reinventar a roda" e identificar oportunidades de inovação.

#### 1\. Contexto e Problema	

* O Problema acontece no Recife, uma das cidades brasileiras mais vulneráveis a alagamentos. [Segundo o IBGE, mais de 206 mil recifenses residem em áreas sujeitas a inundações, o que coloca a capital pernambucana como a 5ª cidade do Brasil com maior população exposta a riscos naturais](https://portaldeprefeitura.com.br/pernambuco/recife-areas-de-risco-ibge-cemaden-ranking-nacional/618243/#google_vignette). [Esse número não é abstrato: em maio de 2022, as chuvas em Pernambuco deixaram 134 vítimas fatais e milhares de desabrigados, a maioria moradores de comunidades de baixa renda situadas próximas a rios e canais urbanos.](https://jc.uol.com.br/pernambuco/2023/05/15468725-desastre-das-chuvas-em-pernambuco-completa-um-ano-com-134-mortes-e-nenhuma-responsabilizacao.html) O desafio técnico central não é falta de dados, é a ausência de um fluxo que transforme dados em ação rápida e acessível. Os sistemas atuais falham porque o caminho entre a informação e o alerta é longo e depende de intervenção humana em várias etapas.  
  * No MVP do SOS-REC, esse problema é contornado com um fluxo simples e direto:  
    * 1\. Entrada de dados — Crowdsourcing: O morador reporta um alagamento pelo app com sua localização e nível de risco percebido. Não há sensores físicos nessa etapa — o dado vem da própria comunidade, que já está presente nos pontos de risco antes de qualquer sistema automatizado.  
    * 2\. Armazenamento — Banco Relacional: O relato é armazenado em um banco de dados relacional simples, registrando localização, horário e nível de risco reportado, além do histórico de alertas anteriores que serve de base para a análise.  
    * 3\. Análise — Regressão Linear: Com base no histórico de relatos e nos dados meteorológicos consumidos via API, um modelo de regressão linear identifica tendências de aumento de risco em áreas específicas. Se a tendência indica risco crescente, o sistema dispara o alerta automaticamente — sem esperar intervenção humana.  
    * 4\. Alerta — WhatsApp: O alerta chega diretamente no WhatsApp do morador cadastrado naquela área, com informação clara sobre o nível de risco e orientação do que fazer. O canal foi escolhido com base nos dados do questionário aplicado com moradores: mais de 85% preferiram WhatsApp como canal de alerta.

#### 1.1. O Objeto de Estudo e Cenário Atual

* Descrição Geral: Uma breve introdução sobre o setor (ex: Fintech, EdTech, Saúde Digital) e o cenário atual.  
* O projeto se insere no contexto de gestão e prevenção de desastres urbanos no Recife, um problema que já conta com sistemas existentes, mas nenhum deles resolve completamente a necessidade do morador em situação de risco. A análise abaixo aponta quando cada sistema funciona, quando falha e o que nenhum deles entrega hoje.   
  * Defesa Civil:  
    * *Quando funciona:* em eventos de grande escala, quando o risco já é amplamente visível e há tempo para mobilizar equipes. Os alertas via SMS têm a vantagem de funcionar sem internet, chegando a qualquer celular.  
    * *Quando falha:* em alagamentos-relâmpago em rios urbanos menores, onde o nível da água sobe em minutos. O modelo é reativo e depende de intervenção humana para disparar o alerta, o que gera atraso. Além disso, os alertas são genéricos, enviados para regiões amplas sem segmentação por proximidade real do risco, o que reduz sua utilidade prática para o morador.

  * APAC:  
    * *Quando funciona:* no monitoramento de rios de maior porte e na coleta de dados climáticos em Pernambuco. Gera dados confiáveis e históricos robustos que servem de referência para pesquisadores e órgãos públicos.  
    * *Quando falha:* os dados são técnicos e inacessíveis para o morador comum. A APAC relata dificuldade em monitorar rios urbanos menores devido ao tempo de resposta insuficiente, exatamente os canais que afetam as comunidades mais vulneráveis. A informação existe, mas não chega a quem precisa agir.  
  * Cemaden:  
    * *Quando funciona:* em previsões meteorológicas de escala regional e nacional, com alta capacidade tecnológica e científica. É o sistema com maior precisão preditiva entre os analisados.  
    * *Quando falha:* opera em escala nacional, o que sacrifica a precisão local. Para calcular o escoamento superficial com precisão, o sistema exige mapas atualizados de ruas, calçadas e bueiros, uma complexidade que gera atrasos no processamento. O alerta muitas vezes chega quando o nível da água já está alto demais para uma resposta preventiva. Além disso, o output do Cemaden vai para a Defesa Civil, não diretamente ao cidadão, criando um gargalo humano no meio do caminho.  
  * Waze:  
    * *Quando funciona:* em situações onde motoristas já estão circulando pela área afetada e reportam o alagamento ativamente. A interface é familiar, o alerta é visual e a informação se espalha rapidamente entre usuários próximos.  
    * *Quando falha:* o modelo é completamente reativo — o dado só existe se alguém já estiver no local do alagamento. Não há previsão nem antecipação. Além disso, o foco é em motoristas, deixando pedestres e moradores de áreas sem acesso a veículos sem cobertura. Em chuvas muito intensas, a conectividade instável compromete o funcionamento do app.

  * AlertaBlu:  
    * *Quando funciona:* é o similar mais próximo do que o projeto propõe. Entrega o nível do rio em tempo real para a população de Blumenau de forma simples e direta, com classificação clara de estágios de alerta. Demonstra que esse modelo é viável e tem adesão da comunidade.  
    * *Quando falha:* é geograficamente limitado a Blumenau e não possui capacidade preditiva — os alertas são baseados em thresholds fixos, sem análise de tendência. Não usa crowdsourcing e não escala para outras cidades sem infraestrutura própria de sensores.  
* O que nenhum sistema resolve hoje:  
  * Nenhum dos sistemas analisados entrega simultaneamente as três coisas que o morador de área de risco em Recife precisa: uma previsão antecipada de risco, segmentada por localização específica, comunicada de forma simples e direta no canal que ele já usa. A Defesa Civil alerta, mas tarde e de forma genérica. A APAC monitora, mas não comunica. O Cemaden prevê, mas não alcança o cidadão. O Waze engaja a comunidade, mas é reativo. O AlertaBlu comunica bem, mas não prevê. Essa lacuna é exatamente o espaço que o SOS-REC propõe ocupar.

#### 

#### 

#### 

#### 1.3. O Desafio Técnico (Perspectiva da Computação)

Aqui, o problema é traduzido em variáveis, processos e restrições.

* Gargalos de Processamento/Lógica: O problema atual existe por falta de automação, processamento lento de dados ou falta de integração entre sistemas?  
  * O gargalo principal é a falta de automação e a lentidão no processamento de alertas. Atualmente, a identificação de risco depende de observação humana ou de modelos meteorológicos macro, que não conseguem calcular a subida repentina de canais urbanos a tempo.  
* Complexidade de Dados: Que tipo de informação está sendo negligenciada ou mal gerida no cenário atual?   
  * O problema real relacionado às informações sobre os alagamentos não está na falta de dados, mas na desorganização e na ausência de integração entre eles. Existem diferentes tipos de dados geográficos e meteorológicos que monitoram o estado das chuvas em tempo real; no entanto, muitos apresentam baixa confiabilidade, estão em formatos distintos ou não convergem para um objetivo comum. Dessa forma, tornam-se dados isolados que, embora informativos, podem ser pouco úteis para a tomada de decisão.


  


* Limitações de Infraestrutura: Existe um impedimento tecnológico (ex: falta de conectividade, falta de segurança, interfaces obsoletas que não comunicam com APIs modernas) que agrava o problema?  
  * Existem limitações de infraestrutura tecnológica que agravam o problema dos alagamentos no trânsito em Recife. Parte dos dados públicos não está disponível por meio de APIs padronizadas, o que dificulta a integração automatizada entre sistemas. Além disso, a presença de sistemas legados, falhas de conectividade em períodos de chuva intensa e a baixa utilização de sensores inteligentes reduzem a precisão e a velocidade na identificação de pontos críticos, comprometendo a eficiência das soluções digitais.

#### 2\. Análise de Similares (Benchmarking)

* Design (UX/UI): Análise da interface e jornada do utilizador em produtos concorrentes. O que funciona e o que falha na interação?  
  * Waze:  
    * O Que funciona ? Alerta funcional e interface familiar  
    * O Que falha ? Depende de alguém já estar no alagamento e tem um foco nos motoristas, deixando o pedestre em segundo plano  
  * Defesa Civil:  
    * O que funciona ? Funciona em qualquer telefone e não precisa de internet  
    * O que não funciona ? Sem hierarquia visual ou mapas e o utilizador não sabe da gravidade total apenas por texto					  
* Computação (Arquitetura/Stack): Identificação das tecnologias utilizadas pelos concorrentes (se conhecidas) e análise de performance ou funcionalidades técnicas padrão do setor.  
  * **Waze:**  
    * **Arquitetura/Stack:** Plataforma em nuvem baseada em *crowdsourcing* (dados inseridos ativamente pelos utilizadores), alimentada por APIs de geolocalização e roteamento dinâmico.  
    * **Performance e Funcionalidades:** Possui alta escalabilidade e processamento de dados em tempo real. No entanto, sua arquitetura técnica é focada em motoristas e é reativa no contexto de alagamentos, pois depende de que alguém já esteja na área inundada para gerar o dado. Além disso, exige conectividade contínua (3G/4G), o que pode falhar durante tempestades extremas.

* **Defesa Civil (Alertas via SMS):**  
  * **Arquitetura/Stack:** Integração com operadoras de telecomunicações utilizando protocolos de *Cell Broadcast* (transmissão móvel) e gateways de SMS para disparos em lote.  
    * **Performance e Funcionalidades:** A principal vantagem técnica é a resiliência e alcance: funciona em qualquer telefone celular sem a necessidade de internet. O gargalo de performance está na arquitetura engessada de dados, que não suporta o envio de mapas, limitando-se a textos. A falta de automação micro-direcionada resulta em alertas amplos e tardios, falhando em prever inundações-relâmpago locais.

* **Sistemas Oficiais de Monitoramento (APAC / Cemaden):**  
  * **Arquitetura/Stack:** Rede de sensores físicos IoT (pluviômetros e sensores de nível) integrada a sistemas de telemetria e algoritmos complexos de modelagem hidráulica unidimensional e bidimensional.  
    * **Performance e Funcionalidades:** Gera dados oficiais de alta precisão. O desafio de performance reside no alto custo computacional: para prever o escoamento superficial, o sistema exige o cruzamento de mapas topográficos detalhados com a infraestrutura das ruas e bueiros. Essa complexidade técnica gera atrasos no processamento, resultando em um tempo de resposta insuficiente para monitorar rios urbanos menores em tempo real.

    

    

    

    

#### 3\. Levantamento Tecnológico e de Tendências

* O levantamento tecnológico foi organizado por capacidade — o que o sistema precisa ser capaz de fazer — e não por ferramenta específica. Isso evita o erro de escolher tecnologia antes de entender a função que ela precisa cumprir.  
  * **Capacidade 1 — Coleta de dados da comunidade:** O sistema precisa ser capaz de receber relatos de alagamento enviados pelos próprios moradores, com localização e nível de risco, de forma simples e sem fricção. A solução não pode exigir cadastro complexo ou interface técnica — o morador precisa conseguir reportar em segundos, mesmo sob estresse.  
  * **Capacidade 2 — Consumo de dados meteorológicos externos:** O sistema precisa integrar previsões de chuva e índices pluviométricos de fontes externas para enriquecer a análise de risco. Essa integração é automatizada — não depende de intervenção humana — e serve de insumo para o modelo de previsão. As APIs da OpenWeather e da APAC foram identificadas como as fontes mais acessíveis e relevantes para o contexto de Recife.  
  * **Capacidade 3 — Análise de tendência de risco:** O sistema precisa identificar se o risco em uma área está aumentando, estável ou diminuindo, com base no histórico de relatos e nos dados meteorológicos. Para o MVP, essa capacidade será entregue por um modelo de regressão linear — suficiente para identificar tendências com o volume de dados inicial e interpretável o suficiente para ser validado e ajustado ao longo dos testes.  
  * **Capacidade 4 — Visualização em tempo real:** O sistema precisa exibir um mapa atualizado com as áreas de risco classificadas por nível de perigo — Atenção, Alerta e Emergência — de forma que qualquer pessoa consiga tomar uma decisão em segundos, sem precisar interpretar números ou relatórios. A lógica visual é inspirada no Google Maps: cores simples, hierarquia clara, sem sobrecarga de informação.  
  * **Capacidade 5 — Envio de alertas diretos:** O sistema precisa ser capaz de notificar automaticamente os moradores cadastrados em áreas de risco assim que o modelo identificar tendência de perigo crescente. O alerta chega via WhatsApp — canal escolhido com base nos dados do questionário, onde mais de 85% dos respondentes o preferiram — com linguagem simples e orientação clara do que fazer.

* **Limitação técnica central:** A principal restrição identificada é a conectividade durante chuvas intensas. Parte dos moradores que responderam ao questionário relatou que o sinal de internet cai ou fica instável exatamente durante os eventos de maior risco. Todas as capacidades acima dependem de algum nível de conectividade — isso será monitorado durante os testes do MVP e pode orientar decisões futuras sobre canais alternativos de alerta.

BIBLIOGRAFIA:

* [https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/21566-estudo-inedito-mostra-moradores-sujeitos-a-enchentes-e-deslizamentos](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/21566-estudo-inedito-mostra-moradores-sujeitos-a-enchentes-e-deslizamentos)  
* [https://g1.globo.com/pe/pernambuco/noticia/ibge-contabiliza-mais-de-206-mil-moradores-em-areas-de-risco-no-recife.ghtml](https://g1.globo.com/pe/pernambuco/noticia/ibge-contabiliza-mais-de-206-mil-moradores-em-areas-de-risco-no-recife.ghtml)  
* [https://www.recife.pe.leg.br/comunicacao/noticias/2023/05/audiencia-publica-trata-da-situacao-dos-rios-do-recife](https://www.recife.pe.leg.br/comunicacao/noticias/2023/05/audiencia-publica-trata-da-situacao-dos-rios-do-recife)  
* [https://jc.uol.com.br/pernambuco/2023/05/15468725-desastre-das-chuvas-em-pernambuco-completa-um-ano-com-134-mortes-e-nenhuma-responsabilizacao.html](https://jc.uol.com.br/pernambuco/2023/05/15468725-desastre-das-chuvas-em-pernambuco-completa-um-ano-com-134-mortes-e-nenhuma-responsabilizacao.html)  
* [https://g1.globo.com/pe/pernambuco/noticia/2023/02/06/corpo-de-jovem-soterrado-por-barreira-e-encontrado-em-olinda.ghtml](https://g1.globo.com/pe/pernambuco/noticia/2023/02/06/corpo-de-jovem-soterrado-por-barreira-e-encontrado-em-olinda.ghtml)  
* [https://www2.recife.pe.gov.br/noticias/18/07/2023/prefeitura-conclui-instalacao-dos-primeiros-pluviometros-e-sensores-de](https://www2.recife.pe.gov.br/noticias/18/07/2023/prefeitura-conclui-instalacao-dos-primeiros-pluviometros-e-sensores-de)  
* [Avaliação do desempenho da modelagem hidráulica unidimensional e bidimensional na simulação de eventos de inundação em Colatina, ES](https://rigeo.sgb.gov.br/items/8d19badd-fc3e-4cc3-a03b-9a378c79c7ed)  
* [Modelagem hidráulica para mapeamento de risco e desenvolvimento de sistemas de alerta de inundação – Cemaden](http://www2.cemaden.gov.br/modelagem-hidraulica-para-mapeamento-de-risco-e-desenvolvimento-de-sistemas-de-alerta-de-inundacao/)  
* [Short Term Real-Time Rolling Forecast of Urban River Water Levels Based on LSTM: A Case Study in Fuzhou City, China](https://www.mdpi.com/1256042)  
* [Grupo RBS](https://www.gruporbs.com.br/conteudosdenegocios/198/as-7-tendencias-do-design-grafico-para-2026)

Fontes:

* [https://jc.uol.com.br/pernambuco/2023/05/15468725-desastre-das-chuvas-em-pernambuco-completa-um-ano-com-134-mortes-e-nenhuma-responsabilizacao.html](https://jc.uol.com.br/pernambuco/2023/05/15468725-desastre-das-chuvas-em-pernambuco-completa-um-ano-com-134-mortes-e-nenhuma-responsabilizacao.html)  
* [https://portaldeprefeitura.com.br/pernambuco/recife-areas-de-risco-ibge-cemaden-ranking-nacional/618243/](https://portaldeprefeitura.com.br/pernambuco/recife-areas-de-risco-ibge-cemaden-ranking-nacional/618243/)

Declaração de Uso de Inteligência Artificial:

A metodologia de execução do grupo foi otimizada através do **Claude (Anthropic)**, como auxiliar de pesquisa e revisão, que permitiu focar o esforço humano na análise crítica da pesquisa e na argumentação estratégica do projeto. O uso da IA para organização de informações, correção gramatical e pesquisa de materiais sobre monitoramento de alagamentos não apenas acelerou o cronograma, mas elevou o rigor da entrega ao garantir maior clareza na estruturação dos conteúdos e consistência na apresentação das análises.

[image1]: <data:image/png;base64,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>