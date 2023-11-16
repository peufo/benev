export const FORMAT_A3 = {
	x: 297,
	y: 420,
	aspect: 297 / 420,
} as const

export const MEDIA_PRESETS = {
	medium: [256, 256],
	large: [512, 512],
	a5: [148, 210],
	a4: [210, 297],
	a3: [297, 420],
	a2: [420, 594],
	a1: [594, 841],
} as const
