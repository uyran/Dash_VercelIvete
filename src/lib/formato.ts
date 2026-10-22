/** Formata números no padrão brasileiro: 63033 -> "63.033". */
export const inteiro = (n: number): string => n.toLocaleString("pt-BR");
