import { env } from '$env/dynamic/private'
import { type SendMailOptions } from 'nodemailer'
import type { Component, ComponentProps } from 'svelte'
import { render } from 'svelte/server'
import { prisma } from '$lib/server'
import { withoutTestRecipients } from '$lib/server/recipients'
import { emailDisabled, enqueueEmail } from '$lib/server/emailQueue'
import type { EmailRelations } from '$lib/log/logMap'
import type { EmailEvent } from '$lib/email/models'
import { emailReplacers, type EmailModelProps } from '$lib/pages/emailSuggesions'
import { injectValues } from '$lib/pages/injectValues'
import { tiptapParser } from '$lib/ui/textRich/tiptapParser'
import EmailLayout from '$lib/email/EmailLayout.svelte'
import { getMemberReplacers } from '$lib/pages/memberSuggestions'
import { domain } from '$lib/email'

export type SendMailOptionsWithLog = SendMailOptions & {
	/** Rattache la ligne de journal produite par l'envoi. */
	logContext?: EmailRelations
}

/**
 * Met un message en file plutôt que de l'envoyer: la requête rend la main tout de suite, le worker
 * de `emailQueue` s'occupe du SMTP et journalise le résultat.
 *
 * Le rendu du HTML, lui, reste dans la requête (voir `sendEmailComponent` / `sendEmailModel`):
 * un gabarit manquant doit continuer de lever chez l'appelant, et le message mis en file est
 * ainsi figé, insensible à une édition ultérieure du gabarit.
 */
export const sendEmail = async ({
	from,
	to,
	cc,
	bcc,
	logContext,
	...options
}: SendMailOptionsWithLog) => {
	if (emailDisabled) return

	const recipients = {
		to: withoutTestRecipients(to),
		cc: withoutTestRecipients(cc),
		bcc: withoutTestRecipients(bcc),
	}
	const dropped = [...recipients.to.dropped, ...recipients.cc.dropped, ...recipients.bcc.dropped]
	if (dropped.length) console.log(`Mail: adresses .test écartées (${dropped.join(', ')})`)
	// Plus personne à qui écrire: le message était entièrement destiné à des fixtures.
	if (!recipients.to.kept && !recipients.cc.kept && !recipients.bcc.kept) return

	enqueueEmail(
		{
			from: `${from || 'Benev.io'} <${env.SMTP_USER}>`,
			to: recipients.to.kept,
			cc: recipients.cc.kept,
			bcc: recipients.bcc.kept,
			...options,
		},
		logContext
	)
}

export type SendMailOptionsWithProps<Props> = Omit<SendMailOptionsWithLog, 'html'> & {
	props: Props
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendEmailComponent<Comp extends Component<any, any, any>>(
	component: Comp,
	options: SendMailOptionsWithProps<ComponentProps<Comp>>
) {
	const { body } = render(component as Component<Record<string, unknown>>, {
		props: options.props as Record<string, unknown>,
	})
	return sendEmail({ ...options, html: body })
}

export async function sendEmailModel<EmailPath extends EmailEvent>(
	eventId: string,
	emailPath: EmailPath,
	options: SendMailOptionsWithProps<EmailModelProps[EmailPath]>
) {
	const html = await renderEmailModel(eventId, emailPath, options.props)
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
	return injectDomain(html)
}

function injectDomain(html: string): string {
	return html.replaceAll(/(<[^>]*)src="\//g, `$1src="${domain}/`)
}
