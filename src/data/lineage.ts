export type LineageRelationKind = "documented" | "syncretism" | "hypothesis";

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
    from: "Religião suméria",
    to: "Religião acádia",
    kind: "syncretism",
    sourceCodes: ["A01", "A02"],
    sourceUrls: [
      "https://oracc.museum.upenn.edu/amgg/technicalterms/index.html",
      "https://www.metmuseum.org/essays/mesopotamian-deities",
    ],
    note: "A tradição acádia incorporou e traduziu repertórios sumérios; identificações como Nanna/Sîn e Utu/Šamaš documentam fusões de deidades. Isso não reduz os dois sistemas a uma religião idêntica.",
  },
  {
    from: "Religião acádia",
    to: "Religião babilônica",
    kind: "syncretism",
    sourceCodes: ["A01", "A02"],
    sourceUrls: ["https://www.metmuseum.org/essays/mesopotamian-deities"],
    note: "A cultura religiosa babilônica preservou, reorganizou e fundiu repertórios sumério-acadianos; a ascensão de Marduk também acompanhou mudanças políticas na hierarquia do panteão.",
  },
  {
    from: "Religião acádia",
    to: "Religião assíria",
    kind: "documented",
    sourceCodes: ["A01", "A02"],
    sourceUrls: ["https://www.metmuseum.org/essays/mesopotamian-deities"],
    note: "A Assíria participou da tradição cuneiforme e religiosa mesopotâmica em língua acádia, com desenvolvimento regional próprio e sem descendência exclusiva ou linear.",
  },
  {
    from: "Religião minoica",
    to: "Religião micênica",
    kind: "syncretism",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/local-horizon-of-ancient-greek-religion/mycenaean-greek-worship-in-minoan-territory/25D4CDDD1405C82856C72156C5E33A34",
    ],
    note: "Registros de Creta indicam apropriação e reformulação micênica de deidades e repertórios minoicos; a mistura foi criativa, não simples substituição.",
  },
  {
    from: "Religião micênica",
    to: "Religião grega arcaica e clássica",
    kind: "hypothesis",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/local-horizon-of-ancient-greek-religion/mycenaean-greek-worship-in-minoan-territory/25D4CDDD1405C82856C72156C5E33A34",
    ],
    note: "Nomes de deidades posteriores aparecem em Linear B, mas a ruptura documental após o colapso palacial impede tratar toda a religião grega histórica como continuação institucional direta.",
  },
  {
    from: "Religião cananeia/ugarítica",
    to: "Religião fenícia",
    kind: "documented",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/handbook-of-ancient-religions/religion-in-ancient-ugarit/D748DF7F68F44FDE8B34BAED0A2DB597",
    ],
    note: "Há continuidade regional e vínculos documentáveis entre repertórios religiosos do Levante da Idade do Bronze e culturas levantinas posteriores; as variações locais permanecem essenciais.",
  },
  {
    from: "Religião fenícia",
    to: "Religião púnica/cartaginesa",
    kind: "documented",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/cambridge-history-of-religions-in-the-ancient-world/phoenicianpunic-religion/169A23713267F19F8ED4DBF8015CA3D7",
    ],
    note: "A religião púnica desenvolveu-se nas comunidades fenícias do Mediterrâneo ocidental; práticas locais divergiram, mas a separação não constitui uma origem religiosa independente.",
  },
  {
    from: "Religião cananeia/ugarítica",
    to: "Judaísmo bíblico/Israel antigo",
    kind: "hypothesis",
    sourceCodes: ["A04", "B01"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/handbook-of-ancient-religions/religion-in-ancient-ugarit/D748DF7F68F44FDE8B34BAED0A2DB597",
    ],
    note: "Textos ugaríticos exibem afinidades e conexões relevantes com tradições israelitas posteriores. A aresta marca continuidade cultural debatida, não uma filiação simples entre religiões completas.",
  },
  {
    from: "Religião babilônica",
    to: "Judaísmo bíblico/Israel antigo",
    kind: "hypothesis",
    sourceCodes: ["A02", "B01"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/cambridge-companion-to-the-hebrew-bibleold-testament/ancient-near-eastern-context/1FC1D4297FFE78377FAD0BA790302CAE",
    ],
    note: "Paralelos e contatos mesopotâmicos são documentados, especialmente no contexto do exílio, mas a extensão e a direção de cada empréstimo literário ou religioso exigem análise caso a caso.",
  },
  {
    from: "Religião egípcia antiga",
    to: "Religiões helenísticas",
    kind: "syncretism",
    sourceCodes: ["A03", "A04"],
    sourceUrls: [
      "https://www.metmuseum.org/essays/egypt-in-the-ptolemaic-period",
      "https://www.metmuseum.org/essays/mystery-cults-in-the-greek-and-roman-world",
    ],
    note: "No Egito ptolomaico, cultos como o de Serápis combinaram elementos egípcios e formas helenísticas; Ísis preservou identidade egípcia mesmo em circulação mediterrânea.",
  },
  {
    from: "Religião grega arcaica e clássica",
    to: "Religiões helenísticas",
    kind: "syncretism",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/cambridge-companion-to-the-hellenistic-world/greek-religion-continuity-and-change-in-the-hellenistic-period/C3CED48A1EE35E0ED11A1E77FA113F85",
    ],
    note: "As religiões helenísticas conservaram cultos gregos e os transformaram em ambientes multiculturais; não existiu uma única religião helenística uniforme.",
  },
  {
    from: "Religião grega arcaica e clássica",
    to: "Religião etrusca",
    kind: "syncretism",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/handbook-of-religions-in-ancient-europe/etruscan-religion/8C098B5D7E32A7E55C5FB212056A4941",
    ],
    note: "Contato intenso com colonos e comerciantes gregos contribuiu para tradições etruscas híbridas; isso ocorreu junto a componentes locais e levantinos.",
  },
  {
    from: "Religião grega arcaica e clássica",
    to: "Religião romana",
    kind: "syncretism",
    sourceCodes: ["A04"],
    sourceUrls: ["https://www.britishmuseum.org/blog/gods-and-goddesses-greek-and-roman-pantheon"],
    note: "Roma incorporou narrativas, iconografias e identificações gregas, mas deidades e ritos romanos conservaram funções cívicas e histórias próprias.",
  },
  {
    from: "Religião etrusca",
    to: "Religião romana",
    kind: "syncretism",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/religion-in-republican-italy/etruscan-religion-at-the-watershed-before-and-after-the-fourth-century-bce/8F029586E7B54B9797343E6EA0EC11BD",
    ],
    note: "Fontes romanas e evidência ritual registram incorporação de saberes etruscos, como haruspícia, augúrio e ritos de fundação; a transformação foi histórica e não uma sucessão total.",
  },
  {
    from: "Religião védica",
    to: "Budismo antigo/Theravāda (perfil doutrinário)",
    kind: "hypothesis",
    sourceCodes: ["A06", "A07"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/selfless-persons/origins-of-rebirth/EC735BBC9ED72C9C500A83E50BB77CB4",
    ],
    note: "O budismo formou-se no campo religioso indiano que também continha pensamento e prática bramânicos. A aresta marca interlocução e categorias compartilhadas, não descendência védica direta.",
  },
  {
    from: "Religião Shang-Zhou",
    to: "Confucionismo",
    kind: "documented",
    sourceCodes: ["A09"],
    sourceUrls: [
      "https://www.cambridge.org/core/books/daily-life-in-ancient-china/stage/4A0598754FF653AA90FDBE1B929FF6F8",
    ],
    note: "Confúcio reelaborou princípios e práticas do sistema ritual Zhou, transformando cerimônia cortesã em disciplina ética e política; a relação não faz do confucionismo mera sobrevivência da religião estatal.",
  },
  {
    from: "Religião fenícia",
    to: "Religião grega arcaica e clássica",
    kind: "hypothesis",
    sourceCodes: ["A04"],
    sourceUrls: [
      "https://www.cambridge.org/core/journals/iraq/article/abs/mesopotamian-bronzes-from-greek-sites-the-workshops-of-origin1/A8C92758873B7F4B3836EB767776D3D7",
    ],
    note: "Contatos e bens orientais chegaram ao Egeu, muitas vezes por portos fenícios. A influência sobre repertórios gregos é plausível e estudada, mas não demonstra filiação religiosa direta.",
  },
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
