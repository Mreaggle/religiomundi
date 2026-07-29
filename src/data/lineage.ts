export type LineageRelationKind = "documented" | "hypothesis";

export interface LineageGroup {
  id: string;
  title: string;
  root: string;
  children: string[];
  sourceCodes: string[];
  note: string;
}

export interface LineageRelation {
  from: string;
  to: string;
  kind: LineageRelationKind;
  sourceCodes: string[];
  sourceUrls?: string[];
  note: string;
}

export const LINEAGE_GROUPS: LineageGroup[] = [
  {
    id: "jain",
    title: "Tradições jainas",
    root: "Jainismo (visão agregada)",
    children: ["Jainismo Digambara", "Jainismo Śvetāmbara", "Sthānakavāsī/Terāpanth jaina"],
    sourceCodes: ["A06"],
    note: "Ramos catalogais; a separação histórica foi gradual.",
  },
  {
    id: "theravada",
    title: "Mundos Theravāda",
    root: "Budismo antigo/Theravāda (perfil doutrinário)",
    children: [
      "Theravāda do Sri Lanka",
      "Budismo tailandês",
      "Budismo birmanês",
      "Budismo cambojano",
      "Budismo lao",
    ],
    sourceCodes: ["A07"],
    note: "Agrupamento por tradição escolar e desenvolvimento regional.",
  },
  {
    id: "mahayana",
    title: "Mundos Mahāyāna",
    root: "Budismo Mahāyāna (perfil agregado)",
    children: [
      "Budismo Chan/Zen",
      "Budismo Terra Pura",
      "Tiantai/Tendai",
      "Huayan/Kegon",
      "Budismo Nichiren",
      "Sōka Gakkai",
      "Risshō Kōsei Kai",
    ],
    sourceCodes: ["A07"],
    note: "O perfil agregado funciona como categoria comparativa, não como instituição ancestral.",
  },
  {
    id: "vajrayana",
    title: "Mundos Vajrayāna",
    root: "Budismo Vajrayāna tibetano (perfil agregado)",
    children: ["Nyingma", "Kagyu", "Sakya", "Gelug", "Jonang", "Budismo Newar", "Budismo Shingon"],
    sourceCodes: ["A08"],
    note: "Ramos escolares e regionais; não pressupõe uma única cadeia institucional.",
  },
  {
    id: "shinto",
    title: "Configurações xintoístas",
    root: "Xintoísmo (perfil agregado)",
    children: ["Xintoísmo de santuário", "Xintoísmo sectário"],
    sourceCodes: ["A11"],
    note: "Categorias institucionais modernas apoiadas em história religiosa anterior.",
  },
  {
    id: "rabbinic",
    title: "Judaísmos rabínicos modernos",
    root: "Judaísmo rabínico (perfil agregado)",
    children: [
      "Judaísmo Ortodoxo",
      "Judaísmo Conservador/Masorti",
      "Judaísmo Reformista/Progressista",
      "Judaísmo Reconstrucionista",
      "Judaísmo Humanista",
      "Cabala judaica",
      "Hassidismo",
    ],
    sourceCodes: ["B01"],
    note: "Relações de tradição, reforma, reação e desenvolvimento interno não são uma genealogia linear.",
  },
  {
    id: "christian",
    title: "Cristianismos históricos e modernos",
    root: "Cristianismo niceno (perfil agregado)",
    children: [
      "Igreja Católica",
      "Ortodoxia Oriental",
      "Igrejas Ortodoxas Orientais",
      "Igreja Assíria do Oriente",
      "Anglicanismo",
      "Luteranismo",
      "Tradições Reformadas/Presbiterianas",
      "Batistas",
      "Igrejas Menonitas/Anabatistas",
      "Quakers/Sociedade dos Amigos",
      "Metodismo/Wesleyanismo",
      "Adventismo do Sétimo Dia",
      "Pentecostalismo",
      "Movimento Carismático",
    ],
    sourceCodes: ["B02"],
    note: "Tronco catalogal amplo; cismas, reformas e formações independentes exigem leitura individual.",
  },
  {
    id: "sunni",
    title: "Escolas jurídicas sunitas",
    root: "Islamismo sunita (perfil agregado)",
    children: ["Sunismo Hanafi", "Sunismo Maliki", "Sunismo Shafi'i", "Sunismo Hanbali"],
    sourceCodes: ["B03"],
    note: "Escolas jurídicas dentro do campo sunita, não religiões ancestrais sucessivas.",
  },
  {
    id: "sufi",
    title: "Ordens e caminhos sufis",
    root: "Sufismo/Taṣawwuf (perfil agregado)",
    children: [
      "Qadiriyya",
      "Naqshbandiyya",
      "Chishtiyya",
      "Mevleviyya",
      "Tijaniyya",
      "Bektashiyya",
    ],
    sourceCodes: ["B03"],
    note: "O perfil agregado reúne tradições e ordens com cadeias próprias.",
  },
  {
    id: "new-thought",
    title: "Novo Pensamento",
    root: "Novo Pensamento",
    children: ["Unity/New Thought", "Religious Science/Science of Mind", "Divine Science"],
    sourceCodes: ["C06"],
    note: "Família histórica de movimentos modernos relacionados.",
  },
  {
    id: "wicca",
    title: "Wicca moderna",
    root: "Wicca (perfil agregado)",
    children: ["Wicca Gardneriana", "Wicca Alexandrina", "Wicca Diânica", "Wicca eclética"],
    sourceCodes: ["E03", "C06"],
    note: "O nó agregado é uma categoria; linhagens iniciáticas específicas não são intercambiáveis.",
  },
  {
    id: "golden-dawn-lineages",
    title: "Ocultismo cerimonial moderno",
    root: "Hermetic Order of the Golden Dawn",
    children: ["A∴A∴ e linhagens thelêmicas"],
    sourceCodes: ["E01", "C04"],
    note: "Influência histórica documentável, sem continuidade institucional simples.",
  },
  {
    id: "babi-bahai",
    title: "Movimentos bábí e bahá’í",
    root: "Babismo",
    children: ["Fé Bahá'í"],
    sourceCodes: ["B05"],
    note: "Formação bahá’í historicamente ligada ao movimento bábí.",
  },
];

export const LINEAGE_RELATIONS: LineageRelation[] = [
  {
    from: "Budismo Nichiren",
    to: "Sōka Gakkai",
    kind: "documented",
    sourceCodes: ["A07", "C06"],
    note: "Movimento moderno enraizado em tradição Nichiren.",
  },
  {
    from: "Wicca Gardneriana",
    to: "Wicca Alexandrina",
    kind: "documented",
    sourceCodes: ["E03", "C06"],
    note: "Linhagem moderna historicamente relacionada, sem identidade doutrinal completa.",
  },
  {
    from: "Hermetic Order of the Golden Dawn",
    to: "A∴A∴ e linhagens thelêmicas",
    kind: "documented",
    sourceCodes: ["E01", "C04"],
    note: "Influência histórica documentável; não continuidade institucional simples.",
  },
  {
    from: "Metodismo/Wesleyanismo",
    to: "Pentecostalismo",
    kind: "documented",
    sourceCodes: ["B02", "C06"],
    note: "Uma entre múltiplas matrizes do movimento de santidade e do pentecostalismo.",
  },
  {
    from: "Pentecostalismo",
    to: "Movimento Carismático",
    kind: "documented",
    sourceCodes: ["B02", "C06"],
    note: "Circulação de práticas carismáticas em igrejas já existentes; não descendência exclusiva.",
  },
  {
    from: "Babismo",
    to: "Fé Bahá'í",
    kind: "documented",
    sourceCodes: ["B05"],
    note: "Formação bahá’í historicamente ligada ao movimento bábí.",
  },
  {
    from: "Religião suméria",
    to: "Judaísmo bíblico/Israel antigo",
    kind: "hypothesis",
    sourceCodes: ["A01", "B01"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-the-hebrew-bibleold-testament/ancient-near-eastern-context/1FC1D4297FFE78377FAD0BA790302CAE",
    ],
    note: "Paralelos literários mesopotâmicos são documentados, mas empréstimo direto da religião suméria ao judaísmo não está demonstrado; a transmissão pode ter sido indireta e multietápica.",
  },
  {
    from: "Zoroastrismo/Mazdeísmo",
    to: "Judaísmo bíblico/Israel antigo",
    kind: "hypothesis",
    sourceCodes: ["A03", "B01"],
    sourceUrls: ["https://www.iranicaonline.org/articles/eschatology-i/"],
    note: "A influência iraniana sobre desenvolvimentos escatológicos do judaísmo do Segundo Templo é uma tese acadêmica relevante, mas sua extensão, direção e cronologia permanecem debatidas.",
  },
  {
    from: "Religião nórdica antiga",
    to: "Heathenry/Ásatrú",
    kind: "hypothesis",
    sourceCodes: ["A10", "E03"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-new-religious-movements/neopaganism/A42AADD375DA9BF3448CB957E688F801",
    ],
    note: "Reconstrução e inspiração modernas declaradas; não há continuidade institucional ininterrupta demonstrada.",
  },
  {
    from: "Religiões bálticas históricas",
    to: "Romuva",
    kind: "hypothesis",
    sourceCodes: ["A10", "E03"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-new-religious-movements/neopaganism/A42AADD375DA9BF3448CB957E688F801",
    ],
    note: "Reconstrução moderna de referências bálticas; proximidade reivindicada não equivale a uma linhagem institucional contínua.",
  },
  {
    from: "Religião eslava pré-cristã",
    to: "Rodnovery",
    kind: "hypothesis",
    sourceCodes: ["A10", "E03"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-new-religious-movements/neopaganism/A42AADD375DA9BF3448CB957E688F801",
    ],
    note: "Reconstrução moderna baseada em fontes fragmentárias, folclore e reinterpretação; não descendência institucional comprovada.",
  },
  {
    from: "Religião egípcia antiga",
    to: "Kemetismo moderno",
    kind: "hypothesis",
    sourceCodes: ["A02", "E03"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-new-religious-movements/neopaganism/A42AADD375DA9BF3448CB957E688F801",
    ],
    note: "Revival moderno inspirado em repertórios egípcios antigos; a aresta não afirma transmissão institucional contínua.",
  },
  {
    from: "Religião grega arcaica e clássica",
    to: "Helenismo reconstrucionista",
    kind: "hypothesis",
    sourceCodes: ["A09", "E03"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/abs/cambridge-companion-to-new-religious-movements/neopaganism/A42AADD375DA9BF3448CB957E688F801",
    ],
    note: "Reconstrução religiosa moderna inspirada em fontes gregas antigas; sem cadeia institucional ininterrupta demonstrada.",
  },
];
