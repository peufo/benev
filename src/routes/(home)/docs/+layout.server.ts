import { getDocNav } from '$lib/doc/engine/registry.server'

export const load = () => ({ docNav: getDocNav() })
