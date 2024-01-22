<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import jonas from '$lib/assets/jonas.png'

	import { features } from '$lib/features'
	import { domain } from '.'
	import { mdiEmailOutline, mdiGithub, mdiLinkedin, mdiWhatsapp } from '@mdi/js'
	import { Icon } from '$lib/material'
</script>

<EmailLayout showLogo title="benev.io" subtitle="Votre nouvelle plateforme de gestion de bénévole">
	<p>
		Bonjour cher·e organisateur·rice, 👋 <br />
	</p>

	<p>Nous avons mis en place la plateforme idéale pour la gestion de vos bénévoles.</p>

	<div style="text-align: center; margin: 3rem 0;">
		<a
			href={domain}
			style="display: inline-block; background: #0d3b66; border-radius: 0.6rem;  padding: 0.8rem 1.5rem; color: white; text-decoration: none; text-transform: uppercase;"
		>
			Découvrez la maintenant
		</a>
	</div>

	<p>Vous y trouverez toutes les fonctionnalités essentielles pour votre gestion.</p>

	<table
		style="border-collapse: separate; border: 1px solid #ddd; padding: 1.2rem 0.6rem; border-radius: 0.5rem; "
	>
		<tbody>
			<tr>
				{#each features.slice(0, 3) as { name, icon }}
					<td colspan="2" style="text-align: center; padding-bottom: 1rem; width: 33%;">
						<Icon path={icon} style="opacity: 0.6; margin-bottom: 0.8rem; display: block;" />
						<span style="font-size: 0.8rem;">{name}</span>
					</td>
				{/each}
			</tr>
			<tr>
				{#each features.slice(3, 6) as { name, icon }}
					<td colspan="2" style="text-align: center; padding-bottom: 1rem; width: 33%;">
						<Icon path={icon} style="opacity: 0.6; margin-bottom: 0.8rem; display: block;" />
						<span style="font-size: 0.8rem;">{name}</span>
					</td>
				{/each}
			</tr>
			<tr>
				{#each features.slice(6) as { name, icon }}
					<td colspan="2" style="text-align: center; padding-bottom: 1rem; width: 33%;">
						<Icon path={icon} style="opacity: 0.6; margin-bottom: 0.8rem; display: block;" />
						<span style="font-size: 0.8rem;">{name}</span>
					</td>
				{/each}
			</tr>
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
							src="{domain}{jonas}"
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
					<td colspan="2">
						<a
							href="https://www.linkedin.com/in/jonas-voisard-591419aa/"
							title="LinkedIn de Jonas Voisard"
						>
							<Icon
								path={mdiLinkedin}
								style="display: inline; opacity: 0.7; margin-right: 0.4rem;"
								size={30}
							/>
						</a>
						<a href="https://github.com/peufo" title="Github de Jonas Voisard">
							<Icon
								path={mdiGithub}
								style="display: inline; opacity: 0.7; margin-right: 0.4rem;"
								size={30}
							/>
						</a>
						<a href="https://wa.me/0041795491563" title="Watsapp de Jonas Voisard">
							<Icon
								path={mdiWhatsapp}
								style="display: inline; opacity: 0.7; margin-right: 0.4rem;"
								size={30}
							/>
						</a>
						<a href="mailto://salut@benev.io" title="Contacter salut@benev.io">
							<Icon
								path={mdiEmailOutline}
								style="display: inline; opacity: 0.7; margin-right: 0.4rem;"
								size={30}
							/>
						</a>
					</td>
				</tr>
			</tbody>
		</table>
	</svelte:fragment>
</EmailLayout>
