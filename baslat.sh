#!/bin/bash
echo "Schedulify Sunucusu Başlatılıyor..."

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Sanal ortam kontrolü ve otomatik oluşturma
if [ ! -d "$DIR/.venv" ]; then
    echo "Sanal ortam bulunamadı, oluşturuluyor..."
    python3 -m venv "$DIR/.venv"
    "$DIR/.venv/bin/pip" install flask
fi

(sleep 1.5 && (xdg-open http://127.0.0.1:5000 2>/dev/null || open http://127.0.0.1:5000)) &

"$DIR/.venv/bin/python3" "$DIR/backend/server.py"