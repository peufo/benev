import { getMembers } from '../getMembers'
import { prisma, permission } from '$lib/server'
import { type Template } from '@pdfme/common'
import { generate } from '@pdfme/generator'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true, teams: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)

	const pdf = await generate({
		template,
		inputs: [
			{ a: 'a1', b: 'b1', c: 'c1' },
			{ a: 'a2', b: 'b2', c: 'c2' },
		],
	})

	return new Response(pdf.buffer, {
		headers: {
			'Content-type': 'application/pdf',
			//'Content-Disposition': 'attachment; filename="members.csv"',
		},
	})
}

const template: Template = {
	basePdf: { width: 53.98, height: 85.6, padding: [0, 0, 0, 0] },
	schemas: [
		[
			{
				name: 'a',
				type: 'text',
				position: { x: 0, y: 0 },
				width: 10,
				height: 10,
			},
			{
				name: 'b',
				type: 'text',
				position: { x: 10, y: 10 },
				width: 10,
				height: 10,
			},
			{
				name: 'c',
				type: 'text',
				position: { x: 20, y: 20 },
				width: 10,
				height: 10,
			},
		],
	],
}
