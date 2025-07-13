import type { Member, Period, Subscribe, Tag } from '@prisma/client'

export type PeriodWithMembers = Period & {
	tags: Tag[]
	subscribes: (Subscribe & { member: Member })[]
}
