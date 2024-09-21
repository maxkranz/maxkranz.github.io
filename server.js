const express = require('express');
const axios = require('axios');
const app = express();

const clientID = 'Ov23liFQzRy9qBYLo4Pe'; // Твой Client ID
const clientSecret = '0cf1d3b2da129f7ee16a62728c2299a80722298c'; // Твой Client Secret

// Главная страница
app.get('/', (req, res) => {
  res.send('Главная страница');
});

// Callback URL для получения кода авторизации
app.get('/callback', (req, res) => {
  const requestToken = req.query.code;

  // Запрос на получение access token от GitHub
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    headers: {
      accept: 'application/json'
    }
  }).then((response) => {
    const accessToken = response.data.access_token;
    // Перенаправляем пользователя обратно на главную страницу с токеном
    res.redirect(`/?access_token=${accessToken}`);
  }).catch((error) => {
    console.error('Ошибка при получении токена:', error);
    res.send('Ошибка при авторизации');
  });
});

// Запуск сервера на порту 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
