import type { Component } from 'svelte'

/**
 * Les pages compilées, chargées à la demande: seule celle qu'on visite descend au navigateur.
 * Le glob est relatif à ce fichier, il est donc résolu à la compilation.
 */
const modules = import.meta.glob<{ default: Component }>('./**/*.svx')

export function loadDocComponent(slug: string) {
	return modules[`./${slug}.svx`]
}
