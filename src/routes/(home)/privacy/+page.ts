import { pageMetaTags } from '$lib/seo'
import { legalDoc } from '$lib/layout/legal'

const doc = legalDoc('/privacy')

export const load = () => ({
	metaTags: pageMetaTags({ title: doc.label, description: doc.description }),
})
