import { getDocSummaries } from '$lib/doc/engine/registry.server'
import { pageMetaTags } from '$lib/seo'

const DESCRIPTION =
	'Le guide de benevio pour les organisateur·ices : créer un évènement, ouvrir les inscriptions, ' +
	'comprendre les secteurs, les créneaux et les rôles.'

export const load = () => ({
	pages: getDocSummaries(),
	metaTags: pageMetaTags({ title: 'Documentation', description: DESCRIPTION }),
})
