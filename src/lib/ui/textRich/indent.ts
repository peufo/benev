import { Extension, type CommandProps } from '@tiptap/core'
import { TextSelection, AllSelection, Transaction } from '@tiptap/pm/state'

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		indent: {
			indent: () => ReturnType
			outdent: () => ReturnType
		}
	}
}

const clamp = (val: number, min: number, max: number) => {
	if (val < min) return min
	if (val > max) return max
	return val
}

const INDENT_OPTIONS = {
	min: 0,
	max: 150,
	more: 10,
	less: -10,
}

const nodeNameList = ['bullet_list', 'order_list', 'todo_list']
const nodeNameText = ['paragraph', 'heading']

function setNodeIndentMarkup(tr: Transaction, pos: number, delta: number) {
	if (!tr.doc) return tr

	const node = tr.doc.nodeAt(pos)
	if (!node) return tr

	const minIndent = INDENT_OPTIONS.min
	const maxIndent = INDENT_OPTIONS.max

	const indent = clamp((node.attrs.indent || 0) + delta, minIndent, maxIndent)

	if (indent === node.attrs.indent) return tr

	const nodeAttrs = {
		...node.attrs,
		indent,
	}

	return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks)
}

const updateIndentLevel = (tr: Transaction, delta: number) => {
	const { doc, selection } = tr

	if (!doc || !selection) return tr

	if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
		return tr
	}

	const { from, to } = selection

	doc.nodesBetween(from, to, (node, pos) => {
		const nodeName = node.type.name
		if (nodeNameList.includes(nodeName)) return false
		if (nodeNameText.includes(nodeName)) {
			tr = setNodeIndentMarkup(tr, pos, delta)
			return false
		}

		return true
	})

	return tr
}

export const Indent = Extension.create({
	name: 'indent',

	addOptions: () => ({
		types: ['heading', 'paragraph'],
		defaultIndentLevel: 0,
	}),

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					indent: {
						default: this.options.defaultIndentLevel,
						renderHTML: (attributes) => {
							if (attributes.indent === 0) return {}
							return {
								style: `margin-left: ${attributes.indent}mm;`,
							}
						},
						parseHTML: (element) =>
							parseInt(element.style.marginLeft) || this.options.defaultIndentLevel,
					},
				},
			},
		]
	},

	addCommands() {
		const createCommand =
			(transaction: (tr: Transaction) => Transaction) =>
			({ tr, dispatch, editor, state, chain }: CommandProps) => {
				tr = tr.setSelection(state.selection)
				tr = transaction(tr)
				if (tr.docChanged) {
					if (dispatch) dispatch(tr)
					return true
				}
				editor.chain().focus().run()
				return false
			}

		return {
			indent: () => createCommand((tr) => updateIndentLevel(tr, INDENT_OPTIONS.more)),
			outdent: () => createCommand((tr) => updateIndentLevel(tr, INDENT_OPTIONS.less)),
		}
	},

	addKeyboardShortcuts() {
		const createShortcuts = (fn: () => boolean) => () => {
			if (this.editor.isActive('bulletList')) return false
			if (this.editor.isActive('orderedList')) return false
			return fn()
		}

		return {
			Tab: createShortcuts(() => this.editor.commands.indent()),
			'Ctrl-q': createShortcuts(() => this.editor.commands.indent()),
			'Shift-Tab': createShortcuts(() => this.editor.commands.outdent()),
		}
	},
})
