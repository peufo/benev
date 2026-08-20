import { prisma } from '$lib/server'
import { pageMetaTags } from '$lib/seo'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	return {
		// Le formulaire est ouvert à tous: seule la liste des demandes passées suppose un compte.
		messages: session
			? await prisma.message.findMany({ where: { authorId: session.user.userId } })
			: [],
		metaTags: pageMetaTags({
			title: 'Contact',
			description: `Une question sur benevio, ou une demande concernant tes données personnelles ? Écris-nous, avec ou sans compte.`,
		}),
	}
}
