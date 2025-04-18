import type { proto } from 'baileys';
import type { Command } from '../../@types/command';
import type { Socket } from '../../@types/socket';
import { supabase } from '../../services/supabase';

type ProductResult = {
	id: string
	created_at: string
	name: string
	category?: string
	subcategory?: string
	price: number
	unit?: string
}


const COMMAND_KEY = '!buscar';

const getProductByNameCommand = (socket: Socket): Command => ({
	name: 'buscar',
	description: `Buscar um produto no sistema. Uso: ${COMMAND_KEY} nome_do_produto`,
	execute: async (message) => {
		const sender = message.key.remoteJid;

		if (!sender) {
			console.error('Sender não encontrado na mensagem');
			return;
		}

		const productName = getProductName(message);

		if (!productName) {
			await sendErrorMessage(socket, sender, 'Por favor, forneça o nome do produto após !buscar');
			return;
		}

		try {
			const { data, error } = await getProducts(productName);

			if (error) {
				await sendErrorMessage(socket, sender, `Erro ao buscar produtos: ${error.message}`);
				console.error('Erro na consulta ao Supabase:', error);
				return;
			}

			if (!data || data.length === 0) {
				await sendErrorMessage(socket, sender, 'Nenhum produto encontrado com esse nome');
				return;
			}

			await sendSuccessMenssage(socket, sender, data)

		} catch (error) {
			await sendErrorMessage(socket, sender, 'Erro inesperado ao processar comando');
			console.error('Erro no comando buscar:', error);
		}
	},
});

const getProductName = (message: proto.IWebMessageInfo): string => {
	return (
		message.message?.conversation ||
		message.message?.extendedTextMessage?.text ||
		''
	)
		.replace(COMMAND_KEY, '')
		.trim();
};

const getProducts = async (query: string) => {
	const { data, error } = await supabase
		.from('products')
		.select('id, created_at, name, category, subcategory, price, unit')
		.ilike('name', `%${query}%`);

	return { data, error };
};

const sendSuccessMenssage = async (socket: Socket, sender: string, data: ProductResult[]) => {
	const response = data
		.map((product) => {
			const subcategory = product.subcategory ? ` (${product.subcategory})` : '';

			const unit = product.unit ? ` por ${product.unit}` : '';
			return `📦 *${product.name}* (${product.category}${subcategory})\n💵 Preço: R$ ${product.price.toFixed(2).replace('.', ',')}${unit}`;
		})
		.join('\n\n');

	await socket.sendMessage(sender, {
		text: `✅ Produtos encontrados:\n${response}`,
	});
}

const sendErrorMessage = async (socket: Socket, sender: string, message: string) => {
	await socket.sendMessage(sender, {
		text: `❌ ${message}`,
	});
};

export { getProductByNameCommand };