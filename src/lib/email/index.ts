import env from '$app/env/public'

// TODO: Use explicit env and declare env.ORIGIN as public var
// then... drop this
export const domain = env.ORIGIN

export { default as EmailBasic } from './EmailBasic.svelte'
export { default as EmailSubscribeRequest } from './EmailSubscribeRequest.svelte'
export { default as EmailSubscribeDenied } from './EmailSubscribeDenied.svelte'
export { default as EmailSubscribeAccepted } from './EmailSubscribeAccepted.svelte'
export { default as EmailSubscribeCancelled } from './EmailSubscribeCancelled.svelte'
export { default as EmailVerificationLink } from './EmailVerificationLink.svelte'
export { default as EmailPasswordReset } from './EmailPasswordReset.svelte'
export { default as EmailAcceptInviteNotification } from './EmailAcceptInviteNotification.svelte'
export { default as EmailCheckoutValidation } from './EmailCheckoutValidation.svelte'
export { default as EmailTierQuotaAlert } from './EmailTierQuotaAlert.svelte'
