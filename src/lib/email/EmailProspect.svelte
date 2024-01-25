<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import jonas from '$lib/assets/jonas.png'

	import { features } from '$lib/features'
	import { domain } from '.'

	export let appellation = ''

	function ensureDomain(route: string) {
		return domain + route.replace(domain, '')
	}
</script>

<EmailLayout showLogo title="benev.io" subtitle="Votre nouvelle plateforme de gestion de bénévole">
	<p>
		Bonjour cher·e organisateur·rice{appellation ? ` ${appellation}` : ''}, 👋 <br />
	</p>

	<p>Nous avons mis en place la plateforme idéale pour la gestion de vos bénévoles.</p>

	<div style="text-align: center; margin: 3rem 0;">
		<a
			href={domain}
			style="display: inline-block; background: #0d3b66; border-radius: 0.6rem;  padding: 0.8rem 1.5rem; color: white; text-decoration: none; text-transform: uppercase;"
		>
			Découvrir maintenant
		</a>
	</div>

	<p>Vous y trouverez toutes les fonctionnalités essentielles à votre évènement.</p>

	<table width="100%" style="border-collapse: separate; " cellspacing="0" cellpadding="0">
		<tbody>
			{#each Array(5).fill(0) as row, index}
				<tr>
					{#each features.slice(index * 2, (index + 1) * 2) as { name, src }}
						<td style="padding: 1.2rem 0.2rem;" align="right">
							<img
								src="{domain}{src}"
								alt="Icon de fonctionalitée"
								style="height: 28px; width: 28px; opacity: 0.8; display: inline;"
							/>
						</td>
						<td style="vertical-align: middle; padding-left: 0.5rem;">
							<span style="font-size: 0.8rem;">{name}</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<p>Nous sommes disponibles pour répondre à toutes vos questions.</p>

	<svelte:fragment slot="signature">
		<hr style="border:none;border-top:1px solid #eaeaea;margin:26px 0;width:100%" />

		<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate;">
			<tbody>
				<tr>
					<td style="vertical-align: middle; width: 80px;">
						<img
							src={ensureDomain(jonas)}
							alt="Portrait de Jonas Voisard"
							style="height: 65px; width: 65px; border-radius: 8px;"
						/>
					</td>
					<td style="vertical-align: middle; color:#666666;font-size:14px;line-height:24px;">
						<div>
							<b>Jonas Voisard,</b> créateur et développeur de
							<a href={domain} style="color:#067df7; text-decoration:none" target="_blank">
								benev.io
							</a><br />
							<span>Email: <a href="mailto:salut@benev.io">salut@benev.io</a></span><br />

							<span>Tél: <a href="tel:0041794591563">+41 79 459 15 63</a></span>
						</div>
					</td>
				</tr>
				<tr>
					<td colspan="2" style="padding: 1.2rem 0;">
						<a href="https://github.com/peufo" title="Github de Jonas Voisard">
							<img
								src="{domain}/icons/github.png"
								alt="Logo de github"
								style="height: 30px; width: 30px; display: inline; margin-right: 0.4rem;"
							/>
						</a>
						<a href="https://wa.me/41795491563" title="Watsapp de Jonas Voisard">
							<img
								src="{domain}/icons/whatsapp.png"
								alt="Logo de Whatsapp"
								style="height: 30px; width: 30px; display: inline; margin-right: 0.4rem;"
							/>
						</a>
						<a href="mailto:salut@benev.io" title="Contacter salut@benev.io">
							<img
								src="{domain}/icons/email-outline.png"
								alt="Icon email"
								style="height: 30px; width: 30px; display: inline; margin-right: 0.4rem;"
							/>
						</a>
					</td>
				</tr>
			</tbody>
		</table>
	</svelte:fragment>
</EmailLayout>
