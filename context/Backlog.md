### ![][image1]

### Backlog e Historia do Usuário

### 

### **Backlog de desenvolvimento e Historia do Usuário**

### **01 – Cadastro de usuário**

### **Como usuário:**

### Quero criar uma conta para poder reportar alagamentos

### Critérios de aceitação:

* ### Nome, email e senha obrigatórios

* ### Validação de email

* ### Senha mínima

### **02 – Login**

### **Como usuário:**

### Quero fazer login para acessar o sistema

### Critérios:

* ### Login com email e senha

* ### Mensagem de erro se inválido

### **03 – Logout**

### **Como usuário:**

### Quero fazer logout no sistema

### Critérios:

* ### Permitir que o usuário saia de sua conta

* ### Mensagem de erro se inválido

### **04 – Criar alerta de alagamento**

### **Como usuário:**

### Quero reportar um alagamento para alertar outras pessoas

### Critérios:

* ### Informar:

  * ### Localização (manual ou GPS simples)

  * ### Nível (baixo, médio, alto)

  * ### Descrição (opcional)

* ### Botão de Salvar no sistema

### **05 – Visualizar alertas**

### **Como usuário:**

### Quero ver alertas no mapa/lista para evitar áreas de risco

### Critérios:

* ### Lista de alertas recentes

* ### Exibir localização

* ### Ordenação por proximidade ou tempo

### **06 – Atualizar status do alerta**

### **Como usuário:**

### Quero informar se o alagamento continua ou não para manter os dados atualizados

### Critérios:

* ### Botão “Ainda está alagado”

* ### Botão “Já normalizou”

### **07 – Confirmar alerta (Crowdsourcing \- Validado pelo Avaliador Técnico)**

### **Como usuário:**

### Quero confirmar um alerta existente para aumentar a confiabilidade

### Critérios:

* ### Botão “Confirmar”

* ### Contador de confirmações

### **08 – Reportar alerta falso (Crowdsourcing \- Validado pelo Avaliador Técnico)**

### **Como usuário:**

### Quero sinalizar um alerta incorreto para evitar fake alerts

### Critérios:

* ### Botão de Reportar erro

* ### Contador de denúncias

### **09 – Receber alertas próximos**

### **Como usuário:**

### Quero receber notificações para saber de riscos perto de mim

### Critérios:

* ### Baseado em localização aproximada

* ### Pode ser via:

  * ### Notificação do Aplicativo

  * ### Via Email

  * ### SMS (Verificar APIs e discutir a possibilidade) 

### **10 – Mapa de risco**

### **Como usuário:**

### Quero visualizar um mapa com alertas para entender áreas críticas

### Critérios:

* ### Marcadores no mapa

* ### Diferenciar níveis (cores)

### **11 – Lista de áreas mais afetadas**

### **Como usuário:**

### Quero ver locais com mais alertas para identificar regiões perigosas

### Critérios:

* Mostrar ranking por quantidade de alertas  
* Período (últimas 24h, 7 dias)  
* Ordenação automática

### **Tecnologias:**

* ### **Frontend: React.js**

* ### **Backend: Java ou Python**

* ### **Banco: Um banco de dados relacional simples até que a escala realmente exija um NoSQL**

* ### **Deploy: Vercel**                 

### 

  ### 

  ### 

[image1]: <data:image/png;base64,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>