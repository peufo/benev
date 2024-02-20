import type { FieldType } from '@prisma/client'

const fieldFilterByType: Record<
	FieldType,
	(query: string) => Prisma.JsonNullableFilter<'Member'> | null
> = {
	string: (query) => ({ string_contains: query }),
	textarea: (query) => ({ string_contains: query }),
	select: (query) => ({ equals: query }),
	boolean: (query) => {
		const parsed = z.filter.boolean.safeParse(query)
		if (!parsed.success || parsed.data === undefined) return null
		return { equals: parsed.data }
	},
	number: (query) => {
		const parsed = z.filter.number.safeParse(query)
		if (!parsed.success) return null
		const filter: Prisma.JsonNullableFilter<'Member'> = {}
		if (parsed.data?.min) filter.gte = parsed.data?.min
		if (parsed.data?.max) filter.lte = parsed.data?.max
		return filter
	},
	multiselect: (query) => {
		const parsed = z.filter.multiselect.safeParse(query)
		if (!parsed.success || !parsed.data) return null
		return { array_contains: parsed.data }
	},
}

for (const [key, value] of url.searchParams.entries()) {
	if (!key.startsWith('field_')) continue
	const fieldId = key.replace('field_', '')
	const field = await prisma.field.findUniqueOrThrow({ where: { id: fieldId, eventId } })
	const fieldFilter = fieldFilterByType[field.type](value)
	if (fieldFilter)
		filters.push({
			profileJson: {
				path: `$.${fieldId}`,
				...fieldFilter,
			},
		})
}
