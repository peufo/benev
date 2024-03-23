import { prisma } from '$lib/server'
import sharp from 'sharp'

export const GET = async ({ params }) => {
	const prospectId = params.prospectId.replace('.png', '')

	await prisma.prospect
		.update({ where: { id: prospectId }, data: { emailOpenAt: new Date() } })
		.catch(() => {})

	const buffer = await sharp({
		create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 255, b: 255 } },
	}).toBuffer()
	return new Response(buffer)
}
