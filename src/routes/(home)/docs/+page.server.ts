import { getDocNav, getDocs } from '$lib/doc/engine/registry.server'
import { pageMetaTags } from '$lib/seo'

const DESCRIPTION =
	'Le guide de benevio pour les organisateur·ices : créer un évènement, ouvrir les inscriptions, ' +
	'comprendre les secteurs, les périodes et les rôles.'

export const load = () => {
	const descriptions = new Map(getDocs().map((doc) => [doc.slug, doc.description]))
	return {
		groups: getDocNav().map(({ label, pages }) => ({
			label,
			pages: pages.map((docPage) => ({
				...docPage,
				description: descriptions.get(docPage.slug) ?? '',
			})),
		})),
		metaTags: pageMetaTags({ title: 'Documentation', description: DESCRIPTION }),
	}
}
