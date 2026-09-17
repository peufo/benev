import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { mergeMetaTags, pageMetaTags, tiptapExcerpt } from '$lib/seo'

export const load = async ({ params, parent }) => {
	const { member, event, metaTags, userIsRoot } = await parent()
	const isAdmin = member?.roles.includes('admin') || userIsRoot

	// TODO: tryOr404
	// Un admin prévisualise ses brouillons par leur lien; pour tout autre lecteur, ils n'existent pas.
	const page = await prisma.page.findFirst({
		where: {
			eventId: params.eventId,
			path: params.pagePath,
			...(member ? {} : { type: { not: 'member' } }),
			...(!isAdmin && { state: 'published' }),
		},
	})
	if (!page) error(404)
	return {
		page,
		// Surcharge les metas de l'évènement, dont on conserve l'affiche et la carte sociale
		metaTags: mergeMetaTags(
			metaTags,
			pageMetaTags({
				title: `${page.title} — ${event.name}`,
				titleTemplate: '%s',
				description: page.description || tiptapExcerpt(page.content) || undefined,
			})
		),
	}
}
