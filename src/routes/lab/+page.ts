import { NOINDEX } from '$lib/seo'

// Page de bricolage : rien à indexer
export const load = () => ({ metaTags: NOINDEX })
