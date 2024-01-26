import { prisma } from '$lib/server'
import Jimp from 'jimp'

const image = new Jimp(1, 1, 'white')

export const GET = async ({ params }) => {
	const prospectId = params.prospectId.replace('.png', '')

	await prisma.prospect
		.update({ where: { id: prospectId }, data: { emailOpenAt: new Date() } })
		.catch(() => {})

	const buffer = await image.getBufferAsync('image/png')
	return new Response(buffer)
}
