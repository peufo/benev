import { tryOrFail } from 'fuma/server'
import { parseFormData, prisma } from '$lib/server'
import { z } from '$lib/validation'
import { sendProspectEmails } from '../sendProspectEmails'

export const actions = {
	add_prospects: async ({ request }) => {
		return tryOrFail(async () => {
			const { data, err } = await parseFormData(request, {
				prospects: z.string(),
				sendEmail: z.boolean(),
			})
			if (err) return err

			const prospects = data.prospects
				.split('\n')
				.map((prospect) => {
					const [name, email, site] = prospect.split(/\t|    /)
					return { name, email, site }
				})
				.filter((p) => p.email)

			if (prospects.length) {
				await prisma.prospect.createMany({
					data: prospects,
				})

				if (data.sendEmail) {
					const newProspects = await prisma.prospect.findMany({
						where: { email: { in: prospects.map((p) => p.email) } },
					})
					await sendProspectEmails(newProspects)
				}
			}
		}, '/root/prospects')
	},
}
