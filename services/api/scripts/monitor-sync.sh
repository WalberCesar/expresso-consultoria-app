#!/bin/bash

echo "🔍 Monitorando logs do servidor de sincronização..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Faça a sincronização no app mobile agora..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Monitorar logs do servidor
tail -f /tmp/api-server.log | grep --line-buffered -E "SYNC|📥|📤|✅|❌|📊|👤|🔑|⏰|🏢|📋|📦"
