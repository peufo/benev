import { tryOrFail } from 'fuma/server'
import { prisma } from '$lib/server'

export const actions = {
	replace_member_user_by_member: () =>
		tryOrFail(async () => {
			const pages = await prisma.page.findMany()
			let count = 0
			for (const page of pages) {
				const found = page.content.match(/member\.user\./g)
				const foundCount = found?.length || 0
				if (foundCount) {
					const content = page.content.replaceAll('member.user.', 'member.')
					await prisma.page.update({
						where: { id: page.id },
						data: { content },
					})
				}
				count += foundCount
			}

			return {
				count,
			}
		}),
}
