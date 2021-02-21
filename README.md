# Скрипт трансфера данных из заархивированных файлов `json` в базу данных `Mysql`

## Системные требования
```
node v^14.15.4  
yarn v^1.22.10
```
## Установка
Клонируем исходный код из репозитория
```
git clone https://github.com/kolserdav/json-to-mysql.git
```
Переходим в рабочую папку:
```
cd json-to-mysql
```
Устанавливаем зависимости:
```
yarn install
```
Настраиваем файл .env:
```ini
# Url базы Mysql где:
# arch - имя пользователя базы
# 1234 - пароль пользователя
# localhost - хост базы данных
# 3306 - порт сервера базы данных
# json_db - название базы на которую у пользователя есть права
DATABASE_URL=mysql://arch:1234@localhost:3306/json_db
# Полный путь до папки с архивами json файлов
DATA_DIR=/home/kol/Projects/json-to-mysql/data
```
Создаем нужные таблицы из миграций
```
yarn migrate
```
## Запуск
Компилируем typescript
```
yarn build
```
Запускаем
```
yarn start
```

Программа пропарсит нужную директорию, и пойдет по порядку по всем архивам с префиксом `price`. После записи каждого из архивов `price` она разархивирует архив с префиксом `sellers` и записывает его. Таким образом пока все файлы не будут записаны программа будет работать выдавая промежуточные сообщения с ... в конце.