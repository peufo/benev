import type { EmailModelProps } from '#lib/pages/emailSuggesions.js'
import {
	getMemberProfile,
	sendEmailComponent,
	sendEmailModel,
	type SendMailOptionsWithProps,
} from '#lib/server/index.js'
import type { SubscribeState } from '@prisma/client'
import {
	EmailSubscribeRequest,
	EmailSubscribeAccepted,
	EmailSubscribeCancelled,
	EmailSubscribeDenied,
} from '#lib/email/index.js'

type SubscribeNotification<State extends SubscribeState> = (
	options: SendMailOptionsWithProps<Omit<EmailModelProps[`subscribe_${State}`], 'member'>>
) => Promise<boolean>

export const subscribeNotification: { [S in SubscribeState]: SubscribeNotification<S> } = {
	async request({ props, ...restOptions }) {
		const member = await getMemberProfile({ id: props.subscribe.memberId })
		const options = { ...restOptions, props: { ...props, member } }
		if (props.subscribe.createdBy === 'user')
			return await sendEmailComponent(EmailSubscribeRequest, options)
		else return await sendEmailModel(member.eventId, 'subscribe_request', options)
	},
	async accepted({ props, ...restOptions }) {
		const member = await getMemberProfile({ id: props.subscribe.memberId })
		const options = { ...restOptions, props: { ...props, member } }
		if (options.props.subscribe.createdBy === 'leader')
			return await sendEmailComponent(EmailSubscribeAccepted, options)
		else return await sendEmailModel(member.eventId, 'subscribe_accepted', options)
	},
	async denied({ props, ...restOptions }) {
		const member = await getMemberProfile({ id: props.subscribe.memberId })
		const options = { ...restOptions, props: { ...props, member } }
		if (props.subscribe.createdBy === 'leader')
			return await sendEmailComponent(EmailSubscribeDenied, options)
		else return await sendEmailModel(member.eventId, 'subscribe_denied', options)
	},
	async cancelled({ props, ...restOptions }) {
		const member = await getMemberProfile({ id: props.subscribe.memberId })
		const options = { ...restOptions, props: { ...props, member } }
		if (props.subscribe.createdBy === 'user')
			return await sendEmailComponent(EmailSubscribeCancelled, options)
		else return await sendEmailModel(member.eventId, 'subscribe_cancelled', options)
	},
}

/**
 * Une proposition validée de force pendant qu'elle attendait n'a jamais été annoncée: le membre
 * l'apprend déjà acceptée, par le modèle qui lui dit qu'un·e responsable a accepté sa demande.
 * `accepted` enverrait aux responsables le composant qui leur est destiné.
 */
export const announceAccepted: SubscribeNotification<'accepted'> = async ({
	props,
	...restOptions
}) => {
	const member = await getMemberProfile({ id: props.subscribe.memberId })
	return await sendEmailModel(member.eventId, 'subscribe_accepted', {
		...restOptions,
		props: { ...props, member },
	})
}
