export type Testimonial = {
	name: string
	role: string
	eventName: string
	eventUrl: string
	volunteersCount: string
	quote: string
	image: string
}

export const testimonials: Testimonial[] = [
	{
		name: 'Nicole',
		role: 'Responsable',
		eventName: 'Dritchino open air Festival',
		eventUrl: 'https://www.dritchino.ch/',
		volunteersCount: '> 500 bénévoles',
		quote:
			"J'ai choisi cette plate-forme pour sa simplicité et son efficacité dans la gestion des bénévoles. Elle a largement répondu à mes attentes et a amélioré notre organisation au quotidien. Je suis très satisfaite du résultat et je recommande vivement cette solution à toute structure travaillant avec des bénévoles.",
		image: '/images/testimonials/nicole.webp',
	},
	{
		name: 'Valérie',
		role: 'Responsable',
		eventName: 'Spiegelberg',
		eventUrl: 'https://www.spiegelbergfestival.com/',
		volunteersCount: '> 200 bénévoles',
		quote:
			"Une écoute qu'on ne trouve pas ailleurs. J'ai suggéré une amélioration et elle a été intégrée super vite. C'est agréable de voir un outil évoluer avec nous. La prise en main a été immédiate. On n'a même pas eu besoin de former nos équipes, tout est logique et fluide. Un gain de temps énorme.",
		image: '/images/testimonials/valerie.webp',
	},
]
