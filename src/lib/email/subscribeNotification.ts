import type { EmailModelProps } from '$lib/pages/emailSuggesions'
import {
	getMemberProfile,
	sendEmailComponent,
	sendEmailModel,
	type SendMailOptionsWithProps,
} from '$lib/server'
import type { SubscribeState } from '@prisma/client'
import {
	EmailSubscribeRequest,
	EmailSubscribeAccepted,
	EmailSubscribeCancelled,
	EmailSubscribeDenied,
} from '$lib/email'

type SubscribeNotification<State extends SubscribeState> = (
	options: SendMailOptionsWithProps<Omit<EmailModelProps[`subscribe_${State}`], 'member'>>
) => Promise<unknown>

export const subscribeNotification: { [S in SubscribeState]: SubscribeNotification<S> } = {
	async request({ props, ...restOptions }) {
		console.log('REQUEST', restOptions)
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
		console.log('CANCELLED', restOptions)
		const member = await getMemberProfile({ id: props.subscribe.memberId })
		const options = { ...restOptions, props: { ...props, member } }
		if (props.subscribe.createdBy === 'user')
			return await sendEmailComponent(EmailSubscribeCancelled, options)
		else return await sendEmailModel(member.eventId, 'subscribe_cancelled', options)
	},
}
