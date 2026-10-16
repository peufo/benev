import { NOINDEX } from '#lib/seo/index.js'

// Page de bricolage : rien à indexer
export const load = () => ({ metaTags: NOINDEX })
