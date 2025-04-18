import { WhatsAppClient } from "./src/core/whatsapp"

const startBot = async () => {
	const whatsapp = new WhatsAppClient({
		reconnectInterval: 5_000,
		qrCodeSize: 'small',
	})

	try {
		await whatsapp.initialize()
	} catch (error) {
		console.error('Erro ao iniciar o bot:', error)
		process.exit(1)
	}
}

startBot()
