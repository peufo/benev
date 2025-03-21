import type { Member, Period, Subscribe, Tag } from '@prisma/client'

export type PeriodWithSubscribesUserName = Period & {
	tags: Tag[]
	subscribes: (Subscribe & { member: Member & { user: { firstName: string; lastName: string } } })[]
}
