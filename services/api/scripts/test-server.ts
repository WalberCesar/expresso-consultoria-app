import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  console.log('✅ Health check received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/test-login', async (req, res) => {
  console.log('✅ Login request received:', req.body);
  
  try {
    res.json({
      success: true,
      message: 'Endpoint alcançado com sucesso',
      receivedData: req.body
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📝 Try: curl http://localhost:${PORT}/health`);
});
