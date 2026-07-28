import {
  Baby,
  Biohazard,
  Blend,
  Bomb,
  BookOpen,
  Brain,
  CloudLightning,
  Coins,
  Compass,
  Crown,
  Earth,
  Flame,
  Flower2,
  Gift,
  Hammer,
  HandHeart,
  Heart,
  HeartPulse,
  Hourglass,
  Landmark,
  type LucideIcon,
  Megaphone,
  Moon,
  Mountain,
  Music2,
  Orbit,
  PawPrint,
  RefreshCw,
  Scale,
  Send,
  Shield,
  ShieldAlert,
  Shuffle,
  Skull,
  Sparkles,
  Sprout,
  Sun,
  Sunrise,
  Swords,
  UsersRound,
  Waves,
  Wheat,
  Wind,
  Wine,
  Wrench,
} from "lucide-react";

export interface ArchetypeVisual {
  icon: LucideIcon;
  iconLabel: string;
  color: string;
  colorFamily: string;
}

const FOUNDATION = { color: "#ddb76d", colorFamily: "fundamentos e ordem" };
const LIVING_WORLD = { color: "#79bc8a", colorFamily: "terra e mundo vivo" };
const COSMOS = { color: "#65b7ca", colorFamily: "astros e elementos" };
const BONDS = { color: "#dd8496", colorFamily: "vínculos e cuidado" };
const CIVIC = { color: "#df9568", colorFamily: "agência e vida coletiva" };
const THRESHOLDS = { color: "#9b89ca", colorFamily: "corpo e limiares" };
const RUPTURE = { color: "#cb7772", colorFamily: "tempo, ruptura e renovação" };
const INNER = { color: "#809fdd", colorFamily: "expressão e vida interior" };
const TRANSFORMATION = { color: "#bb88c3", colorFamily: "mediação e transformação" };

/**
 * Glifos e famílias cromáticas são recursos de navegação da interface.
 * Não representam símbolos religiosos autênticos nem categorias acadêmicas.
 */
export const ARCHETYPE_VISUALS: Record<string, ArchetypeVisual> = {
  A01: { icon: Sprout, iconLabel: "broto", ...FOUNDATION },
  A02: { icon: Hammer, iconLabel: "martelo criador", ...FOUNDATION },
  A03: { icon: Crown, iconLabel: "coroa", ...FOUNDATION },
  A04: { icon: Orbit, iconLabel: "órbita ordenada", ...FOUNDATION },
  A05: { icon: Flower2, iconLabel: "flor", ...LIVING_WORLD },
  A06: { icon: CloudLightning, iconLabel: "nuvem e relâmpago", ...COSMOS },
  A07: { icon: Sun, iconLabel: "sol", ...COSMOS },
  A08: { icon: Moon, iconLabel: "lua", ...COSMOS },
  A09: { icon: Sparkles, iconLabel: "estrelas", ...COSMOS },
  A10: { icon: Waves, iconLabel: "ondas", ...COSMOS },
  A11: { icon: Flame, iconLabel: "chama", ...COSMOS },
  A12: { icon: Wind, iconLabel: "vento", ...COSMOS },
  A13: { icon: Wheat, iconLabel: "trigo", ...LIVING_WORLD },
  A14: { icon: PawPrint, iconLabel: "pegada animal", ...LIVING_WORLD },
  A15: { icon: Heart, iconLabel: "coração", ...BONDS },
  A16: { icon: Baby, iconLabel: "nascimento", ...BONDS },
  A17: { icon: Swords, iconLabel: "espadas", ...CIVIC },
  A18: { icon: Landmark, iconLabel: "instituição", ...CIVIC },
  A19: { icon: BookOpen, iconLabel: "livro aberto", ...INNER },
  A20: { icon: Wrench, iconLabel: "ferramenta", ...CIVIC },
  A21: { icon: Send, iconLabel: "mensagem em trânsito", ...CIVIC },
  A22: { icon: Coins, iconLabel: "moedas", ...CIVIC },
  A23: { icon: HeartPulse, iconLabel: "pulso vital", ...THRESHOLDS },
  A24: { icon: Biohazard, iconLabel: "risco biológico", ...THRESHOLDS },
  A25: { icon: Skull, iconLabel: "crânio", ...THRESHOLDS },
  A26: { icon: UsersRound, iconLabel: "comunidade ancestral", ...THRESHOLDS },
  A27: { icon: Compass, iconLabel: "bússola", ...THRESHOLDS },
  A28: { icon: Scale, iconLabel: "balança", ...CIVIC },
  A29: { icon: Hourglass, iconLabel: "ampulheta", ...RUPTURE },
  A30: { icon: Bomb, iconLabel: "ruptura", ...RUPTURE },
  A31: { icon: ShieldAlert, iconLabel: "alerta", ...RUPTURE },
  A32: { icon: RefreshCw, iconLabel: "ciclo de renovação", ...RUPTURE },
  A33: { icon: Shield, iconLabel: "escudo", ...BONDS },
  A34: { icon: Music2, iconLabel: "nota musical", ...INNER },
  A35: { icon: Wine, iconLabel: "cálice", ...INNER },
  A36: { icon: Mountain, iconLabel: "montanha", ...INNER },
  A37: { icon: HandHeart, iconLabel: "mão e coração", ...BONDS },
  A38: { icon: Megaphone, iconLabel: "anúncio", ...INNER },
  A39: { icon: Brain, iconLabel: "consciência", ...INNER },
  A40: { icon: Blend, iconLabel: "formas complementares", ...INNER },
  A41: { icon: Sunrise, iconLabel: "horizonte iluminado", ...INNER },
  A42: { icon: Earth, iconLabel: "mundo", ...RUPTURE },
  A43: { icon: Gift, iconLabel: "oferenda", ...TRANSFORMATION },
  A44: { icon: Shuffle, iconLabel: "mudança de estado", ...TRANSFORMATION },
};

export function getArchetypeVisual(code: string): ArchetypeVisual {
  return ARCHETYPE_VISUALS[code] ?? ARCHETYPE_VISUALS.A01;
}
