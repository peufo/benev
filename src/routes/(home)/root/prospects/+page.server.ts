import { tryOrFail, parseFormData, parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma } from '$lib/server'
import { sendProspectEmails } from './sendProspectEmails.js'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		skip: z.number().default(0),
		take: z.number().default(100),
	})
	if (err) return err

	return {
		prospects: await prisma.prospect.findMany({
			skip: data.skip,
			take: data.take,
			orderBy: {
				lastContact: {
					nulls: 'first',
					sort: 'asc',
				},
			},
		}),
	}
}

export const actions = {
	send_email: async ({ request }) => {
		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { prospectId: z.string() })
			const prospect = await prisma.prospect.findUniqueOrThrow({ where: { id: data.prospectId } })
			return sendProspectEmails([prospect])
		})
	},
}
