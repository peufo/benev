import { NOINDEX, pageMetaTags } from '#lib/seo/index.js'

export const load = () => ({
	metaTags: pageMetaTags({ title: 'Réinitialisation du mot de passe', ...NOINDEX }),
})
