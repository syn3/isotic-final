const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint (ВАЖНО для Railway!)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API endpoint
app.post('/send-telegram', async (req, res) => {
  try {
    const { Имя, Телефон, Комментарий } = req.body;

    if (!Имя || !Телефон) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя и телефон обязательны' 
      });
    }

    const message = `
🎯 Новая заявка с сайта Isotic

👤 Имя: ${Имя}
📞 Телефон: ${Телефон}
💬 Комментарий: ${Комментарий || 'Не указан'}
🕒 Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Статические файлы из: ${path.join(__dirname, 'public')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Получен SIGTERM, завершаем работу...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});
