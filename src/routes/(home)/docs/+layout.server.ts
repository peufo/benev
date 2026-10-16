import { getDocNav } from '#lib/doc/engine/registry.server.js'

export const load = () => ({ docNav: getDocNav() })
