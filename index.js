import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 3000;

// Inicialização atualizada exigindo explicitamente a chave guardada no Render
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/perguntar', async (req, res) => {
    const pergunta = req.query.q;

    if (!pergunta) {
        return res.status(400).send('Erro: Digite uma pergunta. Exemplo: /perguntar?q=como fazer ovo');
    }

    try {
        // Usando o modelo rápido padrão mais recente
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: pergunta,
            config: {
                // Filtro estrito para o monitor serial do seu CYD
                systemInstruction: 'Você é um assistente para microcontroladores IoT com memória RAM limitada. Responda SEMPRE em texto puro, direto e resumido. NUNCA use formatação Markdown (como asteriscos, hashtags ou listas), NUNCA use HTML, NUNCA use emojis. Use no máximo 2 frases curtas.',
            }
        });

        const textoLimpo = response.text.trim();

        // Envia a resposta como texto simples puro
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(textoLimpo);

    } catch (error) {
        console.error("Erro na IA:", error);
        res.status(500).send('Erro ao processar a resposta da IA.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando com sucesso na porta ${port}`);
});
