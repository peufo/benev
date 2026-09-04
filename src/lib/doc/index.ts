/**
 * Le moteur de documentation: ce qui rend une page, la découpe en chapitres et la navigue. Il
 * ignore tout de ce qu'il sert — le contenu s'atteint par `$lib/doc/content`.
 */
export { default as DocNav } from './engine/DocNav.svelte'
export * from './engine/types'
