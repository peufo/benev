import { getMembers, type MemberWithComputedValue } from '../getMembers'
import { prisma, permission } from '$lib/server'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)
	const cards = members.map(getVCard).join('\n')

	return new Response(cards, {
		headers: {
			'Content-type': 'text/vcard; charset=utf-8',
			'Content-Disposition': 'attachment; filename="members.vcf"',
		},
	})
}

function getVCard(member: MemberWithComputedValue): string {
	const rows = [
		'BEGIN:VCARD',
		'VERSION:4.0',
		`ORG:Benev.io;${member.event.name}`,
		`FN:${member.firstName} ${member.lastName}`,
		`EMAIL:${member.email}`,
	]
	if (member.phone) rows.push(`TEL:${member.phone}`)
	if (member.birthday) rows.push(`BDAY:${getBDAY(member.birthday)}`)
	if (member.zipCode && member.city && member.street)
		rows.push(`ADR:;;${member.street};${member.city};${member.zipCode};`)
	rows.push('END:VCARD\n')
	return rows.join('\n')
}

function getBDAY(date: Date): string {
	return [
		date.getFullYear().toString(),
		(date.getMonth() + 1).toString().padStart(2, '0'),
		date.getDate().toString().padStart(2, '0'),
	].join('')
}
