'''
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let messages = [];
let client;

// Inicializar o cliente do WhatsApp
function initializeWhatsApp() {
    console.log('Inicializando WhatsApp...');
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        // Enviar QR code para o frontend (implementar com Socket.io se necessário)
    });

    client.on('ready', () => {
        console.log('WhatsApp está pronto!');
    });

    client.on('auth_failure', msg => {
        console.error('FALHA NA AUTENTICAÇÃO', msg);
    });

    client.initialize();
}

initializeWhatsApp();

// Rota para obter todas as mensagens
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// Rota para agendar uma nova mensagem
app.post('/api/schedule', (req, res) => {
    const message = req.body;
    message.id = Date.now();
    message.status = 'agendada';
    messages.push(message);
    res.status(201).json(message);
});

// Rota para deletar uma mensagem
app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    messages = messages.filter(msg => msg.id !== parseInt(id));
    res.status(204).send();
});

// Lógica de agendamento com node-cron
cron.schedule('* * * * *', () => {
    console.log('Verificando mensagens agendadas...');
    const now = new Date();

    messages.forEach(async (message) => {
        if (message.status === 'agendada') {
            const messageDate = new Date(`${message.date}T${message.time}`);
            if (messageDate <= now) {
                console.log(`Enviando mensagem: ${message.title}`);
                
                // Lógica para obter os números com base no target
                const numbers = getNumbersByTarget(message.target);

                for (const number of numbers) {
                    try {
                        await client.sendMessage(`${number}@c.us`, message.content);
                        console.log(`Mensagem enviada para ${number}`);
                    } catch (error) {
                        console.error(`Erro ao enviar para ${number}:`, error);
                    }
                }

                message.status = 'enviada';

                // Lógica de repetição
                if (message.recurring !== 'none') {
                    const newDate = new Date(messageDate);
                    if (message.recurring === 'daily') {
                        newDate.setDate(newDate.getDate() + 1);
                    } else if (message.recurring === 'weekly') {
                        newDate.setDate(newDate.getDate() + 7);
                    } else if (message.recurring === 'monthly') {
                        newDate.setMonth(newDate.getMonth() + 1);
                    }
                    message.date = newDate.toISOString().split('T')[0];
                    message.status = 'agendada';
                }
            }
        }
    });
});

function getNumbersByTarget(target) {
    // Simulação - em um caso real, isso viria de um banco de dados
    const meninos = ['5521995014961', '5521983082961']; // Exemplo
    const meninas = ['5521965313503', '5521976042686']; // Exemplo

    if (target === 'meninos') return meninos;
    if (target === 'meninas') return meninas;
    if (target === 'todos') return [...meninos, ...meninas];
    return [];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
'''
