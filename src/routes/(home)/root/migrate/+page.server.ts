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
	profile_to_profileJSON: () =>
		tryOrFail(async () => {
			const members = await prisma.member.findMany({
				include: { user: true, profile: { include: { field: true } } },
			})
			for (const member of members) {
				const profileJson: PrismaJson.MemberProfile = {}
				member.profile.forEach(({ field, value }) => {
					profileJson[field.id] = jsonParse(value, undefined)
				})

				await prisma.member.update({
					where: { id: member.id },
					data: { profileJson },
				})

				console.log(`${member.user.firstName} profile updated !`)
			}
			return
		}),
}
