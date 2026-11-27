import { Briefcase, FilePenLine, Headphones, List, Settings } from 'lucide-react';
import { useState } from 'react';
import type { StudentData } from '../../entities/student/student';
import { Heading } from './StudentComponents';
import './StudentSupportPage.css';
export function StudentSupportPage({ data, navigate }: {
    data: StudentData;
    navigate: (p: string) => void;
}) {
    const items = [{ title: 'Выбор темы', text: 'Как найти подходящую тему в каталоге', page: 'catalog', Icon: List }, { title: 'Мои заявки', text: 'Где посмотреть статус поданной заявки', page: 'applications', Icon: FilePenLine }, { title: 'Моя работа', text: 'Где посмотреть сводку по вашей ВКР', page: 'my-work', Icon: Briefcase }, { title: 'Этапы ВКР', text: 'Как читать статусы этапов', page: 'stages', Icon: List }, { title: 'Технические вопросы', text: 'Что делать, если страница не загружается', page: '', Icon: Settings }];
    const [show, setShow] = useState(false);
    return <>
        <Heading title="Поддержка"/>
        <h3>Контакты для обращения
        </h3>
        <div className="st-card st-contact">
            {[['Канал обращения', data.support.channel], ['Контакт', data.support.contact], ['Время работы', data.support.hours]].map(([k, v]) => <div key={k}>
                <span>
                    {k}
                </span>
                <span>
                    {v || 'Будет указан проектной командой'}
                </span>
            </div>)}
        </div>
        <h3>Частые вопросы по разделам
        </h3>
        <div className="st-topic-grid">
            {items.map(({ title, text, page, Icon }) => <article className="st-card st-help" key={title}>
                <Icon />
                <h3>
                    {title}
                </h3>
                <p>
                    {text}
                </p>
                <button className="st-link" onClick={() => page ? navigate(page) : setShow(true)}>
                    {page ? 'Открыть раздел →' : 'Обратитесь в поддержку'}
                </button>
            </article>)}
        </div>
        <h3>Как получить помощь
        </h3>
        <div className="st-card st-steps">
            {['Найдите нужный раздел в меню слева.', 'Проверьте статус заявки или этапа.', 'Если ответа нет, обратитесь в поддержку.'].map((s, i) => <p key={s}>
                <b>
                    {i + 1}
                </b>
                {s}
            </p>)}
        </div>
        <button className="st-primary st-support-button" onClick={() => setShow(true)}>
            <Headphones size={18}/>Обратиться в поддержку
        </button>
        {show && <p role="status">
            {data.support.contact || 'Контакты поддержки пока не указаны.'}
        </p>}
    </>;
}
