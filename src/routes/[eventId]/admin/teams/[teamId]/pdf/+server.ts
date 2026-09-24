import PDFDocument from 'pdfkit'
import { error } from '@sveltejs/kit'
import { permission, prisma } from '$lib/server'
import { pdfStream } from '$lib/server/pdf'
import dayjs from '$lib/dayjs'
import { teamSheet, type TeamSheetPeriod } from '$lib/team/teamSheet'

const TEXT = '#1f2937'
const MUTED = '#6b7280'
// `border-soft` (18 % de `base-content`) et `secondary`, la couleur de la marque, que DESIGN.md
// réserve aux aplats et aux bordures pleines: c'est ce qu'est le filet d'un créneau.
const LINE = '#d7d9db'
const BAR = '#11b981'
const BAR_WIDTH = 2.5
const BAR_GAP = 10
const PHONE_WIDTH = 140
const ROW_HEIGHT = 20
const PENDING_WIDTH = 70
const DAY_HEIGHT = 22
const PERIOD_HEIGHT = 20
const PERIOD_GAP = 14
const DAY_GAP = 24

export const GET = async ({ locals, params: { eventId, teamId } }) => {
	// Même garde que la page du secteur: un responsable lit tous les secteurs. Un `+server.ts` ne
	// passe par aucun `load` de layout, celui de `/admin` n'a donc rien refusé.
	await permission.leaderOrRoot(eventId, locals)

	const member = { select: { firstName: true, lastName: true, phone: true } } as const
	const team = await prisma.team.findUnique({
		where: { id: teamId, eventId },
		select: {
			name: true,
			event: { select: { name: true, timezone: true } },
			leaders: member,
			periods: {
				orderBy: { start: 'asc' },
				select: {
					start: true,
					end: true,
					maxSubscribe: true,
					tags: { select: { name: true, color: true }, orderBy: { name: 'asc' } },
					subscribes: {
						where: { state: { in: ['accepted', 'request'] } },
						select: { state: true, member },
					},
				},
			},
		},
	})
	if (!team) error(404, 'not found')

	const sheet = teamSheet(team, team.event.timezone)
	const doc = new PDFDocument({
		size: 'A4',
		margin: 40,
		info: { Title: `${sheet.title} · ${team.event.name}`, Creator: 'benevio' },
	})
	const stream = pdfStream(doc)

	const left = doc.page.margins.left
	const width = doc.page.width - left - doc.page.margins.right
	const bottom = () => doc.page.height - doc.page.margins.bottom
	const right = left + width
	const inner = left + BAR_WIDTH + BAR_GAP
	const innerWidth = right - inner

	doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(team.event.name)
	doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text(sheet.title)
	doc.font('Helvetica').fontSize(10).fillColor(MUTED)
	if (sheet.range) doc.text(sheet.range)
	if (sheet.leaders.length) {
		const label = sheet.leaders.length > 1 ? 'Responsables' : 'Responsable'
		doc.text(`${label} : ${sheet.leaders.join(', ')}`)
	}
	doc.text(`Imprimé le ${dayjs().tz(team.event.timezone).format('DD.MM.YY à HH:mm')}`)
	doc.moveDown(1.5)

	if (!sheet.days.length) {
		doc.fillColor(MUTED).text('Aucun créneau')
	}

	for (const day of sheet.days) {
		// Un titre ne reste jamais seul en bas de page: celui du jour part avec son premier créneau,
		// celui d'un créneau avec ses deux premières lignes. Au-delà, la liste se coupe ligne à ligne.
		if (doc.y + DAY_HEIGHT + PERIOD_HEIGHT + 2 * ROW_HEIGHT > bottom()) doc.addPage()
		doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT).text(day.label, left, doc.y)
		doc.y += 8

		for (const period of day.periods) {
			if (doc.y + PERIOD_HEIGHT + 2 * ROW_HEIGHT > bottom()) doc.addPage()
			drawPeriod(period, day.label)
			doc.y += PERIOD_GAP
		}
		doc.y += DAY_GAP - PERIOD_GAP
	}

	doc.end()

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="secteur.pdf"; filename*=UTF-8''${encodeURIComponent(sheet.title)}.pdf`,
		},
	})

	/**
	 * Un créneau est un bloc, tenu par un filet vert à sa gauche: l'horaire, ses tags en pastilles
	 * comme dans `TagsList`, le compte à droite, puis ses inscrit·es.
	 */
	function drawPeriod(period: TeamSheetPeriod, dayLabel: string) {
		let blockTop = doc.y
		drawPeriodHeading(period)

		if (!period.rows.length) {
			doc.font('Helvetica').fontSize(10).fillColor(MUTED)
			doc.text('Aucune inscription', inner, doc.y + (ROW_HEIGHT - doc.currentLineHeight()) / 2)
			doc.y = blockTop + PERIOD_HEIGHT + ROW_HEIGHT
			drawBar(blockTop, doc.y)
			return
		}

		// Des lignes tracées à la main plutôt que `doc.table()`: pdfkit y rogne chaque cellule à la
		// hauteur de la police, et une capitale accentuée y perd son accent (« Emile »).
		doc.font('Helvetica').fontSize(10)
		for (const [index, row] of period.rows.entries()) {
			if (doc.y + ROW_HEIGHT > bottom()) {
				// Une liste coupée rappelle sur la page suivante à quel créneau elle appartient.
				drawBar(blockTop, doc.y)
				doc.addPage()
				blockTop = doc.y
				doc.fontSize(9).fillColor(MUTED).text(`${dayLabel}, ${period.label} (suite)`, inner)
				doc.fontSize(10)
				doc.y += 2
			} else if (index > 0) {
				// Le filet sépare deux lignes d'une même page: ni le bloc ni la page ne se ferment
				// sur un trait de plus.
				doc.moveTo(inner, doc.y).lineTo(right, doc.y).lineWidth(0.5).stroke(LINE)
			}
			const top = doc.y
			const textY = top + (ROW_HEIGHT - doc.currentLineHeight()) / 2
			// Un nom trop long se coupe sur une ligne; la mention « en attente » a sa propre place,
			// pour ne jamais partir avec lui.
			const nameWidth = innerWidth - PHONE_WIDTH - 16
			const line = { height: doc.currentLineHeight(), ellipsis: true }
			doc.fillColor(row.pending ? MUTED : TEXT)
			if (row.pending) {
				doc.text('en attente', inner, textY, { ...line, width: nameWidth, align: 'right' })
			}
			doc.text(row.name, inner, textY, {
				...line,
				width: row.pending ? nameWidth - PENDING_WIDTH : nameWidth,
			})
			if (row.phone) {
				doc.text(row.phone, right - PHONE_WIDTH, textY, { ...line, width: PHONE_WIDTH })
			}
			doc.y = top + ROW_HEIGHT
		}
		drawBar(blockTop, doc.y)
	}

	function drawBar(top: number, end: number) {
		doc.roundedRect(left, top, BAR_WIDTH, end - top, BAR_WIDTH / 2).fill(BAR)
	}

	function drawPeriodHeading(period: TeamSheetPeriod) {
		const y = doc.y + 2
		const countWidth = 50
		doc.font('Helvetica-Bold').fontSize(10.5).fillColor(TEXT)
		doc.text(period.label, inner, y, { lineBreak: false })
		doc.text(period.count, right - countWidth, y, { width: countWidth, align: 'right' })

		let x = inner + doc.widthOfString(period.label) + 8
		doc.font('Helvetica').fontSize(8)
		for (const tag of period.tags) {
			const tagWidth = doc.widthOfString(tag.name) + 8
			// Les pastilles qui ne tiennent plus sur la ligne sont remplacées par des points de
			// suspension plutôt que de chevaucher le compte.
			if (x + tagWidth > right - countWidth - 8) {
				doc.fillColor(MUTED).text('…', x, y + 1, { lineBreak: false })
				break
			}
			doc.save()
			doc
				.roundedRect(x, y - 1.5, tagWidth, 12, 3)
				.fillOpacity(0.19)
				.fill(tag.color)
			doc.restore()
			doc
				.roundedRect(x, y - 1.5, tagWidth, 12, 3)
				.lineWidth(0.75)
				.stroke(tag.color)
			doc.fillColor(TEXT).text(tag.name, x + 4, y + 1, { lineBreak: false })
			x += tagWidth + 4
		}
		doc.y = y - 2 + PERIOD_HEIGHT
	}
}
