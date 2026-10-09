/**
 * Dépose les vidéos de démo dans `MEDIA_DIR/demos` de chaque environnement et écrit leurs URL
 * dans `src/lib/landing/videos.json`. L'app les sert par `/media/demos/[file]`.
 *
 *   bun run demo:publish              # la sortie de cademo (`demos/.out/videos`)
 *   bun run demo:publish <dossier>    # un autre dossier de `<id>.mp4` / `<id>.jpg`
 *
 * Les vidéos ne sont pas versionnées: un MP4 ne se compresse pas en delta, et chaque
 * régénération ajouterait son poids entier à l'historique. Seul le manifeste l'est.
 *
 * Le nom porte le hash du contenu, ce qui permet un cache immuable: une vidéo refaite reçoit
 * une nouvelle URL, une vidéo inchangée n'est pas renvoyée. Le manifeste est fusionné, pour
 * qu'une seule démo puisse être republiée sans toucher aux autres.
 *
 * Lit dans `.env` DEMO_TARGETS: les destinations rsync, séparées par des espaces, une par
 * environnement. Les volumes de dev et de prod sont distincts, et la cible locale rend les
 * démos jouables en `bun run dev`:
 *
 *   DEMO_TARGETS="./media/demos root@hôte:/chemin/du/volume/main/demos root@hôte:/…/dev/demos"
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const MANIFEST = 'src/lib/landing/videos.json'
const URL_PREFIX = '/media/demos'

const targets = (process.env.DEMO_TARGETS ?? '').split(/\s+/).filter(Boolean)
if (!targets.length) throw new Error('DEMO_TARGETS manque dans .env')
const dir = process.argv[2] ?? 'demos/.out/videos'

type Entry = { video: string; poster?: string }
const manifest: Record<string, Entry> = JSON.parse(await readFile(MANIFEST, 'utf8'))

async function run(cmd: string[]) {
	const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'inherit' })
	const out = await new Response(proc.stdout).text()
	if ((await proc.exited) !== 0) throw new Error(`Échec: ${cmd.join(' ')}`)
	return out
}

/** `hôte:chemin` pour une cible distante; un chemin local n'a pas de `:` avant son premier `/`. */
function splitRemote(target: string) {
	const i = target.indexOf(':')
	if (i < 0 || target.slice(0, i).includes('/')) return null
	return { host: target.slice(0, i), path: target.slice(i + 1) }
}

// openrsync, celui de macOS, n'a pas `--mkpath`.
for (const target of targets) {
	const remote = splitRemote(target)
	if (remote) await run(['ssh', remote.host, 'mkdir', '-p', remote.path])
	else await mkdir(target, { recursive: true })
}

/** Envoie le fichier là où il manque, et rend son URL. */
async function publish(path: string, id: string, ext: string) {
	const content = await readFile(path)
	const hash = createHash('sha256').update(content).digest('hex').slice(0, 8)
	const name = `${id}.${hash}.${ext}`
	for (const target of targets) {
		const out = await run([
			'rsync',
			'--ignore-existing',
			'--chmod=Fu=rw,go=r',
			'--itemize-changes',
			path,
			`${target.replace(/\/$/, '')}/${name}`,
		])
		// `--itemize-changes` n'écrit rien quand le fichier était déjà là.
		console.log(`${out.trim() ? '+' : '='} ${target} ${name}`)
	}
	return `${URL_PREFIX}/${name}`
}

const files = new Set(await readdir(dir).catch(() => []))
const ids = [...files].filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4))
if (!ids.length) throw new Error(`Aucune vidéo dans ${dir}: lancer d'abord \`bun run demo\``)

for (const id of ids.sort()) {
	const video = await publish(join(dir, `${id}.mp4`), id, 'mp4')
	const poster = files.has(`${id}.jpg`)
		? await publish(join(dir, `${id}.jpg`), id, 'jpg')
		: undefined
	manifest[id] = poster ? { video, poster } : { video }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)))
await writeFile(MANIFEST, JSON.stringify(sorted, null, '\t') + '\n')
console.log(`${ids.length} démo(s) dans ${MANIFEST}`)
