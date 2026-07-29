export interface ReligiousPopulationGroup {
  id: string;
  name: string;
  share: number;
  populationLabel: string;
  isReligion: boolean;
  note: string;
}

export const RELIGIOUS_POPULATION_SOURCE = {
  title: "How the Global Religious Landscape Changed From 2010 to 2020",
  institution: "Pew Research Center",
  publishedYear: 2025,
  estimateYear: 2020,
  url: "https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/",
  methodology:
    "Estimativas globais baseadas em mais de 2.700 censos, pesquisas e registros, reunidas em sete categorias amplas.",
} as const;

export const RELIGIOUS_POPULATION_GROUPS: ReligiousPopulationGroup[] = [
  {
    id: "christians",
    name: "Cristãos",
    share: 28.8,
    populationLabel: "2,3 bilhões",
    isReligion: true,
    note: "Todas as denominações cristãs reunidas.",
  },
  {
    id: "muslims",
    name: "Muçulmanos",
    share: 25.6,
    populationLabel: "aprox. 2,0 bilhões",
    isReligion: true,
    note: "Todas as correntes islâmicas reunidas.",
  },
  {
    id: "unaffiliated",
    name: "Sem filiação religiosa",
    share: 24.2,
    populationLabel: "1,9 bilhão",
    isReligion: false,
    note: "Categoria demográfica; inclui ateus, agnósticos e pessoas sem religião.",
  },
  {
    id: "hindus",
    name: "Hindus",
    share: 14.9,
    populationLabel: "1,2 bilhão",
    isReligion: true,
    note: "Categoria religiosa agregada.",
  },
  {
    id: "buddhists",
    name: "Budistas",
    share: 4.1,
    populationLabel: "324 milhões",
    isReligion: true,
    note: "Todas as escolas budistas reunidas.",
  },
  {
    id: "other",
    name: "Outras religiões",
    share: 2.2,
    populationLabel: "aprox. 173 milhões",
    isReligion: true,
    note: "Agrega bahá’ís, daoistas, jainas, xintoístas, sikhs, religiões tradicionais e muitos grupos menores.",
  },
  {
    id: "jews",
    name: "Judeus",
    share: 0.2,
    populationLabel: "14,8 milhões",
    isReligion: true,
    note: "Categoria religiosa agregada; participação arredondada.",
  },
];
