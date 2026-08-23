import { form, getRequestEvent } from '$app/server'
import { invalid, redirect } from '@sveltejs/kit'
import { modelPageUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'
import { resolve } from '$app/paths'
import { normalizePath } from '$lib/normalizePath.js'

const RESERVED_PATHS = [
	'admin',
	'me',
	'register',
	'teams',
	'subscribes',
	'help',
	'api',
	'invite',
	'members',
]

export const updatePage = form(modelPageUpdate, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	const path = normalizePath(data.title)
	if (RESERVED_PATHS.includes(path))
		invalid(`Les noms suivant sont réservés: ${RESERVED_PATHS.join(', ')}`)

	const samePageTitle = await prisma.page.findFirst({
		where: { id: { not: data.id }, eventId, path },
	})
	if (samePageTitle) invalid('Ce titre est déjà utilisé')

	if (data.type === 'charter') {
		const charterAlreadyExist = await prisma.page.findFirst({
			where: { id: { not: data.id }, eventId, type: 'charter' },
		})
		if (charterAlreadyExist) invalid('Il existe déjà une charte des bénévoles')
	}

	return prisma.page.update({ where: { id: data.id }, data })
})

export const deletePage = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	await prisma.page.delete({
		where: { id: params.pageId!, eventId, type: { notIn: ['home', 'email'] } },
	})
	// La page courante n'existe plus: `load` renverrait de toute façon vers la page d'accueil.
	redirect(303, resolve('/[eventId]/admin/pages', { eventId }))
})
