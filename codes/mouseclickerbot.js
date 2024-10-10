
const TelegramBot = require('node-telegram-bot-api');

// Укажи токен бота, полученный у BotFather
const token = '7844339314:AAFuaDyTZlrQxmbAWWKqRYom8zfPXpsNR7c';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обрабатываем команду /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Отправляем сообщение с кнопкой
    bot.sendMessage(chatId, "'Один браконьер заковал мышонка в клетку... Хотя, зачем я вам рассказываю?' - сказал однажды дедушка своим внукам. - 'Вы узнаете сами... '", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Играть', // Название кнопки
                        web_app: { url: 'https://maxkranz.github.io/ru/games/mouse' } // URL игры
                    }
                ]
            ]
        }
    });
});

