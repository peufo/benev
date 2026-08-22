import { parseQuery } from 'fuma/server'
import z from 'zod'
import { LogType } from '@prisma/client'
import { getLogs } from '$lib/server'

export const load = async ({ url }) => {
	const { take, type } = parseQuery(url, {
		take: z.coerce.number().default(30),
		type: z.enum(LogType).optional(),
	})

	return { ...(await getLogs(type ? { type } : {}, { take })), type }
}
