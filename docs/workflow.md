# Логика процесса и состояния

Диаграммы отражают поведение после реализации Q1–Q4, Q6–Q8 и Q10.
Подробности — в контрактах [цикла заявки](application-transactions.md)
и [модерации и перевода](topic-department-contract.md).

## Сквозной сценарий

```mermaid
flowchart TD
    Create["Научрук создаёт Topic: draft"] --> Publish["Завкаф / admin публикует: published"]
    Partner["Завкаф создаёт тему компании"] --> PublishDirect["Сразу published"]
    Publish --> Apply["Студент подаёт Application: pending"]
    PublishDirect --> Apply
    Apply --> Decision{"Решение в области доступа"}
    Decision -->|"Одобрить: проверки лимита и занятости"| Assign["Application: approved; Assignment: active"]
    Decision -->|"Отклонить"| Reject["Application: rejected; cooldown пары"]
    Reject --> Pool["Тема остаётся published"]
    Apply -->|"Срок истёк; отдельная команда или решение"| Expire["Application: expired; тема без изменений; история и уведомление"]
    Assign --> Withdraw["Остальные pending студента: withdrawn"]
    Assign --> Track["Сопровождение: этап, процент, история"]
    Track --> Admit["Допуск: admitted_to_defense; 100%; active"]
    Admit --> Defense["Защита: defended; 100%; completed"]
    Defense --> Archive["Topic: archived; причина completed"]
    Track -. "Сейчас допускается напрямую при 100%" .-> Defense
    Manual["Завкаф / admin: POST /assignments"] -->|"Свободная published-тема; лимит и кафедра"| Assign
```

Ручное назначение создаёт отдельные `Application(approved)` и `Assignment(active)`.
Закрытый период не блокирует это административное действие. Нельзя забрать тему
с чужой pending-заявкой, обойти лимит или второе активное закрепление студента.

## Тема

```mermaid
stateDiagram-v2
    [*] --> draft: обычное создание
    [*] --> published: завкаф создаёт company-тему
    draft --> published: публикация
    draft --> rejected: отклонение
    rejected --> published: повторная публикация
    published --> rejected: нет pending и active закрепления
    draft --> archived: архивирование
    rejected --> archived: архивирование
    published --> archived: архивирование / защита
    archived --> [*]
```

Возврат в `draft` и модерация уже архивной темы запрещены. Научрук отправляет
запрос на архивирование; завкаф/admin принимает решение. Прямой
`PATCH /topics/{id}/status` и одобрение запроса архивирования запрещают
`archived`/`rejected` при любой pending-заявке или active-закреплении.
Прошедший срок pending не снимает запрет до перехода заявки в терминальный статус.
При отказе тема, запрос и события не меняются; подробности в
[контракте модерации и перевода](topic-department-contract.md).
Архивирование не является физическим удалением.

## Заявка

```mermaid
stateDiagram-v2
    [*] --> pending: подача студентом
    [*] --> approved: ручное назначение кафедрой
    pending --> approved: одобрение
    pending --> rejected: отказ с cooldown
    pending --> expired: срок и отдельная команда или решение
    pending --> withdrawn: закрепление другой темы
    approved --> [*]
    rejected --> [*]
    expired --> [*]
    withdrawn --> [*]
```

- До закрепления студент может иметь pending-заявки на разные темы.
- На одну тему допускается одна активная заявка (`pending` или `approved`).
- После закрепления остальные pending студента автоматически становятся withdrawn,
  включая просроченные заявки, ещё не обработанные командой истечения.
- Самостоятельного отзыва заявки студентом через API нет.
- Срок решения и cooldown после отказа используют одну настройку
  `APPLICATION_DECISION_TIMEOUT_MINUTES`. В шаблоне и fallback кода — 2 минуты;
  для демонстрации README рекомендует 20160 минут (14 дней).
- Истечение выполняется отдельной командой либо локально при решении целевой
  заявки. GET, подача и ручное назначение не запускают глобальную очистку.
  Только pending становится expired; тема сохраняется, история и уведомление
  создаются один раз. Фонового расписания нет.

## Закрепление и прогресс

`Assignment.status` (`active`, `completed`, `cancelled`) и `current_stage` —
разные поля. Ниже показаны этапы; отмена закрепления ещё не имеет рабочего API.

```mermaid
stateDiagram-v2
    [*] --> in_progress: создание закрепления
    in_progress --> under_review: научрук
    under_review --> in_progress: научрук
    in_progress --> admitted_to_defense: принудительно 100 процентов
    under_review --> admitted_to_defense: принудительно 100 процентов
    admitted_to_defense --> defended: научрук, 100 процентов
    admitted_to_defense --> under_review: admin / завкаф, причина и аудит
    in_progress --> defended: сейчас разрешено при 100 процентах
    under_review --> defended: сейчас разрешено при 100 процентах
    defended --> [*]: completed и архив темы
```

Повторное обновление внутри одного незавершённого этапа допускается. Обычным
PATCH прогресса нельзя вернуть допущенную работу на предыдущий этап.
Отзыв допуска — отдельный `POST /assignments/{id}/revoke-admission`; сохраняет
100%, автора и причину, переводит в `under_review`. После `defended` обновление
прогресса и отзыв допуска запрещены.

Переход непосредственно к `defended` из первых этапов разрешён текущим кодом
и проверяется существующими тестами. Владелец согласовал обязательный допуск;
код и тестовые ожидания ещё требуют изменения — R05 в [ревью](backend-review-appts.md).

## Согласованные правила, ожидающие реализации

- Q5/Q9/Q11. Защита после допуска при активном закреплении и 100%,
  роль nauchruk и владение работой. После отзыва требуется повторный допуск.
- Q12. Инвентаризация старых pending без срока, общий льготный срок
  T0 + 14 дней, отдельный аудит и условный CHECK.

Подробные критерии приёмки — в [обзоре backend](backend-review-appts.md).
