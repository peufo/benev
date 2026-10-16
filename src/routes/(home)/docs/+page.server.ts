import { getDocSummaries } from '#lib/doc/engine/registry.server.js'
import { pageMetaTags } from '#lib/seo/index.js'

const DESCRIPTION =
	'Le guide de benevio : inscriptions, planning des créneaux, rappels, courriels personnalisés, ' +
	'badges, exports et présences de tes bénévoles.'

export const load = () => ({
	pages: getDocSummaries(),
	metaTags: pageMetaTags({ title: 'Documentation', description: DESCRIPTION }),
})
