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
        const url = `https://googleapis.com{apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: pergunta }] }],
            systemInstruction: {
                parts: [{ text: "Você é um assistente para microcontroladores IoT. Responda em português, com texto puro, curto e sem markdown ou HTML." }]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Se o Google devolver um erro de chave ou cota, mostra direto na tela
        if (data.error) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(400).send(`Erro do Google: ${data.error.message} (Código: ${data.error.code})`);
        }

        // Tenta ler a resposta da IA de forma segura
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const textoLimpo = data.candidates[0].content.parts[0].text.trim();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(textoLimpo);
        }

        // Se o formato vier diferente, mostra o JSON cru para nós investigarmos
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify(data));

    } catch (error) {
        res.status(500).send(`Erro interno do servidor: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
