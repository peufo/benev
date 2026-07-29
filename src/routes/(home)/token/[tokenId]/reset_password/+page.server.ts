import { NOINDEX, pageMetaTags } from '$lib/seo'

export const load = () => ({
	metaTags: pageMetaTags({ title: 'Réinitialisation du mot de passe', ...NOINDEX }),
})
