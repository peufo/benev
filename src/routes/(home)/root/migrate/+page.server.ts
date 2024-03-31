import { defaultEmailModels } from '$lib/email/models.js'
import { jsonParse } from '$lib/jsonParse.js'
import { prisma, tryOrFail } from '$lib/server'

export const actions = {
	generate_all_avatars: async () => {
		const users = await prisma.user.findMany()
		return tryOrFail(async () => {
			await Promise.all(
				users.map(({ id }) => {
					const avatarUrl = new URL('https://api.dicebear.com/7.x/thumbs/svg')
					avatarUrl.searchParams.append('seed', String(Math.random()))
					const avatarPlaceholder = avatarUrl.toString()
					return prisma.user.update({ where: { id }, data: { avatarPlaceholder } })
				})
			)
			return
		})
	},
	generate_emails_model: async () => {
		return tryOrFail(async () => {
			const events = await prisma.event.findMany({
				include: { pages: { where: { type: 'email' } } },
			})
			await Promise.all(
				events.map((event) => {
					const emails = defaultEmailModels.filter(
						(model) => !event.pages.find((p) => p.path === model.path)
					)
					return prisma.event.update({
						where: { id: event.id },
						data: { pages: { createMany: { data: emails } } },
					})
				})
			)
		})
	},
}
