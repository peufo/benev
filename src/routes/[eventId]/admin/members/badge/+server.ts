import { getMembers } from '../getMembers'
import { prisma, permission } from '$lib/server'
import { type Template } from '@pdfme/common'
import { generate } from '@pdfme/generator'
import { svg, text, image } from '@pdfme/schemas'
import type { Event, Member } from '@prisma/client'
import path from 'node:path'
import { env } from '$env/dynamic/private'
import sharp from 'sharp'
import logoBenev from '$lib/assets/logo.svg?raw'
import accessDaysIcon from '$lib/assets/calendar.svg?raw'
import accessSectorsIcon from '$lib/assets/key.svg?raw'
import z from 'zod'

const formater = new Intl.DateTimeFormat('fr-ch', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	timeZone: 'Europe/Zurich',
})

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true, teams: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)

	const backgroundImage = await getImageBase64(BADGE_BACKGROUND_MEDIA_ID, {
		grayscale: true,
		opacity: BADGE_BACKGROUND_OPACITY,
		size: {
			width: Math.round(CARD_WIDTH * 10),
			height: Math.round(CARD_HEIGHT * 10),
		},
	})
	const logoImage = await getImageBase64(BADGE_LOGO_MEDIA_ID)
	const footer = `Imprimé le ${formater.format(new Date())}\nPropulsé par benev.io`

	const pdf = await generate({
		plugins: { svg, text, image },
		template,
		inputs: await Promise.all(
			members.map(async (member) => {
				const color = getBadgeColor(member)
				const avatar = member.avatarId ? await getImageBase64(member.avatarId) : ''
				return {
					backgroundSVG: getBackgroundSVG(color),
					backgroundImage,
					logoImage,
					layerSVG: getLayerSVG(color, !!member.avatarId),
					name: `${member.firstName} ${member.lastName}`,
					badgeType: member.profileJson[BADGE_TYPE_FIELD_ID] || '',
					avatar,
					logoBenev,
					footer,
					accessDaysIcon,
					accessSectorsIcon,
					access: getAccessSVG(color, member),
				}
			})
		),
	})

	return new Response(pdf.buffer, {
		headers: {
			'Content-type': 'application/pdf',
			//'Content-Disposition': 'attachment; filename="members.csv"',
		},
	})
}

// Credit card dimension
const CARD_WIDTH = 53.98
const CARD_HEIGHT = 85.6

const PADDING = 1
const BOX_NAME_HEIGHT = 8
const BOX_TYPE_HEIGHT = 5
const AVATAR_SIZE = 36
const LOGO_BENEV_SIZE = 6
const SIZE_ACCESS = 5

const template: Template = {
	basePdf: { width: CARD_WIDTH, height: CARD_HEIGHT, padding: [0, 0, 0, 0] },
	schemas: [
		[
			{
				name: 'backgroundSVG',
				type: 'svg',
				position: { x: 0, y: 0 },
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
			},
			{
				name: 'backgroundImage',
				type: 'image',
				position: { x: PADDING, y: PADDING },
				width: CARD_WIDTH - 2 * PADDING,
				height: CARD_HEIGHT - 2 * PADDING,
			},
			{
				name: 'logoImage',
				type: 'image',
				position: { x: PADDING, y: BOX_TYPE_HEIGHT + PADDING },
				width: CARD_WIDTH / 2,
				height: 20, // TODO: auto ?
				rotate: -12,
			},
			{
				name: 'layerSVG',
				type: 'svg',
				position: { x: 0, y: 0 },
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
			},
			{
				name: 'badgeType',
				type: 'text',
				position: { x: CARD_WIDTH / 3, y: PADDING },
				width: CARD_WIDTH / 3,
				height: BOX_TYPE_HEIGHT,
				alignment: 'center',
				verticalAlignment: 'middle',
				fontSize: 9,
				fontColor: '#fff',
			},
			{
				name: 'name',
				type: 'text',
				position: { x: 0, y: CARD_HEIGHT - BOX_NAME_HEIGHT },
				width: CARD_WIDTH,
				height: BOX_NAME_HEIGHT,
				alignment: 'center',
				verticalAlignment: 'middle',
				fontSize: 11,
				fontColor: '#fff',
			},
			{
				name: 'avatar',
				type: 'image',
				position: {
					x: CARD_WIDTH / 2 - AVATAR_SIZE / 2,
					y: CARD_HEIGHT - AVATAR_SIZE - BOX_NAME_HEIGHT - 2 * PADDING,
				},
				width: AVATAR_SIZE,
				height: AVATAR_SIZE,
			},
			{
				name: 'access',
				type: 'svg',
				position: { x: 0, y: 0 },
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
			},
			{
				name: 'accessDaysIcon',
				type: 'svg',
				position: {
					x: CARD_WIDTH - PADDING - SIZE_ACCESS,
					y: PADDING,
				},
				width: SIZE_ACCESS - 1.5,
				height: SIZE_ACCESS,
			},
			{
				name: 'accessSectorsIcon',
				type: 'svg',
				position: {
					x: CARD_WIDTH - 2 * PADDING - 2 * SIZE_ACCESS,
					y: PADDING,
				},
				width: SIZE_ACCESS - 1.5,
				height: SIZE_ACCESS,
			},
		],
		[
			{
				name: 'logoBenev',
				type: 'svg',
				position: {
					x: PADDING + 7,
					y: CARD_HEIGHT - PADDING - LOGO_BENEV_SIZE - 1,
				},
				width: LOGO_BENEV_SIZE,
				height: LOGO_BENEV_SIZE,
			},
			{
				name: 'footer',
				type: 'text',
				position: {
					x: PADDING + LOGO_BENEV_SIZE + 9,
					y: CARD_HEIGHT - PADDING - LOGO_BENEV_SIZE - 1,
				},
				width: CARD_WIDTH - PADDING * 2 - LOGO_BENEV_SIZE - 2,
				height: LOGO_BENEV_SIZE,
				fontSize: 8,
				fontColor: '#666',
			},
		],
	],
}

// BADGE CONFIGURATION TODO: set configuration in /admin/
const BADGE_BACKGROUND_MEDIA_ID = 'cmkgyriik0001d77er2sgcyu7'
const BADGE_BACKGROUND_OPACITY = 0.8
const BADGE_LOGO_MEDIA_ID = 'cmkh1gdju0005d77ewby6t5fi'
const BADGE_TYPE_FIELD_ID = 'cmkgt8m4h0001allfw8720z18'
const BADGE_COLOR_MAP: Record<string, string> = {
	Comité: '#AA4465', //'#ED9390',
	Artiste: '#5F0A87', //'#87BCDE',
	Bénévole: '#119822', //'#BDBF09',
}
const BADGE_DEFAULT_COLOR = '#C7B198'
const ACCESS_DAYS_FIELD_ID = 'cmkif4z1t0007d77e0mgz7qle'
const ACCESS_SECTORS_FIELD_ID = 'cmkif5utz0009d77eakg8k5oj'

function getBadgeColor(member?: Member & { event: Event }): string {
	if (!member) return BADGE_DEFAULT_COLOR
	const badgeType = member.profileJson[BADGE_TYPE_FIELD_ID]
	if (badgeType === undefined) return ''
	if (typeof badgeType !== 'string') return BADGE_DEFAULT_COLOR
	return BADGE_COLOR_MAP[badgeType] || BADGE_DEFAULT_COLOR
}

function getBackgroundSVG(color: string): string {
	return /*html*/ `<svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect
        width="${CARD_WIDTH}"
        height="${CARD_HEIGHT}"
        x="0"
        y="0"
        fill="${color}"
        />
    </svg>
    `
}

function getLayerSVG(color: string, isAvatarBackground: boolean): string {
	const avatarBackground = /*html*/ `<rect
        width="${AVATAR_SIZE + 2 * PADDING}"
        height="${AVATAR_SIZE + 2 * PADDING}"
        x="${CARD_WIDTH / 2 - AVATAR_SIZE / 2 - PADDING}"
        y="${CARD_HEIGHT - AVATAR_SIZE - BOX_NAME_HEIGHT - 3 * PADDING}"
        fill="${color}"
    />`
	return /*html*/ `<svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect
            width="${CARD_WIDTH}"
            height="${BOX_NAME_HEIGHT}"
            x="0"
            y="${CARD_HEIGHT - BOX_NAME_HEIGHT}"
            fill="${color}"
        />
        <rect
            width="${CARD_WIDTH / 3}"
            height="${BOX_TYPE_HEIGHT}"
            x="${CARD_WIDTH / 3}"
            y="${PADDING}"
            fill="${color}"
        />
        ${isAvatarBackground ? avatarBackground : ''}
    </svg>
    `
}

function parseStringArray(anyData: unknown): string[] {
	const res = z.array(z.string()).safeParse(anyData)
	return res.success ? res.data : []
}

function getAccessSVG(color: string, member?: Member & { event: Event }): string {
	if (!member) return BADGE_DEFAULT_COLOR
	const accessSectors = parseStringArray(member.profileJson[ACCESS_SECTORS_FIELD_ID])
	const accessDays = parseStringArray(member.profileJson[ACCESS_DAYS_FIELD_ID])

	const getCell = (x: number, index: number, content: string) => /*html*/ `
        <rect
            width="${SIZE_ACCESS}"
            height="${SIZE_ACCESS}"
            x="${x}"
            y="${PADDING + (index + 1) * SIZE_ACCESS}"
            fill="${color}"
        />
        <text 
            x="${x + SIZE_ACCESS / 2}"
            y="${PADDING + (index + 1.7) * SIZE_ACCESS}"
            fill="#fff"
            font-size="${SIZE_ACCESS - 2.5}"
            text-anchor="middle"
            >
            ${content}
        </text>
    `

	const xSectors = CARD_WIDTH - 2 * PADDING - 2 * SIZE_ACCESS - 0.7
	const xDays = CARD_WIDTH - PADDING - SIZE_ACCESS - 0.8

	return /*html*/ `<svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect
            width="${SIZE_ACCESS}"
            height="${SIZE_ACCESS}"
            x="${xSectors}"
            y="${PADDING}"
            fill="${color}"
        />
        <rect
            width="${SIZE_ACCESS}"
            height="${SIZE_ACCESS}"
            x="${xDays}"
            y="${PADDING}"
            fill="${color}"
        />
        ${accessSectors.map((sector, index) => getCell(xSectors, index, sector))}
        ${accessDays.map((sector, index) => getCell(xDays, index, sector))}
    </svg>
    `
}

async function getImageBase64(
	mediaId: string,
	{
		size = undefined,
		opacity = 1,
		grayscale = false,
	}: {
		opacity?: number
		size?: sharp.ResizeOptions
		grayscale?: boolean
	} = {}
): Promise<string> {
	const filePath = path.resolve(env.MEDIA_DIR, mediaId, 'original.webp')
	const sharpBuffer = await sharp(filePath)
		.resize(size)
		.ensureAlpha(opacity)
		.grayscale(grayscale)
		.png()
		.toBuffer()
	return `data:image/png;base64,${sharpBuffer.toString('base64')}`
}
