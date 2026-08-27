import { ORIGIN } from '$app/env/public'
import type { Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Mention from '@tiptap/extension-mention'
import { Indent } from '$lib/ui/textRich/indent.js'
import { suggestion } from '$lib/ui/textRich/suggestion.svelte.js'

export const extensions: Extensions = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] },
	}),
	Link.configure({
		protocols: ['tel', 'mailto'],
	}),
	TextStyle,
	Color,
	Highlight.configure({
		multicolor: true,
	}),
	TextAlign.configure({
		types: ['heading', 'paragraph', 'image'],
		alignments: ['left', 'center', 'right'],
	}),
	Placeholder.configure({
		placeholder: 'Write here ...',
	}),
	Indent,
	Image.configure({
		HTMLAttributes: {
			class: 'mx-auto',
		},
	}),
	Youtube.configure({
		// @ts-expect-error: `width` accepte une chaîne, la déclaration de types dit `number`
		width: '100%',
		height: 360,
		nocookie: true,
		origin: ORIGIN,
		modestBranding: true,
		HTMLAttributes: {
			class: 'mx-auto rounded',
		},
	}),
	Mention.configure({
		suggestion,
		renderHTML({ node }) {
			return [
				'span',
				{
					class: 'suggestion',
					'data-key': node.attrs.id,
				},
				node.attrs.label ?? node.attrs.id,
			]
		},
	}),
]
