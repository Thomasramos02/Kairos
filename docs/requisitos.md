# Requisitos do MVP

## 1. Escopo

Este documento define apenas requisitos funcionais e nao funcionais do MVP.

Ele nao descreve posicionamento de produto, design visual ou fluxo de prototipacao.
Detalhes de integracao, arquitetura e validacao operacional ficam em `docs/backend-mvp-florida.md` e `docs/arquitetura-backend.md`.

O MVP deve provar que Kairos e uma ferramenta de Timing Intelligence, nao uma base generica de empresas. Cada requisito deve favorecer acao, contexto e leitura de oportunidade.

Pergunta central do produto:

**Quando a solucao do usuario se torna relevante para esta empresa?**

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
- tipo de cliente desejado;
- servico vendido pelo usuario.

A interface deve tratar o servico vendido como uma pergunta central:

- What do you sell?

Essa resposta deve influenciar score, timing, sinais relevantes e sugestao de abordagem.

Servicos iniciais:

- website design/development;
- branding;
- SEO/local SEO;
- paid marketing;
- social media marketing;
- e-commerce services.

### RF03.1 - Cobertura confiavel por fonte

No MVP, o produto deve priorizar score confiavel por servico vendido. A cobertura geografica deve seguir a confiabilidade da fonte, principalmente disponibilidade de industry, data de registro, localizacao e estabilidade de coleta.

Connecticut deve ter status:

- active.

Rhode Island deve ter status:

- next.

Florida deve ter status:

- experimental.

Seattle, Oregon e Iowa devem ser tratados como experimentos separados:

- experimental.

Todos os outros estados devem ser tratados como:

- unavailable.

A expansao para outro estado so deve virar active apos validar industry fornecida ou altamente confiavel, volume de oportunidades, velocidade de coleta, estabilidade da fonte publica e custo operacional.

### RF04 - Listar empresas novas

O sistema deve listar empresas recem-registradas conforme os filtros do usuario.

A lista nao deve funcionar como uma base generica. Ela deve priorizar empresas acionaveis, com timing, sinais, fonte e recomendacao explicavel.
Paginação, ordenação por relevancia e filtros devem favorecer leitura rapida e consumo incremental no frontend.

Cada item deve exibir, no minimo:

- nome;
- data de registro;
- idade em dias;
- cidade;
- estado;
- segmento;
- fonte;
- principais sinais digitais encontrados;
- fase de timing;
- Timing Score.

### RF05 - Atualizar fase ao longo do tempo

O sistema deve recalcular a fase da empresa conforme ela envelhece.

### RF06 - Enviar alertas

O usuario deve receber alertas quando:

- novas empresas aparecerem no mercado alvo;
- uma empresa salva entrar na melhor janela;
- uma empresa mudar de fase.

Alertas devem ser enviados apenas quando houver mudanca relevante para acao. O sistema nao deve alertar toda coleta bruta sem fit minimo.

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

A sugestao deve considerar, no minimo:

- nome da empresa;
- servico vendido pelo usuario;
- sinal digital mais relevante;
- fase ou motivo de timing.

A sugestao nao deve prometer venda, conversao, resposta garantida ou contato perfeito.

### RF09 - Watchlist

O usuario deve poder salvar empresas para acompanhamento posterior.

A watchlist deve representar empresas que merecem monitoramento. Ela nao deve ter status manual de funil ou comportamento de CRM completo no MVP.

### RF10 - Historico de fases

O sistema deve registrar a evolucao das fases de cada empresa.

### RF11 - Descobrir sinais digitais

O sistema deve identificar sinais de necessidade digital em negocios recem-criados.

Sinais iniciais:

- site ausente;
- dominio registrado recentemente;
- site incompleto ou inconsistente;
- presenca local ausente ou incompleta;
- rede social ausente ou desalinhada;
- loja online recem-lancada;
- tecnologia de site detectada.

No MVP, os sinais devem ser descobertos usando fontes publicas, fontes gratuitas ou verificacoes proprias leves. O produto nao deve depender de provedores pagos de enriquecimento, bases premium ou APIs pagas para entregar esses sinais.

Cada sinal deve indicar:

- nome do sinal;
- fonte;
- confianca;
- impacto esperado para o servico vendido pelo usuario.

Sinais devem ajudar a entender relevancia, nao apenas enriquecer cadastro. Um sinal so deve ser exibido quando puder explicar por que ele importa para timing, fit ou acao recomendada.

### RF12 - Calcular score por servico vendido

O Timing Score deve considerar o servico vendido pelo usuario.

O mesmo negocio pode receber scores diferentes para website development, branding, SEO, paid marketing, social media marketing e e-commerce services.

O score deve representar quao favoravel parece ser o momento atual para abordagem. Ele nao deve representar probabilidade de compra.

## 3. Requisitos Nao Funcionais

### RNF01 - Simplicidade

O MVP deve ser entendido rapidamente.

### RNF02 - Clareza

O sistema deve explicar por que uma empresa recebeu aquela fase ou score.

As explicacoes devem responder:

- por que esta empresa apareceu;
- por que este momento importa;
- qual sinal sustenta a recomendacao;
- qual acao faz sentido agora.

### RNF03 - Confiabilidade

O sistema deve sempre mostrar a fonte dos dados e indicar quando a confianca for baixa.

### RNF04 - Escalabilidade gradual

O produto pode listar todos os estados, mas deve expandir a qualidade de cobertura gradualmente.

### RNF05 - Custo zero de dados no MVP

O MVP deve priorizar sinais que possam ser coletados sem custo direto de dados.

Fontes pagas, APIs premium e enriquecimento pago ficam fora do MVP, exceto se forem usados apenas em testes manuais sem dependencia do produto.

### RNF06 - Compliance

O produto nao deve incentivar disparo em massa, scraping agressivo ou uso como spam.

### RNF07 - Acessibilidade

As interfaces devem seguir boas praticas de acessibilidade desde o MVP.

### RNF08 - Velocidade e Confiabilidade

O sistema deve descobrir empresas novas com rapidez, mas sem esconder fonte, confianca ou limitacoes da cobertura.

O dashboard nao deve depender de coleta ao vivo. Ele deve consultar dados ja processados para parecer rapido e confiavel.

## 4. Regras De Negocio

### RN01 - Fases de timing

O sistema deve usar uma classificacao consistente para refletir a idade e a prontidao da empresa.

### RN02 - Score dependente do servico vendido

O Timing Score nao deve ser generico. Ele deve combinar idade do negocio, sinais digitais encontrados, confianca dos dados e relevancia para o servico vendido pelo usuario.

### RN03 - Confianca dos dados

Se a data de abertura ou a localizacao nao forem confiaveis, o score deve ser reduzido ou sinalizado.

### RN04 - Fase explicavel

Cada score, sinal ou fase exibida ao usuario deve poder ser explicada com regras simples.

### RN05 - Nao prometer conversao

O produto nao deve afirmar que uma empresa vai comprar. Ele apenas indica o quao favoravel parece ser o momento da abordagem.

### RN06 - Monitoramento seletivo

O Kairos nao deve monitorar tudo para sempre.

Regras:

- empresas sem fit devem consumir pouco ou nenhum monitoramento recorrente;
- empresas com fit medio podem ser verificadas com menor frequencia;
- empresas com fit alto, alertadas ou salvas devem ter prioridade;
- empresas antigas devem deixar de consumir processamento recorrente, salvo novo sinal relevante;
- empresas ignoradas ou arquivadas nao devem consumir processamento.

### RN07 - Retencao por valor

O sistema deve reter dados conforme valor operacional:

- dados brutos por pouco tempo;
- candidatas por tempo limitado;
- qualificadas enquanto houver oportunidade;
- salvas enquanto o usuario mantiver valor nelas.

### RN08 - Contato sem promessa de contato perfeito

O MVP deve entregar dados publicos, contexto e timing para iniciar uma prospeccao melhor.

O produto nao deve prometer e-mail, telefone ou contato direto perfeito de todos os donos.

## 5. Fora De Escopo No MVP

Nao faz parte do MVP:

- automacao de disparos;
- CRM completo;
- enriquecimento pesado de contatos;
- telefone ou e-mail perfeito para todos os negocios;
- monitoramento profundo de todas as empresas descobertas;
- regras de machine learning complexas;
- cobertura geografica ampla desde o primeiro dia.
