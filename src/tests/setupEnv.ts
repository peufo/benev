import { loadEnv } from 'vite'
import { set_env } from '__sveltekit/env'

/**
 * Les variables déclarées dans `src/env.ts` sont peuplées par `set_env()` au démarrage du serveur
 * SvelteKit. Vitest n'en démarre aucun: sans cet appel, tout ce qui vient de `$app/env/*` vaut
 * `undefined`. `.env` d'abord, `process.env` ensuite pour que la CI, qui n'écrit pas de `.env`,
 * l'emporte.
 *
 * `EMAIL_DISABLED` est forcé: importer `$lib/server/emailQueue` ouvre sinon une connexion SMTP.
 */
set_env({
	...loadEnv('test', process.cwd(), ''),
	...process.env,
	EMAIL_DISABLED: 'true',
})
