import { dev } from '$app/environment'
export const domain = dev ? 'http://localhost:5173' : 'https://benev.io'

export { default as EmailBasic } from './EmailBasic.svelte'
export { default as EmailNewSubscribe } from './EmailNewSubscribe.svelte'
export { default as EmailSubscribeState } from './EmailSubscribeState.svelte'
export { default as EmailSubscribeStateCancelled } from './EmailSubscribeStateCancelled.svelte'
export { default as EmailVerificationLink } from './EmailVerificationLink.svelte'
export { default as EmailPasswordReset } from './EmailPasswordReset.svelte'
export { default as EmailNewInvite } from './EmailNewInvite.svelte'
export { default as EmailAcceptInvite } from './EmailAcceptInvite.svelte'
export { default as EmailAcceptInviteNotification } from './EmailAcceptInviteNotification.svelte'
export { default as EmailCheckoutValidation } from './EmailCheckoutValidation.svelte'
export { default as EmailProspect } from './EmailProspect.svelte'

export const getPath = (path: string) => `${domain}${path.replace(domain, '')}`
