import { SMTP_USER, EMAIL_DISABLED } from '$app/env/private'
import { ORIGIN } from '$app/env/public'
import { type SendMailOptions } from 'nodemailer'
import type { Component, ComponentProps } from 'svelte'
import { render } from 'svelte/server'
import { prisma } from '#lib/server/index.js'
import { withoutTestRecipients } from '#lib/server/recipients.js'
import { enqueueEmail } from '#lib/server/emailQueue.js'
import type { EmailRelations } from '#lib/log/logMap.js'
import type { EmailEvent } from '#lib/email/models.js'
import { emailReplacers, type EmailModelProps } from '#lib/pages/emailSuggesions.js'
import { injectValues } from '#lib/pages/injectValues.js'
import { tiptapParser } from '#lib/ui/textRich/tiptapParser.js'
import EmailLayout from '#lib/email/EmailLayout.svelte'
import { getMemberReplacers } from '#lib/pages/memberSuggestions.js'

export type SendMailOptionsWithLog = SendMailOptions & {
	/** Rattache la ligne de journal produite par l'envoi. */
	logContext?: EmailRelations
	/** Un envoi en masse, qui passe après tout le reste (voir `emailQueue`). */
	bulk?: boolean
}
export type SendMailOptionsWithProps<Props> = Omit<SendMailOptionsWithLog, 'html'> & {
	props: Props
}

/**
 * Met un message en file plutôt que de l'envoyer: la requête rend la main tout de suite, le worker
 * de `emailQueue` s'occupe du SMTP et journalise le résultat.
 *
 * Le rendu du HTML, lui, reste dans la requête (voir `sendEmailComponent` / `sendEmailModel`):
 * un gabarit manquant doit continuer de lever chez l'appelant, et le message mis en file est
 * ainsi figé, insensible à une édition ultérieure du gabarit.
 *
 * `false` seulement si la file a refusé le message. Un envoi coupé ou entièrement destiné à des
 * adresses `.test` n'est pas un refus.
 */
export const sendEmail = async ({
	from,
	to,
	cc,
	bcc,
	logContext,
	bulk,
	...options
}: SendMailOptionsWithLog): Promise<boolean> => {
	if (EMAIL_DISABLED) return true

	const recipients = {
		to: withoutTestRecipients(to),
		cc: withoutTestRecipients(cc),
		bcc: withoutTestRecipients(bcc),
	}
	const dropped = [...recipients.to.dropped, ...recipients.cc.dropped, ...recipients.bcc.dropped]
	if (dropped.length) console.log(`Mail: adresses .test écartées (${dropped.join(', ')})`)
	if (!recipients.to.kept && !recipients.cc.kept && !recipients.bcc.kept) return true

	return enqueueEmail(
		{
			from: `${from || 'Benev.io'} <${SMTP_USER}>`,
			to: recipients.to.kept,
			cc: recipients.cc.kept,
			bcc: recipients.bcc.kept,
			...options,
		},
		logContext,
		{ bulk }
	)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendEmailComponent<Comp extends Component<any, any, any>>(
	component: Comp,
	{ props, ...options }: SendMailOptionsWithProps<ComponentProps<Comp>>
) {
	const { body } = render(component as Component<Record<string, unknown>>, {
		props: { ...props } as Record<string, unknown>,
	})
	return sendEmail({ ...options, html: body })
}

export async function sendEmailModel<EmailPath extends EmailEvent>(
	eventId: string,
	emailPath: EmailPath,
	{ props, ...options }: SendMailOptionsWithProps<EmailModelProps[EmailPath]>
) {
	const html = await renderEmailModel(eventId, emailPath, props)
	return sendEmail({
		...options,
		html,
		logContext: { eventId, ...options.logContext },
	})
}

export async function renderEmailModel<EmailPath extends EmailEvent>(
	eventId: string,
	emailPath: EmailPath,
	props: EmailModelProps[EmailPath]
) {
	const model = await prisma.page.findUniqueOrThrow({
		where: { eventId_path: { eventId, path: emailPath } },
		include: { event: true },
	})

	const replacers = [...emailReplacers[emailPath](props), ...getMemberReplacers(props)]
	const modelHTML = tiptapParser.toHTML(model.content)
	const layout = render(EmailLayout, {
		props: { title: model.event.name, subtitle: model.title },
	})
	const html = layout.body.replace('__SLOT__', injectValues(modelHTML, replacers))
	return injectOrigin(html)
}

function injectOrigin(html: string): string {
	return html.replaceAll(/(<[^>]*)src="\//g, `$1src="${ORIGIN}/`)
}
