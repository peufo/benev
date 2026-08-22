import { redirect } from '@sveltejs/kit'

export const load = async ({ parent, url }) => {
	const { member, userIsRoot } = await parent()
	// Le tableau de bord est refusé aux responsables: eux arrivent sur la table des membres.
	const isAdmin = !!member?.roles.includes('admin') || !!userIsRoot
	redirect(302, `${url.pathname}/${isAdmin ? 'dashboard' : 'members'}`)
}
