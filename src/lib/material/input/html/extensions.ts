import { Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'

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
		types: ['heading', 'paragraph'],
		alignments: ['left', 'center', 'right'],
	}),
]
