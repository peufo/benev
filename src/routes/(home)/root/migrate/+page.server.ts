import { prisma, tryOrFail } from '$lib/server'
import { tiptap } from '$lib/pages'
import EditorJsHTML from 'editorjs-html'
import { jsonParse } from '$lib/jsonParse.js'

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
	editorjs_to_tiptap: async () => {
		const parser = EditorJsHTML()

		const pages = await prisma.page.findMany()

		pages.forEach(async ({ id, content, title }) => {
			try {
				const json = jsonParse<any>(content, { blocks: [] })
				const blocks = json !== null ? parser.parse(json) : []
				const html = blocks.join()

				const newContent = tiptap.toJSON(html)

				await prisma.page.update({
					where: { id },
					data: { content: newContent },
				})
			} catch (error) {
				console.error(error)
			}
		})

		return
	},
}
