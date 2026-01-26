import { getMembers } from '../../getMembers'
import { prisma, permission } from '$lib/server'
import type { Event, Member } from '@prisma/client'
import path from 'node:path'
import { env } from '$env/dynamic/private'
import sharp from 'sharp'
import logoBenev from '$lib/assets/logo.svg?raw'
import accessDaysIcon from '$lib/assets/calendar.svg?raw'
import accessSectorsIcon from '$lib/assets/key.svg?raw'
import z from 'zod'
import PDFDocument from 'pdfkit'
import fontLight from '$lib/assets/Helvetica-Light.ttf'

const fontLightPath = path.resolve(`.${fontLight}`)

console.log({ fontLightPath })
console.log({ fontLightPath: path.resolve(fontLightPath) })

// --- Configuration & Constants ---

const formater = new Intl.DateTimeFormat('fr-ch', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	timeZone: 'Europe/Zurich',
})

const MM_TO_PT = 2.83465

// Dimensions de base (en mm)
const DIMS_MM = {
	width: 53.98,
	height: 85.6,
	padding: 1,
	boxNameHeight: 8,
	boxTypeHeight: 5,
	avatarSize: 36,
	logoBenevSize: 6,
	accessIconSize: 5,
	borderRadius: 2,
}

// Conversion en points
const PT = Object.fromEntries(
	Object.entries(DIMS_MM).map(([key, val]) => [key, val * MM_TO_PT])
) as Record<keyof typeof DIMS_MM, number>

// --- LAYOUT DEFINITION (Nouvelle section) ---
// On pré-calcule toutes les positions ici pour éviter les "magic numbers" dans le code de dessin.
const LAYOUT = {
	w: PT.width,
	h: PT.height,
	pad: PT.padding,
	contentW: PT.width - 2 * PT.padding,
	contentH: PT.height - 2 * PT.padding,

	// La boîte de catégorie en haut au centre
	typeBox: {
		x: PT.width / 3,
		y: PT.padding,
		w: PT.width / 3,
		h: PT.boxTypeHeight,
		radius: PT.borderRadius,
	},

	// La zone du nom en bas
	nameBox: {
		x: 0,
		y: PT.height - PT.boxNameHeight,
		w: PT.width,
		h: PT.boxNameHeight,
	},

	// L'avatar
	avatar: {
		size: PT.avatarSize,
		x: PT.width / 2 - PT.avatarSize / 2,
		// Positionné juste au-dessus de la nameBox avec du padding
		y: PT.height - PT.boxNameHeight - PT.avatarSize - 2 * PT.padding,
	},

	// Le logo principal (en haut à gauche, avant rotation)
	mainLogo: {
		x: PT.padding,
		y: PT.boxTypeHeight + PT.padding,
		w: PT.width / 2,
		h: 20 * MM_TO_PT, // Hauteur approximative
	},

	// Le pied de page
	footer: {
		y: PT.height - PT.padding - PT.logoBenevSize - 8,
		logoSize: PT.logoBenevSize,
		textXOffset: PT.logoBenevSize + 8,
	},

	// Les grilles d'accès à droite
	access: {
		size: PT.accessIconSize,
		// Colonne des jours (la plus à droite)
		xDays: PT.width - PT.padding - PT.accessIconSize - 0.8 * MM_TO_PT,
		// Colonne des secteurs (à gauche des jours)
		xSectors: PT.width - 2 * PT.padding - 2 * PT.accessIconSize - 0.7 * MM_TO_PT,
		yStart: PT.padding * 2,
	},
}

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

// --- Main Handler ---

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true, teams: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)

	// 1. Prepare Assets
	const logoBenevBuffer = await svgToPngBuffer(logoBenev)

	const backgroundImageBuffer = await getImageBuffer(BADGE_BACKGROUND_MEDIA_ID, {
		grayscale: true,
		size: { width: Math.round(LAYOUT.w * 3), height: Math.round(LAYOUT.h * 3) },
	})
	const logoImageBuffer = await getImageBuffer(BADGE_LOGO_MEDIA_ID)

	// 2. Initialize PDF
	const doc = new PDFDocument({
		size: [LAYOUT.w, LAYOUT.h],
		margin: 0,
		autoFirstPage: false,
	})

	// Utilisation de Helvetica-Light par défaut pour un look plus fin
	// doc.registerFont('Light', fontLightPath)
	// doc.font('Light')

	const chunks: Buffer[] = []
	doc.on('data', (chunk) => chunks.push(chunk))

	// 3. Generate Badges
	for (const member of members) {
		doc.addPage()

		const color = getBadgeColor(member)
		const name = `${member.firstName} ${member.lastName}`
		const badgeType = (member.profileJson[BADGE_TYPE_FIELD_ID] as string) || ''
		const footerText = `Imprimé le ${formater.format(new Date())}\nPropulsé par benev.io`

		// --- Layer: Background Color ---
		doc.rect(0, 0, LAYOUT.w, LAYOUT.h).fill(color)

		// --- Layer: Background Image ---
		if (backgroundImageBuffer) {
			doc.save()
			doc.opacity(0.8)
			roundedRect(
				doc,
				LAYOUT.pad,
				LAYOUT.pad,
				LAYOUT.contentW,
				LAYOUT.contentH - LAYOUT.nameBox.h + LAYOUT.pad,
				PT.borderRadius
			).clip()
			doc.image(backgroundImageBuffer, LAYOUT.pad, LAYOUT.pad, {
				width: LAYOUT.contentW,
				height: LAYOUT.contentH,
			})
			doc.restore()
		}

		// --- Layer: Logo (Rotated) ---
		if (logoImageBuffer) {
			doc.save()
			const { x, y, w, h } = LAYOUT.mainLogo
			doc.rotate(-12, { origin: [x, y] })
			doc.image(logoImageBuffer, x, y, { width: w, height: h })
			doc.restore()
		}

		// --- Layer: Badge Type Box (Top Center) - Rounded Bottom ---
		const tb = LAYOUT.typeBox
		// On dessine un chemin manuel pour n'arrondir que le bas
		doc
			.moveTo(tb.x, tb.y) // Haut Gauche
			.lineTo(tb.x + tb.w, tb.y) // Haut Droite
			.lineTo(tb.x + tb.w, tb.y + tb.h - tb.radius) // Côté droit vers le bas
			.quadraticCurveTo(tb.x + tb.w, tb.y + tb.h, tb.x + tb.w - tb.radius, tb.y + tb.h) // Coin Bas Droite
			.lineTo(tb.x + tb.radius, tb.y + tb.h) // Bas vers la gauche
			.quadraticCurveTo(tb.x, tb.y + tb.h, tb.x, tb.y + tb.h - tb.radius) // Coin Bas Gauche
			.lineTo(tb.x, tb.y) // Retour Haut Gauche
			.fill(color)

		doc
			.fillColor('#fff')
			.fontSize(9)
			.text(badgeType, tb.x, tb.y + tb.h / 2 - 4, {
				width: tb.w,
				align: 'center',
				lineBreak: false,
			})

		// --- Layer: Name Box (Bottom) ---
		const nb = LAYOUT.nameBox

		doc
			.fillColor('#fff')
			.fontSize(11)
			// Ajustement fin vertical (-4) pour centrer visuellement
			.text(name, nb.x, nb.y + nb.h / 2 - 4, {
				width: nb.w,
				align: 'center',
				lineBreak: false,
			})

		// --- Layer: Avatar ---
		if (member.avatarId) {
			const av = LAYOUT.avatar
			// Bordure/Fond de l'avatar
			roundedRect(
				doc,
				av.x - LAYOUT.pad,
				av.y - LAYOUT.pad,
				av.size + 2 * LAYOUT.pad,
				av.size + 2 * LAYOUT.pad,
				PT.borderRadius
			).fill(color)
			try {
				const avatarBuffer = await getImageBuffer(member.avatarId)
				if (avatarBuffer) {
					// On ajoute un léger arrondi à l'image elle-même pour faire plus propre
					doc.save()
					roundedRect(doc, av.x, av.y, av.size, av.size, PT.borderRadius - PT.padding).clip()
					doc.image(avatarBuffer, av.x, av.y, { width: av.size, height: av.size })
					doc.restore()
				}
			} catch (e) {
				/* ignore */
			}
		}

		// --- Layer: Access Grids ---
		const accessSectors = parseStringArray(member.profileJson[ACCESS_SECTORS_FIELD_ID])
		const accessDays = parseStringArray(member.profileJson[ACCESS_DAYS_FIELD_ID])
		const ac = LAYOUT.access

		// Draw Data
		accessSectors.forEach((s, i) =>
			drawAccessCell(doc, ac.xSectors, ac.yStart + i * (ac.size + PT.padding / 2), color, null, s)
		)

		accessDays.forEach((d, i) =>
			drawAccessCell(doc, ac.xDays, ac.yStart + i * (ac.size + PT.padding / 2), color, null, d)
		)

		// --- Layer: Footer ---
		doc.addPage()
		const foot = LAYOUT.footer

		const deltaX = 24
		if (logoBenevBuffer) {
			doc.image(logoBenevBuffer, LAYOUT.pad + deltaX, foot.y, {
				width: foot.logoSize,
				height: foot.logoSize,
			})
		}

		doc
			.fillColor('#666')
			.fontSize(7)
			// Helvetica-Light est déjà actif
			.text(footerText, LAYOUT.pad + foot.textXOffset + deltaX, foot.y + 1, {
				width: LAYOUT.w,
				align: 'left',
			})
	}

	doc.end()

	const pdfBuffer = await new Promise<Buffer>((resolve) => {
		doc.on('end', () => resolve(Buffer.concat(chunks)))
	})

	return new Response(pdfBuffer, {
		headers: {
			'Content-type': 'application/pdf',
			// 'Content-Disposition': `attachment; filename="badges-${eventId}.pdf"`,
		},
	})
}

// --- Helpers ---

// Helper pour dessiner un rectangle arrondi standard (utilisé pour clipper l'avatar)
function roundedRect(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
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

function drawAccessCell(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	color: string,
	icon?: Buffer | null,
	text?: string
) {
	const size = LAYOUT.access.size
	// On arrondit légèrement les cases d'accès aussi pour le style
	roundedRect(doc, x, y, size, size, PT.borderRadius - PT.padding).fill(color)

	if (icon) {
		const iconPad = 1
		doc.image(icon, x + iconPad, y + iconPad, {
			width: size - 2 * iconPad,
			height: size - 2 * iconPad,
		})
	} else if (text) {
		doc
			.fillColor('#fff')
			// Font très petite, Light est essentiel ici pour la lisibilité
			.fontSize(size - 2.5 * MM_TO_PT)
			.text(text, x, y + size / 2 - 2, { width: size, align: 'center', lineBreak: false })
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
	try {
		const filePath = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')
		let p = sharp(filePath)
		if (opts.size) p = p.resize(opts.size.width, opts.size.height)
		if (opts.grayscale) p = p.grayscale(true)
		return await p.png().toBuffer()
	} catch {
		return null
	}
}
