import path from 'node:path'
import z from 'zod'
import sharp from 'sharp'
import PDFDocument from 'pdfkit'
import QrCode from 'qrcode'
import { env } from '$env/dynamic/private'
import type { Event, Member } from '@prisma/client'
import { prisma, permission } from '$lib/server'
import logoBenev from '$lib/assets/logo.svg?raw'
import { getMembers } from '../../../../members/getMembers'
import { FORMAT_CARD } from '$lib/constant'
import { existsSync } from 'node:fs'
import { getTextColor } from '$lib/utils'
import { error } from '@sveltejs/kit'
// import fontLight from '$lib/assets/Helvetica-Light.ttf'
// const fontLightPath = path.resolve(`.${fontLight}`)

const formater = new Intl.DateTimeFormat('fr-ch', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	timeZone: 'Europe/Zurich',
})
const DIMENSIONS_MM = {
	width: FORMAT_CARD.x,
	height: FORMAT_CARD.y,
	padding: 1,
	footerHeight: 8,
	boxTypeHeight: 5,
	accessCellSize: 5,
	avatarSize: 36,
	qrCodeSize: 24,
	borderRadius: 2.2,
}
const LAYOUT = Object.fromEntries(
	Object.entries(DIMENSIONS_MM).map(([key, val]) => [key, val * 2.83465])
) as Record<keyof typeof DIMENSIONS_MM, number>

export const GET = async ({ url, locals, params: { eventId, badgeId } }) => {
	await permission.leader(eventId, locals)

	const [event, badge] = await Promise.all([
		prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			include: { memberFields: true, teams: true },
		}),
		prisma.badge.findUniqueOrThrow({
			where: { id: badgeId, eventId },
		}),
	]).catch((err) => {
		console.error(err)
		error(404, `Not found: ${JSON.stringify({ eventId, badgeId })}`)
	})

	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)
	const doc = new PDFDocument({
		size: [LAYOUT.width, LAYOUT.height],
		margin: 0,
		autoFirstPage: false,
	})
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
	generateBadges().catch((err) => {
		console.error(err)
		doc.end()
	})

	return new Response(stream, {
		headers: {
			'Content-type': 'application/pdf',
			// 'Content-Disposition': `attachment; filename="badges-${eventId}.pdf"`,
		},
	})

	function getBadgeTypeValue(member: Member): string {
		if (!badge.typeFieldId) return ''
		const badgeTypeValue = member.profileJson[badge.typeFieldId]
		if (typeof badgeTypeValue !== 'string') return ''
		return badgeTypeValue
	}

	function getBadgeColor(member: Member): string {
		const badgeTypeValue = getBadgeTypeValue(member)
		return badge.colorMap[badgeTypeValue] || badge.colorDefault
	}

	async function generateBadges() {
		// doc.registerFont('Light', fontLightPath)
		// doc.font('Light')

		const images = {
			logoBenev: await svgToPngBuffer(logoBenev),
			logoEvent: await getImageBuffer(badge.logoId),
			background: await getImageBuffer(badge.backgroundId, {
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
			const fontColor = getTextColor(color)

			layerBackground()
			layerLogoEvent()
			layerBadgeType()
			layerUserName()
			await layerAvatar()
			layerAccess()
			await verso()

			function layerBackground() {
				const contentW = LAYOUT.width - 2 * LAYOUT.padding
				const contentH = LAYOUT.height - 2 * LAYOUT.padding
				doc.rect(0, 0, LAYOUT.width, LAYOUT.height).fill(color)
				doc.save()
				doc.opacity(0.85)
				doc.roundedRect(
					LAYOUT.padding,
					LAYOUT.padding,
					contentW,
					contentH - LAYOUT.footerHeight + LAYOUT.padding,
					LAYOUT.borderRadius
				)
				if (images.background) {
					doc.clip()
					doc.image(images.background, LAYOUT.padding, LAYOUT.padding, {
						width: contentW,
						height: contentH,
					})
				} else {
					doc.fill('#fff')
				}
				doc.restore()
			}

			function layerLogoEvent() {
				if (!images.logoEvent) return
				const x = LAYOUT.padding
				const y = 2 * LAYOUT.boxTypeHeight
				const w = LAYOUT.width / 2
				doc.save()
				doc.rotate(-12, { origin: [x, y] })
				doc.image(images.logoEvent, x, y, { width: w })
				doc.restore()
			}

			function layerBadgeType() {
				const badgeType = getBadgeTypeValue(member)
				if (!badgeType) return
				const fontSize = 9
				const w = LAYOUT.width / 3
				const h = LAYOUT.boxTypeHeight
				const x = LAYOUT.width / 3
				const y = LAYOUT.padding * 2
				const radius = LAYOUT.borderRadius - LAYOUT.padding
				doc.roundedRect(x, y, w, h, radius).fill(color)
				textCenter(badgeType, { x, y, w, h, fontSize, fontColor })
			}

			function layerUserName() {
				const fontSize = 11
				const w = LAYOUT.width
				const x = 0
				const y = LAYOUT.height - LAYOUT.footerHeight / 2 - fontSize / 3
				const name = `${member.firstName} ${member.lastName}`
				textCenter(name, {
					x,
					y: LAYOUT.height - LAYOUT.footerHeight,
					w: LAYOUT.width,
					h: LAYOUT.footerHeight,
					fontSize,
					fontColor,
				})
			}

			async function layerAvatar() {
				if (!member.avatarId) return
				const avatarBuffer = await getImageBuffer(member.avatarId)
				if (!avatarBuffer) return

				const size = LAYOUT.avatarSize
				const x = LAYOUT.width / 2 - LAYOUT.avatarSize / 2
				const y = LAYOUT.height - LAYOUT.footerHeight - LAYOUT.avatarSize - 2 * LAYOUT.padding
				doc
					.roundedRect(
						x - LAYOUT.padding,
						y - LAYOUT.padding,
						size + 2 * LAYOUT.padding,
						size + 2 * LAYOUT.padding,
						LAYOUT.borderRadius
					)
					.fill(color)
				doc.save()

				doc.roundedRect(x, y, size, size, LAYOUT.borderRadius - LAYOUT.padding).clip()
				doc.image(avatarBuffer, x, y, { width: size, height: size })
				doc.restore()
			}

			function layerAccess() {
				const fontSize = 8
				const accessSectors = parseStringArray(member.profileJson[badge.accessSectorsFieldId || ''])
				const accessDays = parseStringArray(member.profileJson[badge.accessDaysFieldId || ''])
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
					doc.roundedRect(x, y, size, size, LAYOUT.borderRadius - LAYOUT.padding).fill(color)
					textCenter(text, { x, y, w: size, h: size, fontSize, fontColor })
				}
			}

			async function verso() {
				doc.addPage()
				const padding = 8
				const fontSize = 7
				const textHeight = 2 * fontSize + padding
				const qrCodeSize = 50
				const qrX = LAYOUT.width / 2 - qrCodeSize / 2
				const qrY = LAYOUT.height - textHeight - qrCodeSize
				const text = `Imprimé le ${formater.format(new Date())} depuis benev.io`
				// const logoSize = qrCodeSize * 0.18
				// const logoX = LAYOUT.width / 2 - logoSize / 2
				// const logoY = qrY + qrCodeSize / 2 - logoSize / 2
				const qrCode = await QrCode.toBuffer(`https://benev.io/qr/${member.id}`, {
					margin: 0,
					width: qrCodeSize,
				})

				doc.image(qrCode, qrX, qrY, {
					align: 'center',
					width: qrCodeSize,
					height: qrCodeSize,
				})

				// doc.roundedRect(logoX, logoY, logoSize, logoSize, logoSize).fill('#fff')
				// doc.image(images.logoBenev, logoX + 2, logoY + 2, {
				// 	width: logoSize - 4,
				// 	height: logoSize - 4,
				// })

				textCenter(text, {
					x: 0,
					y: LAYOUT.height - textHeight,
					w: LAYOUT.width,
					h: textHeight,
					fontSize,
					fontColor: '#333',
				})
			}
		}

		doc.end()
	}

	function textCenter(
		text: string,
		opts: { x: number; y: number; w: number; h: number; fontSize: number; fontColor?: string }
	) {
		if (opts.fontColor) doc.fillColor(opts.fontColor)

		doc.fontSize(opts.fontSize).text(text, opts.x, opts.y + opts.h / 2 - opts.fontSize * 0.4, {
			width: opts.w,
			align: 'center',
		})
	}
}

async function svgToPngBuffer(svg: string) {
	return sharp(Buffer.from(svg)).png({}).toBuffer()
}

function parseStringArray(anyData: unknown): string[] {
	const res = z.array(z.string()).safeParse(anyData)
	return res.success ? res.data : []
}

async function getImageBuffer(
	mediaId: string | null,
	opts: {
		size?: {
			width: number
			height: number
		}
		grayscale?: boolean
	} = {}
): Promise<Buffer | null> {
	if (!mediaId) return null
	const filePath = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')
	if (!existsSync(filePath)) return null
	let pipe = sharp(filePath)
	if (opts.size) pipe = pipe.resize(opts.size.width, opts.size.height)
	if (opts.grayscale) pipe = pipe.grayscale(true)
	return await pipe.png().toBuffer()
}
