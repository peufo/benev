import { pageMetaTags } from '#lib/seo/index.js'
import { legalDoc } from '#lib/layout/legal.js'

const doc = legalDoc('/sales-terms')

export const load = () => ({
	metaTags: pageMetaTags({ title: doc.label, description: doc.description }),
})
