import { pageMetaTags } from '$lib/seo'
import { legalDoc } from '$lib/layout/legal'

const doc = legalDoc('/legal-notice')

export const load = () => ({
	metaTags: pageMetaTags({ title: doc.label, description: doc.description }),
})
