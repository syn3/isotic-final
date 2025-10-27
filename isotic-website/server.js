const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // для отдачи статических файлов

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Telegram endpoint
app.post('/send-telegram', async (req, res) => {
  try {
    const { Имя, Телефон, Комментарий } = req.body;

    // Валидация
    if (!Имя || !Телефон) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя и телефон обязательны' 
      });
    }

    // Формируем сообщение
    const message = `
🎯 Новая заявка с сайта Isotic

👤 Имя: ${Имя}
📞 Телефон: ${Телефон}
💬 Комментарий: ${Комментарий || 'Не указан'}
🕒 Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    // Отправка в Telegram
    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }
    );

    console.log('✅ Заявка отправлена:', { Имя, Телефон });

    res.json({ 
      success: true, 
      message: 'Заявка успешно отправлена' 
    });

  } catch (error) {
    console.error('❌ Ошибка отправки:', error.response?.data || error.message);
    
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отправке заявки' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});