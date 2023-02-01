# Описание

API позволяет смотреть расписание с сайта КубГТУ в удобной json форме. Расписание хранится в БД, поэтому доступно даже при падении сайта. Если расписанию больше одного дня, оно считается устаревшим и при следующем запросе обновляется автоматически. Если расписание обновилось на сайте, а в базе нет, то есть возможность его обновить принудительно.

# Документация

\* - небязательные поля

---

GET `/schedule` - Получить расписание

| Поля | Описание |
| --- | --- |
| inst_id | ID института |
| group | Имя группы на русском языке |
| day* | Цифра дня от 0 до 6 (0 - воскресенье, 1 - понедельник... 6- суббота) |
| week* | Чётность недели (true - чётная, false - нечётная) |

---

POST `/schedule` - Обновить расписание

| Поля | Описание |
| --- | --- |
| inst_id | ID института |
| group | Имя группы на русском языке |

## Примеры

**Получение расписания на сегодня**

GET `/schedule?inst_id=516&group=22-КБ-ИВ1`

Пример ответа:

```json
{
    "code": 200,
    "schedule": [
        {
            "number": 1,
            "time": "8:00 - 9:30",
            "name": "Линейная алгебра и функция нескольких переменных",
            "paraType": "Лекция",
            "teacher": "Руденко Ольга Валентиновна",
            "auditory": "А-401",
            "flow": true
        }
    ]
}
```
<br>

**Получение расписания в определённый день**

GET `/schedule?inst_id=516&group=22-КБ-ИВ1&day=2&week=true`

Пример ответа:

```json
{
    "code": 200,
    "schedule": [
        {
            "number": 1,
            "time": "8:00 - 9:30",
            "name": "Линейная алгебра и функция нескольких переменных",
            "paraType": "Лекция",
            "teacher": "Руденко Ольга Валентиновна",
            "auditory": "А-401",
            "flow": true
        }
    ]
}
```

<br>

**Получение расписания в определённый день**

GET `/schedule?inst_id=516&group=22-КБ-ИВ1&day=2&week=true`

Пример ответа:

```json
{
    "code": 200,
    "schedule": [
        {
            "number": 1,
            "time": "8:00 - 9:30",
            "name": "Линейная алгебра и функция нескольких переменных",
            "paraType": "Лекция",
            "teacher": "Руденко Ольга Валентиновна",
            "auditory": "А-401",
            "flow": true
        }
    ]
}
```
<br>

**Обновление расписания**

POST `/schedule?inst_id=516&group=22-КБ-ИВ1&day=2&week=true`

Пример ответа:

```json
{
    "code": 200
}
```

<br>

**При ошибках**

```json
{
    "code": 400,
    "message": "Подробности ошибки"
}
```

*На всякий случай, код может быть не только 400!*