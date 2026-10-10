import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import {
	festivalFriday,
	showInPlace,
	seedAvatars,
	seedBadgeBackground,
	seedFestival,
} from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

const DAYS = ['VE', 'SA', 'DI']

demo('badges', async ({ page, director }) => {
	const { eventId, organizer, members } = await seedFestival(page)

	// Le rôle, que le modèle va lire, et les jours d'accès, déduits des créneaux de chacun·e.
	const role = await prisma.field.create({
		data: {
			eventId,
			name: 'Rôle',
			type: 'select',
			options: JSON.stringify(['Bénévole', 'Responsable', 'Comité']),
			memberCanRead: true,
			memberCanWrite: false,
			position: 2,
		},
	})
	const days = await prisma.field.create({
		data: {
			eventId,
			name: "Jours d'accès",
			type: 'multiselect',
			options: JSON.stringify(DAYS),
			memberCanRead: true,
			memberCanWrite: false,
			position: 3,
		},
	})
	const leaders = await prisma.member.findMany({
		where: { eventId, leaderOf: { some: {} } },
		select: { id: true },
	})
	const friday = festivalFriday().getTime()
	const subscribes = await prisma.subscribe.findMany({
		where: { member: { eventId }, state: 'accepted' },
		select: { memberId: true, period: { select: { start: true } } },
	})
	const owner = await prisma.member.findFirstOrThrow({ where: { eventId, userId: organizer.id } })
	for (const member of [...members, owner]) {
		const memberDays = new Set(
			subscribes
				.filter((s) => s.memberId === member.id)
				.map((s) => DAYS[Math.floor((s.period.start.getTime() - friday) / 86_400_000)])
		)
		const memberRole =
			member.id === owner.id
				? 'Comité'
				: leaders.some((l) => l.id === member.id)
					? 'Responsable'
					: 'Bénévole'
		await prisma.member.update({
			where: { id: member.id },
			data: {
				profileJson: {
					...(member.profileJson as PrismaJson.MemberProfile),
					[role.id]: memberRole,
					[days.id]: member.id === owner.id ? DAYS : DAYS.filter((d) => memberDays.has(d)),
				},
			},
		})
	}
	await seedAvatars(eventId, organizer.id, [...members, owner])

	const { logoId } = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
	const backgroundId = await seedBadgeBackground(eventId, organizer.id)
	const badge = await prisma.badge.create({
		data: {
			eventId,
			name: 'Badge bénévole',
			logoId,
			backgroundId,
			// La palette du logo, posée d'avance: le choix du champ « Rôle » la fait apparaître.
			colorMap: { Bénévole: '#f47a45', Responsable: '#edb84f', Comité: '#1f2146' },
			colorDefault: '#fdf4dc',
			accessDaysFieldId: days.id,
			versoEnabled: false,
		},
	})
	await gotoHydrated(page, `/${eventId}/admin/pages/badges/${badge.id}`)
	await expect(page.getByTitle('Aperçu du badge')).toBeVisible()
	// L'aperçu est un PDF, que le visualiseur dessine après coup: rien n'en signale la fin.
	await page.waitForTimeout(3000)

	await director.start()

	const typeTrigger = page.getByRole('button', { name: 'Champ: Type de membre' })
	await director.note(typeTrigger, 'Une couleur par rôle')
	await director.click(typeTrigger)
	await director.click(page.getByRole('option', { name: /Rôle/ }))
	await expect(page.getByRole('button', { name: 'responsable' })).toBeVisible()

	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Badge enregistré')).toBeVisible()
	await director.pause(1500)

	await director.click(page.getByRole('link', { name: 'Membres', exact: true }))
	await page.waitForURL('**/admin/members**')
	// La table réécrit son adresse une fois chargée, et le lien du badge avec elle.
	await page.waitForLoadState('networkidle')
	const print = page.locator('a[href*="/badges/"][href*="/pdf"]')
	// En chemin, une infobulle déborde et la barre de défilement décale la barre d'outils: le
	// survol laisse la page se poser avant que le clic ne vise le bouton.
	await director.hover(print)
	const popup = page.waitForEvent('popup')
	await director.click(print)
	await director.skip(() => showInPlace(page, popup, { draw: 6000 }))
	await director.pause(1200)

	// Le document se montre entier: rien, dans le visualiseur, n'appelle un gros plan.
	await director.focus(null)
	await director.moveTo({ x: 760, y: 420 })
	for (let i = 0; i < 30; i++) {
		await page.mouse.wheel(0, 30)
		await page.waitForTimeout(16)
	}
	await director.pause(800)
	await director.moveTo({ x: 1211, y: 28 })
	await director.pause(1500)
})
