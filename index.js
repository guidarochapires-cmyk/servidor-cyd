import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/perguntar', async (req, res) => {
    const pergunta = req.query.q;

    if (!pergunta) {
        return res.status(400).send('Erro: Digite uma pergunta. Exemplo: /perguntar?q=como fazer ovo');
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // URL direta da API do Google, sem depender de bibliotecas externas
        const url = `https://googleapis.com{apiKey}`;

        // Corpo da requisição com o treinamento estrito para o seu CYD
        const payload = {
            contents: [{ parts: [{ text: pergunta }] }],
            systemInstruction: {
                parts: [{ text: "Você é um assistente para microcontroladores IoT com memória RAM limitada. Responda SEMPRE em português, com texto puro, direto e resumido. NUNCA use formatação Markdown (como asteriscos, hashtags ou listas), NUNCA use HTML, NUNCA use emojis. Use no máximo 2 frases curtas." }]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Extrai o texto de dentro da estrutura do Google
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const textoLimpo = data.candidates[0].content.parts[0].text.trim();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(textoLimpo);
        } else {
            console.error("Resposta inesperada do Google:", data);
            return res.status(500).send('Erro: Resposta invalida da IA. Verifique sua Chave API.');
        }

    } catch (error) {
        console.error("Erro interno:", error);
        res.status(500).send('Erro ao processar a resposta da IA.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando com sucesso na porta ${port}`);
});
