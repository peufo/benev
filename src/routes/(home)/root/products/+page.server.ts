import z from 'zod'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import type { Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const { search, take, skip } = parseQuery(url, {
		search: z.string().default(''),
		take: z.coerce.number().default(20),
		skip: z.coerce.number().default(0),
	})

	const where: Prisma.ProductWhereInput = search
		? {
				OR: [
					{ name: { contains: search } },
					{ event: { name: { contains: search } } },
					{
						checkout: {
							user: {
								OR: [
									{ firstName: { contains: search } },
									{ lastName: { contains: search } },
									{ email: { contains: search } },
								],
							},
						},
					},
				],
			}
		: {}

	const [products, productsCount] = await Promise.all([
		prisma.product.findMany({
			take,
			skip,
			where,
			orderBy: { createdAt: 'desc' },
			include: {
				event: { select: { id: true, name: true } },
				checkout: { include: { user: true } },
			},
		}),
		prisma.product.count({ where }),
	])

	return { products, productsCount }
}
