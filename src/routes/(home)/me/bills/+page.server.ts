import { getUserOrRedirect, prisma } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	return {
		checkouts: await prisma.checkout.findMany({
			where: { userId: user.id },
			include: { licences: true },
		}),
	}
}
