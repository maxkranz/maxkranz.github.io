const TelegramBot = require('node-telegram-bot-api');
const { randomInt } = require('crypto');

// Токен и ваш Telegram ID
const token = '8100770156:AAGP7kYQTpxGLUqu_hYDLV1rY4gO1toLCS4';
const myTelegramId = '7051026404';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Хранение состояния игр и сообщений
const games = {};
const lastCommandTime = {}; // Хранение времени последней команды
const messageMode = {}; // Хранение состояния режима отправки сообщений

// Функция для сброса текущего состояния игры
function resetGame(chatId) {
    delete games[chatId];
}

// Функция для проверки времени последней команды
function shouldSendMessage(chatId, delay = 5000) {
    const now = Date.now();
    if (!lastCommandTime[chatId] || now - lastCommandTime[chatId] > delay) {
        lastCommandTime[chatId] = now;
        return true;
    }
    return false;
}

// Команда /start для отображения меню
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Сбрасываем текущую игру и отключаем режим сообщения
    resetGame(chatId);
    messageMode[chatId] = false;

    // Проверяем, прошло ли достаточно времени с последнего отправленного сообщения
    if (shouldSendMessage(chatId)) {
        // Отправляем меню выбора режимов
        bot.sendMessage(chatId, "Привет! Выбери режим игры:\n1. /guesstheword - Угадай слово\n2. /guessthenumber - Угадай число\n3. /message - Отправить сообщение Максу");
    }
});

// Команда /message для отправки сообщений администратору
bot.onText(/\/message/, (msg) => {
    const chatId = msg.chat.id;

    // Сбрасываем текущую игру и активируем режим сообщения
    resetGame(chatId);
    messageMode[chatId] = true;

    bot.sendMessage(chatId, "Введите сообщение, которое вы хотите отправить Максу:");
});

// Команда /guesstheword для игры "Угадай слово"
bot.onText(/\/guesstheword/, (msg) => {
    const chatId = msg.chat.id;

    // Сбрасываем предыдущую игру и отключаем режим сообщения
    resetGame(chatId);
    messageMode[chatId] = false;

    const secretWord = ["программист", "бот", "разработка", "код", "Telegram", "игра", "чат", "питон"][Math.floor(Math.random() * 8)];
    games[chatId] = { game: 'word', secretWord: secretWord, attempts: 0 };

    bot.sendMessage(chatId, "Игра началась! Я загадал слово, связанное с разработкой этого бота. Попробуй угадать!");
});

// Команда /guessthenumber для игры "Угадай число"
bot.onText(/\/guessthenumber/, (msg) => {
    const chatId = msg.chat.id;

    // Сбрасываем предыдущую игру и отключаем режим сообщения
    resetGame(chatId);
    messageMode[chatId] = false;

    const secretNumber = randomInt(1, 101); // Генерация числа от 1 до 100
    games[chatId] = { game: 'number', secretNumber: secretNumber };

    bot.sendMessage(chatId, "Игра началась! Я загадал число от 1 до 100. Попробуй угадать!");
});

// Команда /cancel для выхода из текущей игры
bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;

    if (games[chatId] || messageMode[chatId]) {
        resetGame(chatId);
        messageMode[chatId] = false;
        bot.sendMessage(chatId, "Вы вышли из режима.");
    } else {
        bot.sendMessage(chatId, "Вы не находитесь в игре или режиме.");
    }
});

// Обработка любых сообщений пользователя
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Проверка на режим отправки сообщения
    if (messageMode[chatId]) {
        // Отправка сообщения администратору (тебе)
        bot.sendMessage(myTelegramId, `Сообщение от пользователя @${msg.from.username || 'Неизвестный'}:\n${text}`);
        bot.sendMessage(chatId, "Ваше сообщение было отправлено Максу. Спасибо!");

        // Отключаем режим сообщения
        messageMode[chatId] = false;
    } 
    // Игровая логика
    else if (games[chatId]) {
        const state = games[chatId];

        // Если игра "Угадай число"
        if (state.game === 'number') {
            const guess = parseInt(text);

            if (!isNaN(guess)) {
                const secretNumber = state.secretNumber;

                if (guess < secretNumber) {
                    bot.sendMessage(chatId, "Загаданное число больше.");
                } else if (guess > secretNumber) {
                    bot.sendMessage(chatId, "Загаданное число меньше.");
                } else {
                    bot.sendMessage(chatId, `Поздравляю! Ты угадал число ${secretNumber}!`);
                    resetGame(chatId);
                }
            }

        // Если игра "Угадай слово"
        } else if (state.game === 'word') {
            const secretWord = state.secretWord;
            state.attempts++;

            if (text.toLowerCase() === secretWord) {
                bot.sendMessage(chatId, `Правильно! Ты угадал слово '${secretWord}' за ${state.attempts} попыток!`);
                resetGame(chatId);
            } else {
                bot.sendMessage(chatId, "Неправильно, попробуй еще раз.");
            }
        }

    // Если сообщение не является командой и пользователь не в игре или режиме
    } else if (!text.startsWith('/')) {
        bot.sendMessage(chatId, "Для игры или отправки сообщения выберите режим через команду /start.");
    }
});
