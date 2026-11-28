/**
 * Remplace la base locale par une copie de celle de prod, puis lui applique les migrations en
 * attente.
 *
 *   bun run db:import            # dump frais de la prod, rangé dans dumps/benevio-<date>.sql,
 *                                # et copie des médias de prod dans MEDIA_DIR
 *   bun run db:import <fichier>  # rejoue un dump déjà téléchargé, sans toucher aux médias
 *
 * Lit dans `.env` PROD_DB, `hôte-ssh:service-docker` du MySQL de prod, et PROD_MEDIA, la source
 * rsync du volume media de prod:
 *
 *   PROD_DB="root@hôte:benevio-db-xxxxxx"
 *   PROD_MEDIA="root@hôte:/var/lib/docker/volumes/<volume>/_data"
 *
 * La copie des médias ne supprime rien: un média local absent de la prod reste servi à un
 * ancien dump qu'on rejouerait.
 *
 * Le nom du conteneur change à chaque redémarrage de la tâche swarm, pas celui du service.
 * Le dump se fait avec l'utilisateur applicatif du conteneur, dont les identifiants ne quittent
 * jamais le serveur.
 */
import { rename } from 'node:fs/promises'

const url = new URL(process.env.DATABASE_URL ?? '')
const database = url.pathname.slice(1)
// La base est détruite avant l'import: ce script ne vise jamais qu'une base de cette machine.
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !database)
	throw new Error(`DATABASE_URL ne vise pas une base locale: ${url.hostname}`)

async function run(cmd: string[], options: { stdin?: Blob; stdout?: string; env?: object } = {}) {
	const proc = Bun.spawn(cmd, {
		stdin: options.stdin ?? 'inherit',
		stdout: options.stdout ? Bun.file(options.stdout) : 'inherit',
		stderr: 'inherit',
		env: { ...process.env, ...options.env },
	})
	if ((await proc.exited) !== 0) throw new Error(`Échec: ${cmd[0]}`)
}

async function dumpProd() {
	const [host, service] = (process.env.PROD_DB ?? '').split(':')
	if (!host || !service) throw new Error('PROD_DB manque dans .env (hôte-ssh:service-docker)')
	const path = `dumps/benevio-${new Date().toLocaleDateString('sv')}.sql`
	const partial = `${path}.part`
	const dump = [
		`docker exec $(docker ps -qf name=^${service}\\.) sh -c`,
		`'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump -u"$MYSQL_USER"`,
		`--single-transaction --no-tablespaces --set-gtid-purged=OFF "$MYSQL_DATABASE"'`,
	].join(' ')
	console.log(`Dump de ${service} sur ${host}…`)
	await run(['ssh', '-C', host, dump], { stdout: partial })
	await rename(partial, path)
	return path
}

async function copyMedia() {
	const source = process.env.PROD_MEDIA
	const target = process.env.MEDIA_DIR
	if (!source || !target) throw new Error('PROD_MEDIA ou MEDIA_DIR manque dans .env')
	console.log(`Copie des médias de ${source}…`)
	await run(['rsync', '-az', `${source.replace(/\/$/, '')}/`, `${target.replace(/\/$/, '')}/`])
}

const path = process.argv[2] ?? (await dumpProd())
if (!process.argv[2]) await copyMedia()
const file = Bun.file(path)
if (!(await file.exists())) throw new Error(`Dump introuvable: ${path}`)

const client = ['mysql', '-h', url.hostname, '-P', url.port || '3306', '-u', url.username]
const env = { MYSQL_PWD: decodeURIComponent(url.password) }

console.log(`Import de ${path} dans ${database}…`)
await run(
	[
		...client,
		'-e',
		`DROP DATABASE IF EXISTS \`${database}\`; CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
	],
	{ env }
)
await run([...client, database], { stdin: file, env })

await run(['bunx', 'prisma', 'migrate', 'deploy'])
