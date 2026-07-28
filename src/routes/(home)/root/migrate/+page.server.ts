import { formAction } from 'fuma/server'
import { Prisma } from '@prisma/client'
import { permission, prisma } from '$lib/server'
import { isHttpUrl } from '$lib/url'

export const actions = {
	/**
	 * `address` / `addressLabel` -> `location`.
	 * Volontairement sans géocodage: Photon renvoie toujours un résultat, y compris
	 * faux (« Alle » -> Allen, USA), et un pin précis mais erroné est pire qu'une
	 * simple recherche textuelle. Les coordonnées viendront quand un admin
	 * ré-éditera son évènement via l'autocomplétion.
	 */
	event_address_to_location: formAction({}, async ({ locals }) => {
		await permission.root(locals)
		const events = await prisma.event.findMany({
			where: { location: { equals: Prisma.DbNull } },
			select: { id: true, address: true, addressLabel: true },
		})
		let count = 0
		for (const event of events) {
			// une URL de carte ne fait pas un nom de lieu lisible: on ne garde que du texte
			const address = event.address?.trim()
			const label = event.addressLabel?.trim() || (address && !isHttpUrl(address) ? address : '')
			if (!label) continue
			await prisma.event.update({
				where: { id: event.id },
				data: { location: { label } },
			})
			count++
		}
		return { count }
	}),

	update_members_avatarId: formAction({}, async ({ locals }) => {
		await permission.root(locals)
		const users = await prisma.user.findMany()
		let count = 0
		for (const user of users) {
			const res = await prisma.member.updateMany({
				where: { userId: user.id },
				data: { avatarId: user.avatarId },
			})
			count += res.count
		}
		return { count }
	}),
}
