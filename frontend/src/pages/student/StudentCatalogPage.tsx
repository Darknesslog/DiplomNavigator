import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { StudentData, Topic } from '../../entities/student/student';
import { applyForTopic } from '../../shared/api/student';
import './StudentCatalogPage.css';
import { Drawer, Filter, Heading, SearchBox, StatusBadge, shortName } from './StudentComponents';
function TopicCard({ topic, onOpen }: {
    topic: Topic;
    onOpen: () => void;
}) {
    return <article className="st-card st-topic">
        <h3>«
            {topic.title}»
        </h3>
        <dl>
            <dt>Категория
            </dt>
            <dd>
                {topic.category}
            </dd>
            <dt>Направление
            </dt>
            <dd>
                {topic.direction}
            </dd>
            <dt>Руководитель
            </dt>
            <dd className="st-blue">
                {shortName(topic.supervisor)}
            </dd>
        </dl>
        <footer>
            <StatusBadge status={topic.available ? 'available' : 'booked'}/>
            <button className="st-outline" onClick={onOpen}>Подробнее
            </button>
        </footer>
    </article>;
}
export function StudentCatalogPage({ data, onUpdate }: {
    data: StudentData;
    onUpdate: (d: StudentData) => void;
}) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [direction, setDirection] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [selected, setSelected] = useState<Topic | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const topics = data.topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase().trim()) && (!category || t.category === category) && (!direction || t.direction === direction) && (!supervisor || t.supervisor === supervisor));
    const applied = selected && data.applications.some(a => a.topicId === selected.id && ['pending', 'approved'].includes(a.status));
    async function apply() { if (!selected)
        return; setBusy(true); setError(''); try {
        onUpdate(await applyForTopic(selected.id));
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось отправить заявку');
    }
    finally {
        setBusy(false);
    } }
    return <>
        <Heading title="Каталог тем" description="Выберите тему выпускной квалификационной работы и подайте заявку научному руководителю."/>
        <SearchBox value={query} onChange={setQuery} placeholder="Например, Разработка интеллектуальной системы"/>
        <div className="st-filters">
            <Filter label="Категория" value={category} onChange={setCategory} options={[...new Set(data.topics.map(t => t.category))]}/>
            <Filter label="Направление" value={direction} onChange={setDirection} options={[...new Set(data.topics.map(t => t.direction))]}/>
            <Filter label="Научный руководитель" value={supervisor} onChange={setSupervisor} options={[...new Set(data.topics.map(t => t.supervisor))]}/>
            <button className="st-outline" onClick={() => { setQuery(''); setCategory(''); setDirection(''); setSupervisor(''); }}>
                <RotateCcw size={16}/>Сбросить фильтры
            </button>
        </div>
        <p>Найдено тем:
            {topics.length}
        </p>
        <div className="st-topic-grid">
            {topics.map(t => <TopicCard key={t.id} topic={t} onOpen={() => { setSelected(t); setError(''); }}/>)}
        </div>
        {!topics.length && <div className="st-empty st-card">Темы не найдены
        </div>}
        {selected && <Drawer title="Информация о теме" onClose={() => setSelected(null)} footer={<>
                <button className="st-primary" disabled={!selected.available || !!applied || busy} onClick={apply}>
                    {applied ? 'Заявка уже подана' : busy ? 'Отправка…' : selected.available ? 'Подать заявку' : 'Нет свободных мест'}
                </button>
                {error && <p role="alert">
                    {error}
                </p>}
            </>}>
        <h2>«
            {selected.title}»
        </h2>
        <StatusBadge status={selected.available ? 'available' : 'booked'}/>
        <dl>
            <dt>Категория
            </dt>
            <dd>
                {selected.category}
            </dd>
            <dt>Направление
            </dt>
            <dd>
                {selected.direction}
            </dd>
            <dt>Научный руководитель
            </dt>
            <dd className="st-blue">
                {selected.supervisor}
            </dd>
        </dl>
        <h4>ОПИСАНИЕ ТЕМЫ
        </h4>
        <p>
            {selected.description}
        </p>
    </Drawer>}
    </>;
}
