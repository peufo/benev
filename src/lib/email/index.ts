import { dev } from '$app/environment'
export const domain = dev ? 'http://localhost:5173' : 'https://benev.ch'

export { default as EmailNewSubscribe } from './EmailNewSubscribe.svelte'
export { default as EmailSubscribeState } from './EmailSubscribeState.svelte'
export { default as EmailVerificationLink } from './EmailVerificationLink.svelte'
export { default as EmailPasswordReset } from './EmailPasswordReset.svelte'
export { default as EmailNewMember } from './EmailNewMember.svelte'
export { default as EmailNewMemberNotification } from './EmailNewMemberNotification.svelte'
