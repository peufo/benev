import { getUserIdOrRedirect, prisma } from '$lib/server'
import { NOINDEX, pageMetaTags } from '$lib/seo'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)
	return {
		messages: await prisma.message.findMany({ where: { authorId: userId } }),
		metaTags: pageMetaTags({ title: 'Contact', ...NOINDEX }),
	}
}
