import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 3000;

// Inicializa a API do Gemini buscando a chave oculta que colocaremos no Render
const ai = new GoogleGenAI();

app.get('/perguntar', async (req, res) => {
    const pergunta = req.query.q;

    if (!pergunta) {
        return res.status(400).send('Erro: Digite uma pergunta. Exemplo: /perguntar?q=como fazer ovo');
    }

    try {
        // Modelo leve, extremamente rápido e atualizado
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: pergunta,
            config: {
                // Instrução secreta do sistema: força a IA a responder apenas texto curto e limpo
                systemInstruction: 'Você é um assistente para microcontroladores IoT com memória RAM muito limitada. Responda SEMPRE em texto puro, direto e resumido. NUNCA use formatação Markdown (como asteriscos, hashtags ou listas), NUNCA use HTML, NUNCA use emojis. Use no máximo 2 frases curtas.',
                temperature: 0.3,
            }
        });

        const textoLimpo = response.text.trim();

        // Configura o cabeçalho para texto simples, assim o ESP32 lê direto sem decodificar nada
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(textoLimpo);

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a resposta da IA.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando com sucesso na porta ${port}`);
});
