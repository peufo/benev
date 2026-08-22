import { redirect } from '@sveltejs/kit'

export const load = ({ url }) => {
	redirect(302, `${url.pathname}/dashboard`)
}
