import { Prisma, PrismaClient, type Member, type User } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async delete({ args: { where } }) {
				const event = await prisma.event.findUniqueOrThrow({ where })
				const deletedId = createId()
				const id = `deleted_${event.id}_${deletedId}`
				const name = `deleted_${event.name}_${deletedId}`
				await prisma.event.update({ where, data: { id, name, deletedAt: new Date() } })
				return true
			},
		},
		user: {
			async update({ args, query }) {
				const data: Prisma.MemberUpdateInput = {}
				function copy<K extends keyof User & keyof Member>(key: K) {
					if (args.data[key] !== undefined) data[key] = args.data[key]
				}
				copy('email')
				copy('isEmailVerified')
				copy('firstName')
				copy('lastName')
				copy('phone')
				copy('birthday')
				copy('street')
				copy('zipCode')
				copy('city')
				copy('avatarId')
				copy('avatarPlaceholder')
				await prisma.member.updateMany({ where: { user: args.where }, data })
				return query(args)
			},
			async delete({ args, query }) {
				const user = await prisma.user.findUniqueOrThrow(args)
				await prisma.member.updateMany({
					where: { userId: user.id },
					data: {
						email: null,
						isEmailVerified: false,
						phone: null,
						firstName: 'Deleted',
						lastName: 'User',
						birthday: null,
						street: null,
						zipCode: null,
						city: null,
						avatarId: null,
					},
				})
				return query(args)
			},
		},
	},
})
