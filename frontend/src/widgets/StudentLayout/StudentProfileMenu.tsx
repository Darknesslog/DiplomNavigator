import { useEffect, useState } from 'react';
import { fetchStudentProfile, updateStudentProfile } from '../../shared/api/studentProfile';
import type { StudentProfile, StudentProfileUpdate } from '../../shared/api/studentProfile';

const fields = [
    ['last_name', 'Фамилия'],
    ['first_name', 'Имя'],
    ['middle_name', 'Отчество'],
    ['email', 'Электронная почта'],
    ['phone', 'Телефон (необязательно)'],
] as const;
const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString('ru-RU') : 'Нет данных';

export function StudentProfileMenu({ onLogout }: { onLogout: () => void }) {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<StudentProfileUpdate | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        fetchStudentProfile().then(setProfile).catch(() => setError('Не удалось загрузить профиль'));
    }, []);
    useEffect(() => {
        function close(event: KeyboardEvent) {
            if (event.key === 'Escape' && !busy) {
                setOpen(false);
                setDraft(null);
            }
        }
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [busy]);
    if (!profile) return <span>{error || 'Загрузка профиля…'}</span>;
    const initials = `${profile.first_name[0]}${profile.last_name[0]}`;
    function edit() {
        if (!profile) return;
        const { first_name, last_name, middle_name, email, phone } = profile;
        setDraft({ first_name, last_name, middle_name, email, phone });
        setOpen(false);
        setError('');
    }
    async function save() {
        if (!draft || busy) return;
        setBusy(true);
        setError('');
        try {
            setProfile(await updateStudentProfile(draft));
            setDraft(null);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Ошибка сохранения');
        } finally {
            setBusy(false);
        }
    }
    return (
        <>
            <button className="sx-profile-trigger" aria-expanded={open} onClick={() => setOpen(!open)}>
                <span>
                    <strong>{profile.first_name} {profile.middle_name}</strong>
                    <small>Студент</small>
                </span>
                <span className="sup-avatar">{initials}</span>
            </button>
            {open && (
                <>
                    <button className="sx-dismiss" aria-label="Закрыть профиль" onClick={() => setOpen(false)} />
                    <article className="sx-popover">
                        <span className="sup-avatar">{initials}</span>
                        <h3>{profile.last_name} {profile.first_name} {profile.middle_name}</h3>
                        <p>Студент</p>
                        <dl>
                            <dt>Электронная почта</dt><dd>{profile.email}</dd>
                            <dt>Роль</dt><dd>Студент</dd>
                            <dt>Дата регистрации</dt><dd>{formatDate(profile.registeredAt)}</dd>
                            <dt>Последний вход</dt><dd>{formatDate(profile.lastLogin)}</dd>
                        </dl>
                        <button className="sx-primary" onClick={edit}>Редактировать профиль</button>
                        <button onClick={onLogout}>Выйти</button>
                    </article>
                </>
            )}
            {draft && (
                <div className="sx-overlay" onClick={() => !busy && setDraft(null)}>
                    <form className="sx-drawer" role="dialog" aria-modal="true" aria-label="Редактирование профиля"
                        onClick={event => event.stopPropagation()}
                        onSubmit={event => { event.preventDefault(); void save(); }}>
                        <div className="sx-drawer-heading">
                            <h2>Редактирование профиля</h2>
                            <button type="button" aria-label="Закрыть" disabled={busy} onClick={() => setDraft(null)}>×</button>
                        </div>
                        <div className="sx-drawer-body">
                            <p className="sx-intro">Измените личные данные и контактную информацию.</p>
                            {fields.map(([key, label]) => (
                                <label key={key}>
                                    {label}
                                    <input type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                                        required={['last_name', 'first_name', 'email'].includes(key)}
                                        value={draft[key] ?? ''}
                                        onChange={event => setDraft({ ...draft, [key]: event.target.value })} />
                                </label>
                            ))}
                            <label>Роль<input disabled value="Студент" /></label>
                            <label>Дата регистрации<input disabled value={formatDate(profile.registeredAt)} /></label>
                            {error && <p role="alert">{error}</p>}
                        </div>
                        <footer className="sx-drawer-footer">
                            <button className="sx-primary" disabled={busy}>Сохранить изменения</button>
                            <button type="button" disabled={busy} onClick={() => setDraft(null)}>Отмена</button>
                        </footer>
                    </form>
                </div>
            )}
        </>
    );
}
