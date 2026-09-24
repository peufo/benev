/**
 * Date d'effet des textes légaux, stockée sur l'utilisateur au moment de l'acceptation.
 * Un booléen seul ne dit pas *quelles* conditions ont été acceptées, ce qui est précisément
 * ce dont on a besoin le jour où elles changent.
 *
 * Seul de tout `$lib/constant`, ce module n'importe rien: les fixtures E2E le lisent depuis le
 * processus Playwright, où l'`index.ts` et ses icônes ne se chargent pas.
 */
export const TERMS_VERSION = '2026-08-20'
