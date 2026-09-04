/**
 * La documentation elle-même: les pages, l'ordre dans lequel elles se lisent, et les composants
 * qu'elles emploient. Rien ici ne connaît le moteur — la dépendance ne va que dans un sens.
 *
 * Les sources brutes ne sont pas de la partie: elles vivent dans `sources.server.ts`, que
 * SvelteKit interdit au navigateur.
 */
export { default as RolesGlossary } from './RolesGlossary.svelte'
export { default as WhoCanDoWhat } from './WhoCanDoWhat.svelte'
export * from './markdownParts'
export * from './pages'
export * from './tree'
