import TelegramBot from 'node-telegram-bot-api'
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

const bot = new TelegramBot(TOKEN, { polling: true });



export function startBot () {
    const commands = [
        { command: "/start", description: "Запустить бота" },
        { command: "/help", description: "Помощь" },
        { command: "/webapp", description: "Открыть Web App" }
    ];
    
    // Устанавливаем команды
    bot.setMyCommands(commands).then(() => {
        console.log("Команды успешно установлены!");
    });    
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId, "Привет! Нажми кнопку ниже, чтобы открыть Web App.", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Открыть Web App", web_app: { url: WEB_APP_URL } },{ text: "Записаться на прием", web_app: { url: WEB_APP_URL } }]
                ]
            }
        });
});}