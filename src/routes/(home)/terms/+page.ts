import { pageMetaTags } from '$lib/seo'

export const load = () => ({
	metaTags: pageMetaTags({
		title: 'Conditions générales',
		description: `Conditions générales d'utilisation de benevio : engagement, données personnelles et responsabilités.`,
	}),
})
