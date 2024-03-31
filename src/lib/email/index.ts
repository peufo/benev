import { dev } from '$app/environment'
export const domain = dev ? 'http://localhost:5173' : 'https://benev.io'

export { default as EmailBasic } from './EmailBasic.svelte'
export { default as EmailSubscribeRequest } from './EmailSubscribeRequest.svelte'
export { default as EmailSubscribeDenied } from './EmailSubscribeDenied.svelte'
export { default as EmailSubscribeAccepted } from './EmailSubscribeAccepted.svelte'
export { default as EmailSubscribeCancelled } from './EmailSubscribeCancelled.svelte'
export { default as EmailVerificationLink } from './EmailVerificationLink.svelte'
export { default as EmailPasswordReset } from './EmailPasswordReset.svelte'
export { default as EmailAcceptInviteNotification } from './EmailAcceptInviteNotification.svelte'
export { default as EmailCheckoutValidation } from './EmailCheckoutValidation.svelte'
export { default as EmailProspect } from './EmailProspect.svelte'
