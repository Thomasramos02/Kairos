# Requisitos do MVP

## 1. Escopo

Este documento define apenas requisitos funcionais e nao funcionais do MVP.

Ele nao descreve posicionamento de produto, design visual ou fluxo de prototipacao.

## 2. Requisitos Funcionais

### RF01 - Cadastro e login

O usuario deve conseguir criar conta e acessar o sistema.

Campos minimos:

- nome;
- e-mail;
- senha;
- empresa, opcional.

### RF02 - Gerenciar conta

O usuario deve conseguir editar dados basicos da conta e preferencias de alerta.

### RF03 - Definir mercado alvo

O usuario deve informar o mercado que deseja monitorar.

Campos:

- pais;
- estado;
- cidade ou regiao;
- segmento;
- tipo de cliente desejado.

### RF04 - Listar empresas novas

O sistema deve listar empresas recem-registradas conforme os filtros do usuario.

Cada item deve exibir, no minimo:

- nome;
- data de registro;
- idade em dias;
- cidade;
- estado;
- segmento;
- fonte;
- fase de timing;
- Timing Score.

### RF05 - Atualizar fase ao longo do tempo

O sistema deve recalcular a fase da empresa conforme ela envelhece.

### RF06 - Enviar alertas

O usuario deve receber alertas quando:

- novas empresas aparecerem no mercado alvo;
- uma empresa salva entrar na melhor janela;
- uma empresa mudar de fase.

Canais iniciais:

- e-mail;
- Telegram.

Canais futuros:

- webhook;
- Slack;
- Discord;
- CRM;
- API.

### RF07 - Exportar CSV

O usuario deve poder exportar a lista filtrada de empresas.

Campos minimos no CSV:

- company_name;
- registered_at;
- age_days;
- state;
- city;
- industry;
- timing_stage;
- timing_score;
- source.

### RF08 - Copiar abordagem contextual

O usuario deve poder copiar uma sugestao de abordagem gerada para a empresa.

A mensagem deve ser contextual e evitar linguagem generica ou com aparencia de spam.

### RF09 - Watchlist

O usuario deve poder salvar empresas para acompanhamento posterior.

### RF10 - Historico de fases

O sistema deve registrar a evolucao das fases de cada empresa.

## 3. Requisitos Nao Funcionais

### RNF01 - Simplicidade

O MVP deve ser entendido rapidamente.

### RNF02 - Clareza

O sistema deve explicar por que uma empresa recebeu aquela fase ou score.

### RNF03 - Confiabilidade

O sistema deve sempre mostrar a fonte dos dados e indicar quando a confianca for baixa.

### RNF04 - Escalabilidade gradual

O produto pode comecar com um estado ou nicho e expandir depois.

### RNF05 - Compliance

O produto nao deve incentivar disparo em massa, scraping agressivo ou uso como spam.

### RNF06 - Acessibilidade

As interfaces devem seguir boas praticas de acessibilidade desde o MVP.

### RNF07 - Velocidade e Confiabilidade
o sistema deve buscar o mais rapido empresas recem lançadas e listar mas mostrar a fonte dos dados e sempre garantir a confiança

## 4. Regras De Negocio

### RN01 - Fases de timing

O sistema deve usar uma classificacao consistente para refletir a idade e a prontidao da empresa.

### RN02 - Confianca dos dados

Se a data de abertura ou a localizacao nao forem confiaveis, o score deve ser reduzido ou sinalizado.

### RN03 - Fase explicavel

Cada score ou fase exibida ao usuario deve poder ser explicada com regras simples.

### RN04 - Nao prometer conversao

O produto nao deve afirmar que uma empresa vai comprar. Ele apenas indica o quao favoravel parece ser o momento da abordagem.

## 5. Fora De Escopo No MVP

Nao faz parte do MVP:

- automacao de disparos;
- CRM completo;
- enriquecimento pesado de contatos;
- regras de machine learning complexas;
- cobertura geografica ampla desde o primeiro dia.
