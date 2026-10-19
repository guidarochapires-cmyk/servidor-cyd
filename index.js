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
        
        // URL direta da API do Google Gemini
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

        // Se o Google devolver erro, jogamos o erro direto na tela para saber o que é
        if (data.error) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(400).send(`Erro do Google: ${data.error.message} (Código: ${data.error.code})`);
        }

        // Extrai o texto se tudo deu certo
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const textoLimpo = data.candidates[0].content.parts[0].text.trim();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(textoLimpo);
        } else if (data.candidates && data.candidates.content && data.candidates.content.parts) {
            // Segunda variação de formato da API do Gemini
            const textoLimpo = data.candidates.content.parts.text.trim();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(textoLimpo);
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify(data));

    } catch (error) {
        res.status(500).send(`Erro interno do servidor: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
