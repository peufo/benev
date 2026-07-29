import z from 'zod'

export const modelInvite = {
	// Un champ email vidé vaut « pas d'adresse », que Prisma stocke en `null`. `null` n'étant pas
	// un `RemoteFormInput`, la conversion se fait à la sortie du schéma et non à son entrée.
	email: z
		.union([z.string().email().toLowerCase(), z.literal('')])
		.optional()
		.transform((value) => (value === undefined ? undefined : value || null)),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
}
