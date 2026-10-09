/**
 * Bascule une dépendance maison entre son checkout voisin et le registre npm.
 *
 *   bun run fuma:local     # lie ../fuma: `bun run package:watch` là-bas se voit ici en direct
 *   bun run fuma:npm       # revient à la dernière version publiée
 *   bun run cademo:local   # construit ../cademo, l'empaquette et installe l'archive
 *   bun run cademo:npm
 *
 * Le mode local se fait de l'une de deux façons, jamais par `file:../<paquet>`: bun y recopie le
 * checkout entier au moment de l'installation, `node_modules` compris, ce qui n'a ni le direct
 * d'un lien ni la propreté d'une archive.
 *
 * - `link`: un lien symbolique vers le checkout. Ses dépendances se résolvent depuis son propre
 *   `node_modules`; pour fuma, le `resolve.dedupe` de `vite.config.ts` ramène kit, svelte et zod
 *   aux copies de benev.
 * - `pack`: l'archive que produirait `npm publish`, sans autre fichier que les `files` du paquet.
 *   Pour cademo, un lien ferait charger un second playwright, qui ne reconnaît pas les objets de
 *   celui de benev. Une modification demande de relancer `bun run cademo:local`.
 *
 * Seul le mode npm peut être commité: la CI n'a pas de checkout voisin, et un garde-fou y refuse
 * toute dépendance pointant hors du registre.
 */
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

type Local = {
	/** Le checkout voisin. */
	dir: string
	/** Le script du checkout qui produit ce que le paquet publie. */
	build: string
	via: 'link' | 'pack'
	dev: boolean
}

const packages: Record<string, Local> = {
	fuma: { dir: '../fuma', build: 'package', via: 'link', dev: false },
	cademo: { dir: '../cademo', build: 'build', via: 'pack', dev: true },
}

const [name, mode] = process.argv.slice(2)
const pkg = packages[name]
if (!pkg || (mode !== 'local' && mode !== 'npm')) {
	console.error(
		`Usage: bun scripts/use-package.ts <${Object.keys(packages).join('|')}> <local|npm>`
	)
	process.exit(1)
}

async function run(cmd: string[], cwd = '.') {
	console.log(`$ ${cmd.join(' ')}${cwd === '.' ? '' : `   (${cwd})`}`)
	const proc = Bun.spawn(cmd, { cwd, stdout: 'inherit', stderr: 'inherit' })
	if ((await proc.exited) !== 0) process.exit(1)
}

const flag = pkg.dev ? ['-d'] : []

if (mode === 'npm') {
	// Sans ce retrait, bun laisse en place le lien symbolique du mode local quand la version
	// publiée est celle du checkout.
	await run(['bun', 'remove', name])
	await run(['bun', 'add', ...flag, `${name}@latest`])
} else if (pkg.via === 'link') {
	// Le lien pointe sur un `dist/` qui doit exister avant le premier `package:watch`.
	await run(['bun', 'run', pkg.build], pkg.dir)
	await run(['bun', 'link'], pkg.dir)
	await run(['bun', 'add', ...flag, `${name}@link:${name}`])
} else {
	const archive = join('.pack', `${name}.tgz`)
	await run(['bun', 'run', pkg.build], pkg.dir)
	await mkdir(join(pkg.dir, '.pack'), { recursive: true })
	await run(['bun', 'pm', 'pack', '--filename', archive], pkg.dir)
	// Le chemin de l'archive ne change pas d'une construction à l'autre: sans ce retrait, bun
	// garde la version déjà installée.
	await run(['bun', 'remove', name])
	await run(['bun', 'add', ...flag, join(pkg.dir, archive)])
}
