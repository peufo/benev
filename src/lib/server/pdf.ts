/**
 * Le flux web d'un `PDFDocument`, pour une `Response`. Le client peut partir avant la fin:
 * enfiler dans un contrôleur fermé lève, et le document doit alors cesser de produire.
 */
export function pdfStream(doc: PDFKit.PDFDocument): ReadableStream {
	return new ReadableStream({
		start(controller) {
			doc.on('data', (chunk) => {
				try {
					controller.enqueue(chunk)
				} catch {
					doc.removeAllListeners()
				}
			})
			doc.on('end', () => {
				try {
					controller.close()
				} catch {
					// Le flux est déjà clos (client déconnecté): rien à faire
				}
			})
			doc.on('error', (err) => controller.error(err))
		},
		cancel() {
			doc.removeAllListeners('data')
			doc.end()
		},
	})
}
