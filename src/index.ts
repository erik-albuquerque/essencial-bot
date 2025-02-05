import { supabase } from './lib/supabase'

const testConnection = async () => {
	const { data, error } = await supabase.from('matches').select('*')

	if (error) {
		console.error('Erro ao conectar com o Supabase:', error)
	} else {
		console.log('Conexão com o Supabase bem-sucedida:', data)
	}
}

testConnection()
