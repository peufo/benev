import { tryOrFail } from 'fuma/server'
import { prisma } from '$lib/server'

export const actions = {
	use_background_media_id: () =>
		tryOrFail(async () => {
			const events = await prisma.event.findMany()
			let count = 0
			for (const event of events) {
				if (event.backgroundPoster && event.posterId && !event.backgroundImageId) {
					await prisma.event.update({
						where: { id: event.id },
						data: { backgroundImageId: event.posterId },
					})
					count++
				}
			}

			return {
				count,
			}
		}),
}
