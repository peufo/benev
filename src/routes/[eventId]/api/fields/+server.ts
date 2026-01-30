import type { Prisma } from '@prisma/client'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'
import type { FieldType } from '@prisma/client'

const fieldTypes = [
	'string',
	'textarea',
	'number',
	'boolean',
	'select',
	'multiselect',
] as const satisfies readonly FieldType[]

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const query = parseQuery(url, {
		search: z.string().optional(),
		type: z.enum(fieldTypes).optional(),
		take: z.coerce.number().default(5),
	})

	const where: Prisma.FieldWhereInput = { eventId }
	if (query.search) {
		where.name = { contains: query.search }
	}
	if (query.type) {
		where.type = query.type
	}

	const fields = await prisma.field.findMany({
		where,
		take: query.take,
	})

	return json(fields)
}
