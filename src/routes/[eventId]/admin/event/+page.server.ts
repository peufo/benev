import { redirect } from '@sveltejs/kit'

// Les trois pages de réglages ont fusionné dans `/admin/settings`. Le 301 sert les signets et
// les liens externes déjà partis — notamment ceux de `EmailTierQuotaAlert`.
export const load = ({ params: { eventId } }) =>
	redirect(301, `/${eventId}/admin/settings#essentiel`)
