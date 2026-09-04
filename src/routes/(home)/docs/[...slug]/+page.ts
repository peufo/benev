import { error } from '@sveltejs/kit'
import { loadDocComponent } from '$lib/doc/content'

export const load = async ({ params, data }) => {
	const importComponent = loadDocComponent(params.slug)
	if (!importComponent) error(404, "Cette page de documentation n'existe pas")

	// Les données du chargement serveur ne se propagent pas d'elles-mêmes quand un chargement
	// universel le suit: c'est ce retour-ci qui devient `data` dans la page.
	return { ...data, content: (await importComponent()).default }
}
