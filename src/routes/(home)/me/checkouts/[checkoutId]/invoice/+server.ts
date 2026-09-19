import { error, redirect } from '@sveltejs/kit'
import { checkout, getUserOrRedirect, prisma } from '$lib/server'

/** Renvoie vers le document Stripe de l'achat, facture ou reçu selon ce qui existe. */
export const GET = async ({ url, locals, params }) => {
	const user = await getUserOrRedirect(url, locals)
	const owned = await prisma.checkout.findFirst({
		where: { id: params.checkoutId, userId: user.id },
		select: { id: true },
	})
	if (!owned) error(404, 'Achat introuvable')

	const invoiceUrl = await checkout.getInvoiceUrl(owned.id).catch(() => null)
	if (!invoiceUrl) error(404, 'Aucune facture pour cet achat')
	redirect(302, invoiceUrl)
}
