# Schedulify
Okullar için çakışmasız haftalık ders programı oluşturan Flask ve Vanilla JS tabanlı web uygulaması.

Schedulify, okulların haftalık ders programını çakışmasız şekilde otomatik oluşturan hafif ve modüler bir web uygulamasıdır. Backend tarafında Python Flask ve kısıt çözücü algoritmalar yer alırken, frontend tarafında bağımlılıksız Saf JavaScript (Vanilla JS) kullanılır.

## Özellikler

- Okul Kademesi Desteği: İlkokul, ortaokul ve lise seviyelerine göre otomatik sınıf ve ders yapılandırması.
- Toplu Öğretmen Atama: Branş öğretmenlerini ilgili sınıflara tek hamlede atama imkanı.
- Saat Kontrolü: Okulun haftalık kapasitesi ile sınıfların ders saatleri eşleşmediğinde uyarı verme.
- Blok Ders Mantığı: Dersleri 2 saatlik bloklar halinde (örneğin Matematik-Matematik) çizelgeye yerleştirme.
- Dinamik Tablo Oluşturma: Sadece ders ataması yapılan aktif sınıfların programını basma, boş tabloları engelleme.
- Kolay Başlatma Betiği: Linux ortamında otomatik sanal ortam (.venv) kurulumu ve tek tıkla çalıştırma.

## Gereksinimler

- **Python:** 3.10 veya üzeri (Sisteminizde Python'un kurulu ve terminalden erişilebilir olması gerekir).
- **İşletim Sistemi:** Linux / macOS (Windows kullanıcıları WSL2 veya Git Bash üzerinden `baslat.sh` çalıştırabilir).

## Hızlı Başlangıç

Projeyi yerel makinenizde çalıştırmak için terminalden aşağıdaki komutları çalıştırmanız yeterlidir:

```bash
git clone https://github.com/lingitdev/Schedulify.git
cd Schedulify
chmod +x baslat.sh
./baslat.sh
```

baslat.sh betiği gerekli sanal ortamı kuracak, bağımlılıkları yükleyecek, Flask sunucusunu başlatacak ve tarayıcınızı otomatik olarak açacaktır.
Yol Haritası 

    [ ] V2.0: Öğretmenler için boş gün ve kapalı saat kısıtlamaları ekleyebilme paneli.



