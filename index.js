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
        // Usando o SDK oficial do Google para evitar o erro de rede do "fetch failed"
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: pergunta,
            config: {
                systemInstruction: "Você é um assistente para microcontroladores IoT. Responda em português, com texto puro, muito curto, direto e sem usar formatação Markdown ou HTML. Use no máximo 2 frases.",
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
        // Se a sua chave estiver errada ou faltar algo, ele vai cuspir o motivo real aqui
        res.status(500).send(`Erro na Comunicação com a IA: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando com sucesso na porta ${port}`);
});
