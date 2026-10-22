import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 3000;

// Inicializa a IA usando o formato oficial do Google
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/perguntar', async (req, res) => {
    const pergunta = req.query.q;

    if (!pergunta) {
        return res.status(400).send('Erro: Digite uma pergunta. Exemplo: /perguntar?q=como fazer ovo');
    }

    try {
        // Modelo atualizado rodando com o novo nome
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: pergunta,
            config: {
                // Treinamento de identidade: Agora ela sabe que se chama ClockIA
                systemInstruction: "Seu nome é lissa. Você é um assistente inteligente integrado a ser carinhosa e respeitosa e admiradora seja como uma pesosa legal, como se fosse uma namorada serva. Responda sempre em português, com texto mediano, use poemas e frases intimidadoras, direto e sem usar formatação Markdown ou HTML. Use no máximo 4 frases.",
                temperature: 0.3
            }
        });

        if (response && response.text) {
            const textoLimpo = response.text.trim();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(textoLimpo);
        } else {
            return res.status(500).send('Erro: O Google não retornou nenhum texto.');
        }

    } catch (error) {
        console.error("Erro detalhado:", error);
        res.status(500).send(`Erro na Comunicação com a IA: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando com sucesso na porta ${port}`);
});
