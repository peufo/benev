import { redirect } from '@sveltejs/kit'

export const load = async ({ url }) => {
	redirect(302, `${url.pathname}/members`);
}
