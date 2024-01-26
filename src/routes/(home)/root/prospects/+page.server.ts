import { parseFormData, parseQuery, prisma, tryOrFail } from '$lib/server'
import { z } from '$lib/validation'
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
		}),
	}
}

export const actions = {
	send_email: async ({ request }) => {
		return tryOrFail(async () => {
			const { err, data } = await parseFormData(request, { prospectId: z.string() })
			if (err) return err
			const prospect = await prisma.prospect.findUniqueOrThrow({ where: { id: data.prospectId } })
			return sendProspectEmails([prospect])
		})
	},
}
