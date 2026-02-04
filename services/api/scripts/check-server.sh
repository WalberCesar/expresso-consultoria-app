#!/bin/bash

echo "🔍 Verificando servidor da API..."
echo ""

# 1. Verificar processo Node rodando
echo "1️⃣ Processos Node.js:"
ps aux | grep -E "node.*server|nodemon|ts-node.*server" | grep -v grep | awk '{print "   PID:", $2, "- Comando:", $11, $12, $13, $14}'

echo ""

# 2. Verificar porta 3000
echo "2️⃣ Porta 3000:"
if lsof -i :3000 | grep LISTEN > /dev/null 2>&1; then
    lsof -i :3000 | grep LISTEN | awk '{print "   ✅ Porta 3000 está em uso - PID:", $2}'
else
    echo "   ❌ Porta 3000 não está em uso"
fi

echo ""

# 3. Testar endpoint de health
echo "3️⃣ Teste de conectividade:"
if curl -s -m 2 http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ API respondendo em http://localhost:3000"
    node -e "
    const http = require('http');
    http.get('http://localhost:3000/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            console.log('   📊 Status:', json.status);
            console.log('   🕐 Timestamp:', json.timestamp);
        });
    }).on('error', () => {});
    " 2>/dev/null
else
    echo "   ❌ API não está respondendo"
fi

echo ""

# 4. Logs recentes
echo "4️⃣ Logs recentes (últimas 5 linhas):"
if [ -f /tmp/api-server.log ]; then
    tail -5 /tmp/api-server.log | sed 's/^/   /'
else
    echo "   ℹ️  Arquivo de log não encontrado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar Docker MySQL
echo "5️⃣ MySQL (Docker):"
if docker ps | grep expresso-mysql > /dev/null 2>&1; then
    echo "   ✅ Container MySQL rodando"
    docker ps | grep expresso-mysql | awk '{print "   🐳 Status:", $7, $8, $9, $10}'
else
    echo "   ❌ Container MySQL não está rodando"
    echo "   💡 Inicie com: cd services/api && docker-compose up -d"
fi
