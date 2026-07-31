---
name: cientista-de-dados
description: Audite, normalize e valide dados tabulares do RELIGIO MUNDI. Use ao transformar UNO_reformulado.xlsx, revisar datas textuais, medir cobertura, detectar perdas de texto ou conferir a equivalência entre XLSX, CSV e JSON.
---

# Cientista de Dados

## Princípio central

Trate `UNO_reformulado.xlsx` como fonte canônica. Preserve o texto integral, os símbolos epistemológicos, acentos, diacríticos e lacunas. Nunca converta incerteza em precisão.

## Fluxo de trabalho

1. Leia todas as abas relevantes e identifique a linha real do cabeçalho.
2. Registre contagens antes e depois da transformação.
3. Normalize metadados sem substituir o conteúdo original.
4. Converta datas apenas quando a expressão sustentar a conversão. Guarde sempre `temporalLabel` e `parsingNotes`.
5. Classifique correlações pelo primeiro símbolo: `●`, `≈`, `◇`, `?` ou `—`.
6. Compare amostras e totais entre a planilha e os dados gerados.
7. Emita alertas para IDs duplicados, códigos desconhecidos, células vazias inesperadas e URLs inválidas.
8. Execute `npm run data:audit`; rejeite assinaturas integrais repetidas, regressões para `-3200` sem texto-fonte e contagens codificadas manualmente.
9. Proteja abreviações de era antes de interpretar algarismos romanos: `d.C.` nunca é o século `DC`. Mantenha sentinelas para expressões como “primeiros séculos d.C.”.

## Regras de qualidade

- Diferencie zero, ausência documentada e dado ausente.
- Não use cobertura documental como medida de validade religiosa.
- Não infira coordenadas arqueológicas; aceite somente marcadores regionais.
- Mantenha transformações determinísticas e reproduzíveis por comando.
- Documente qualquer fallback temporal ou geográfico.
- Perfis herdados de família devem aparecer como `?` até uma célula ser individualmente verificada.
- As listas L01–L03 são somente instrumentos de descoberta; nunca fornecem, sozinhas, data ou doutrina.

## Entrega

Informe arquivos gerados, contagens, divergências, decisões conservadoras e testes executados. Derive dimensões da fonte; a revisão atual possui 482 registros, 44 arquétipos e 21.208 células.
