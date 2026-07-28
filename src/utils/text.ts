export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function includesFolded(haystack: string, needle: string): boolean {
  return foldText(haystack).includes(foldText(needle));
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function truncate(value: string, length = 88): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
