import { Info } from 'lucide-react';
import { useState } from 'react';
import type { Application, StudentData } from '../../entities/student/student';
import './StudentApplicationsPage.css';
import { Drawer, Filter, Heading, SearchBox, StatusBadge, labels, shortName, type Status } from './StudentComponents';
export function StudentApplicationsPage({ data }: {
    data: StudentData;
}) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [selected, setSelected] = useState<Application | null>(null);
    const topic = (a: Application) => data.topics.find(t => t.id === a.topicId)!;
    const rows = data.applications.filter(a => (!status || labels[a.status] === status) && `${topic(a).title} ${topic(a).supervisor}`.toLowerCase().includes(query.toLowerCase()));
    return <>
        <Heading title="Мои заявки" description="Отслеживайте статус заявок, поданных научным руководителям на выбранные темы."/>
        <div className="st-toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder="Поиск по названию темы или руководителю"/>
            <Filter label="Статус" value={status} onChange={setStatus} options={['pending', 'approved', 'rejected', 'expired'].map(s => labels[s as Status])} all="Все статусы"/>
        </div>
        <div className="st-card st-table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Тема
                        </th>
                        <th>Научный руководитель
                        </th>
                        <th>Дата подачи
                        </th>
                        <th>Статус
                        </th>
                        <th>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(a => <tr key={a.id}>
                        <td>«
                            {topic(a).title}»
                        </td>
                        <td>
                            {shortName(topic(a).supervisor)}
                        </td>
                        <td>
                            {a.date}
                        </td>
                        <td>
                            <StatusBadge status={a.status}/>
                        </td>
                        <td>
                            <button className="st-outline" onClick={() => setSelected(a)}>Подробнее
                            </button>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            {!rows.length && <div className="st-empty">Заявки не найдены
            </div>}
        </div>
        {selected && <Drawer title="Информация о заявке" onClose={() => setSelected(null)}>
            <h2>«
                {topic(selected).title}»
            </h2>
            <StatusBadge status={selected.status}/>
            <dl>
                <dt>Научный руководитель
                </dt>
                <dd>
                    {topic(selected).supervisor}
                </dd>
                <dt>Дата подачи
                </dt>
                <dd>
                    {selected.date}
                </dd>
                <dt>Статус
                </dt>
                <dd>
                    {labels[selected.status]}
                </dd>
            </dl>
            <h4>ОПИСАНИЕ СТАТУСА
            </h4>
            <p>
                {({ pending: 'Заявка ожидает рассмотрения научным руководителем.', approved: 'Научный руководитель одобрил заявку.', rejected: 'Научный руководитель рассмотрел заявку и не смог её одобрить. Тема не закреплена за вами.', expired: 'Срок рассмотрения заявки истёк.' })[selected.status]}
            </p>
            {selected.reason && <div className="st-alert">
                <strong>
                    <Info size={18}/> Причина отклонения
                </strong>
                <p>
                    {selected.reason}
                </p>
            </div>}
        </Drawer>}
    </>;
}
