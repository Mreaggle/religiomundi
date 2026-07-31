# Auditoria de continuidade temporal — 31/07/2026

## Problema reproduzido

O normalizador mantinha `startYear` indefinido para tradições orais vivas, o
que era correto, mas o modo Panorama só as exibia quando o ano selecionado era
2026. Assim, cultos africanos, indígenas americanos, oceânicos, siberianos e
asiáticos desapareciam dos séculos XIX e XX e reapareciam juntos no presente.

A auditoria encontrou 159 registros sem início convertível. Nenhuma tradição
africana oral usada como sentinela permanecia visível em 1900.

## Correção metodológica

Foram separados dois conceitos:

- `startYear`: formação ou atestação defensável, usado em Emergências;
- `visibilityStartYear`: limite conservador usado apenas no Panorama.

Tradições vivas sem data convertível recebem piso documental de 1800. Rótulos
explicitamente pré-coloniais recebem 1450; macroperíodos explícitos conservam
seu próprio limite. Esses anos não são origem, fundação, primeira atestação ou
prova de continuidade imutável. O texto original continua prevalecendo no
dossiê.

Também foi corrigida a confusão entre tradição histórica e revival moderno.
Guanche e Kush/Núbia deixaram o pacote genérico “históricas e vivas”; religiões
antigas nórdica, eslava, báltica, mexica e correntes históricas semelhantes não
são mais prolongadas artificialmente até 2026.

## Resultado verificável

- 133 registros usam piso documental de tradição viva;
- 20 usam limite amplo explicitamente sustentado pelo rótulo;
- nenhuma tradição ativa com início desconhecido aparece somente em 2026;
- o recorte africano possui 56 tradições visíveis tanto em 1900 quanto em
  2026, com transformações internas próprias de cada época;
- Yorùbá/Ifá, Akan, Vodun Fon-Ewe, Odinani, Dinka, San, tradição malgaxe, Mami
  Wata, Bwiti, Bori e Zar são sentinelas automatizadas para 1900.

## Base historiográfica

A documentação escrita disponível para muitas religiões africanas
pré-coloniais é desigual e frequentemente oitocentista; isso limita datas
precisas sem autorizar apagar práticas vivas do Panorama. A revisão usa o
capítulo da Cambridge sobre tradições africanas desde o século XIV e o estudo
de Toyin Falola sobre sobrevivência e transformação na África moderna.
UNESCO sustenta especificamente a transmissão preservada de Ifá entre
comunidades Yorùbá.

Fontes: `G12–G15` e `I03–I04` na biblioteca do atlas.
