import { getMembers } from '../../getMembers'
import { prisma, permission } from '$lib/server'
import type { Event, Member } from '@prisma/client'
import path from 'node:path'
import { env } from '$env/dynamic/private'
import sharp from 'sharp'
import logoBenev from '$lib/assets/logo.svg?raw'
import z from 'zod'
import PDFDocument from 'pdfkit'
// import fontLight from '$lib/assets/Helvetica-Light.ttf'
// const fontLightPath = path.resolve(`.${fontLight}`)

const formater = new Intl.DateTimeFormat('fr-ch', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	timeZone: 'Europe/Zurich',
})
const DIMENSIONS_MM = {
	width: 53.98,
	height: 85.6,
	padding: 1,
	footerHeight: 8,
	boxTypeHeight: 5,
	accessCellSize: 5,
	avatarSize: 36,
	logoBenevSize: 6,
	borderRadius: 2.2,
}
const LAYOUT = Object.fromEntries(
	Object.entries(DIMENSIONS_MM).map(([key, val]) => [key, val * 2.83465])
) as Record<keyof typeof DIMENSIONS_MM, number>

// --- Config IDs ---
const BADGE_BACKGROUND_MEDIA_ID = 'cmkgyriik0001d77er2sgcyu7'
const BADGE_LOGO_MEDIA_ID = 'cmkh1gdju0005d77ewby6t5fi'
const BADGE_TYPE_FIELD_ID = 'cmkgt8m4h0001allfw8720z18'
const ACCESS_DAYS_FIELD_ID = 'cmkif4z1t0007d77e0mgz7qle'
const ACCESS_SECTORS_FIELD_ID = 'cmkif5utz0009d77eakg8k5oj'
const BADGE_DEFAULT_COLOR = '#C7B198'
const BADGE_COLOR_MAP: Record<string, string> = {
	Comité: '#AA4465',
	Artiste: '#5F0A87',
	Bénévole: '#119822',
}

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true, teams: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)
	const doc = new PDFDocument({
		size: [LAYOUT.width, LAYOUT.height],
		margin: 0,
		autoFirstPage: false,
	})
	generateBadges().catch(console.error)
	const stream = new ReadableStream({
		start(controller) {
			doc.on('data', (chunk) => controller.enqueue(chunk))
			doc.on('end', () => controller.close())
			doc.on('error', (err) => controller.error(err))
		},
		cancel() {
			doc.end()
		},
	})
	return new Response(stream, {
		headers: {
			'Content-type': 'application/pdf',
			// 'Content-Disposition': `attachment; filename="badges-${eventId}.pdf"`,
		},
	})

	async function generateBadges() {
		// doc.registerFont('Light', fontLightPath)
		// doc.font('Light')

		const images = {
			logoBenev: await svgToPngBuffer(logoBenev),
			logoEvent: await getImageBuffer(BADGE_LOGO_MEDIA_ID),
			background: await getImageBuffer(BADGE_BACKGROUND_MEDIA_ID, {
				grayscale: true,
				size: {
					width: Math.round(LAYOUT.width * 3),
					height: Math.round(LAYOUT.height * 3),
				},
			}),
		}

		for (const member of members) {
			doc.addPage()

			const color = getBadgeColor(member)
			const name = `${member.firstName} ${member.lastName}`
			const badgeType = (member.profileJson[BADGE_TYPE_FIELD_ID] as string) || ''
			const footerText = `Imprimé le ${formater.format(new Date())}\nPropulsé par benev.io`

			layerBackground()
			layerLogoEvent()
			layerBadgeType()
			layerUserName()
			await layerAvatar()
			layerAccess()
			verso()

			function layerBackground() {
				const contentW = LAYOUT.width - 2 * LAYOUT.padding
				const contentH = LAYOUT.height - 2 * LAYOUT.padding
				doc.rect(0, 0, LAYOUT.width, LAYOUT.height).fill(color)
				doc.save()
				doc.opacity(0.85)
				roundedRect(
					LAYOUT.padding,
					LAYOUT.padding,
					contentW,
					contentH - LAYOUT.footerHeight + LAYOUT.padding,
					LAYOUT.borderRadius
				).clip()
				doc.image(images.background, LAYOUT.padding, LAYOUT.padding, {
					width: contentW,
					height: contentH,
				})
				doc.restore()
			}

			function layerLogoEvent() {
				const x = LAYOUT.padding
				const y = 2 * LAYOUT.boxTypeHeight
				const w = LAYOUT.width / 2
				doc.save()
				doc.rotate(-12, { origin: [x, y] })
				doc.image(images.logoEvent, x, y, { width: w })
				doc.restore()
			}

			function layerBadgeType() {
				const fontSize = 9
				const w = LAYOUT.width / 3
				const h = LAYOUT.boxTypeHeight
				const x = LAYOUT.width / 3
				const y = LAYOUT.padding * 2
				const radius = LAYOUT.borderRadius - LAYOUT.padding
				roundedRect(x, y, w, h, radius).fill(color)
				textCenter(badgeType, { x, y, w, h, fontSize })
			}

			function layerUserName() {
				const fontSize = 11
				const w = LAYOUT.width
				const x = 0
				const y = LAYOUT.height - LAYOUT.footerHeight / 2 - fontSize / 3

				doc.fillColor('#fff').fontSize(fontSize).text(name, x, y, {
					width: w,
					align: 'center',
					lineBreak: false,
				})
			}

			async function layerAvatar() {
				if (!member.avatarId) return
				const size = LAYOUT.avatarSize
				const x = LAYOUT.width / 2 - LAYOUT.avatarSize / 2
				const y = LAYOUT.height - LAYOUT.footerHeight - LAYOUT.avatarSize - 2 * LAYOUT.padding
				roundedRect(
					x - LAYOUT.padding,
					y - LAYOUT.padding,
					size + 2 * LAYOUT.padding,
					size + 2 * LAYOUT.padding,
					LAYOUT.borderRadius
				).fill(color)
				const avatarBuffer = await getImageBuffer(member.avatarId)
				doc.save()
				roundedRect(x, y, size, size, LAYOUT.borderRadius - LAYOUT.padding).clip()
				doc.image(avatarBuffer, x, y, { width: size, height: size })
				doc.restore()
			}

			function layerAccess() {
				const fontSize = 8
				const accessSectors = parseStringArray(member.profileJson[ACCESS_SECTORS_FIELD_ID])
				const accessDays = parseStringArray(member.profileJson[ACCESS_DAYS_FIELD_ID])
				const size = LAYOUT.accessCellSize
				const xDays = LAYOUT.width - LAYOUT.padding * 2 - size
				const xSectors = LAYOUT.width - LAYOUT.padding * 3 - size * 2
				const yStart = LAYOUT.padding * 2

				accessSectors.forEach((text, i) =>
					drawAccessCell(xSectors, yStart + i * (size + LAYOUT.padding / 2), text)
				)

				accessDays.forEach((text, i) =>
					drawAccessCell(xDays, yStart + i * (size + LAYOUT.padding / 2), text)
				)

				function drawAccessCell(x: number, y: number, text: string) {
					roundedRect(x, y, size, size, LAYOUT.borderRadius - LAYOUT.padding).fill(color)
					textCenter(text, { x, y, w: size, h: size, fontSize })
				}
			}

			function verso() {
				doc.addPage()
				const padding = 8
				const offsetX = 26
				const y = LAYOUT.height - LAYOUT.padding - LAYOUT.logoBenevSize - padding
				const logoX = LAYOUT.padding + offsetX
				const textX = LAYOUT.padding + offsetX + LAYOUT.logoBenevSize + padding
				doc.image(images.logoBenev, logoX, y, {
					width: LAYOUT.logoBenevSize,
					height: LAYOUT.logoBenevSize,
				})
				doc
					.fillColor('#666')
					.fontSize(7)
					.text(footerText, textX, y, {
						width: LAYOUT.width - textX,
						align: 'left',
					})
			}
		}

		doc.end()
	}

	function roundedRect(x: number, y: number, w: number, h: number, r: number) {
		return doc
			.moveTo(x + r, y)
			.lineTo(x + w - r, y)
			.quadraticCurveTo(x + w, y, x + w, y + r)
			.lineTo(x + w, y + h - r)
			.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
			.lineTo(x + r, y + h)
			.quadraticCurveTo(x, y + h, x, y + h - r)
			.lineTo(x, y + r)
			.quadraticCurveTo(x, y, x + r, y)
	}

	function textCenter(
		text: string,
		opts: { x: number; y: number; w: number; h: number; fontSize: number }
	) {
		doc
			.fillColor('#fff')
			.fontSize(opts.fontSize)
			.text(text, opts.x, opts.y + opts.h / 2 - opts.fontSize * 0.4, {
				width: opts.w,
				align: 'center',
			})
	}
}

async function svgToPngBuffer(svg: string) {
	return sharp(Buffer.from(svg)).png({}).toBuffer()
}

function getBadgeColor(member?: Member & { event: Event }): string {
	if (!member) return BADGE_DEFAULT_COLOR
	const badgeType = member.profileJson[BADGE_TYPE_FIELD_ID]
	if (typeof badgeType !== 'string') return BADGE_DEFAULT_COLOR
	return BADGE_COLOR_MAP[badgeType] || BADGE_DEFAULT_COLOR
}

function parseStringArray(anyData: unknown): string[] {
	const res = z.array(z.string()).safeParse(anyData)
	return res.success ? res.data : []
}

async function getImageBuffer(
	mediaId: string,
	opts: {
		size?: {
			width: number
			height: number
		}
		grayscale?: boolean
	} = {}
) {
	const filePath = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')
	let p = sharp(filePath)
	if (opts.size) p = p.resize(opts.size.width, opts.size.height)
	if (opts.grayscale) p = p.grayscale(true)
	return await p.png().toBuffer()
}
