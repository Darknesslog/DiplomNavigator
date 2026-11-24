import { useEffect, useState } from "react";
import type {
  SupervisorProfile,
  ProfileUpdate,
} from "../../entities/user/supervisorAccount";
import {
  fetchSupervisorProfile,
  updateSupervisorProfile,
} from "../../shared/api/supervisorAccount";
export function SupervisorProfileMenu({ onLogout }: { onLogout?: () => void }) {
  const [profile, setProfile] = useState<SupervisorProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileUpdate | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetchSupervisorProfile()
      .then(setProfile)
      .catch(() => setError("Не удалось загрузить профиль"));
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDraft(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (!profile) return <span>{error || "Загрузка профиля…"}</span>;
  const initials = profile.first_name[0] + profile.last_name[0];
  const date = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("ru-RU") : "Нет данных";
  return (
    <>
      <button
        className="sx-profile-trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>
          <strong>
            {profile.first_name} {profile.middle_name}
          </strong>
          <small>Научный руководитель</small>
        </span>
        <span className="sup-avatar">{initials}</span>
      </button>
      {open && (
        <>
          <button
            className="sx-dismiss"
            aria-label="Закрыть профиль"
            onClick={() => setOpen(false)}
          />
          <article className="sx-popover">
            <span className="sup-avatar">{initials}</span>
            <h3>
              {profile.last_name} {profile.first_name} {profile.middle_name}
            </h3>
            <p>Научный руководитель</p>
            <dl>
              <dt>Электронная почта</dt>
              <dd>{profile.email}</dd>
              <dt>Роль</dt>
              <dd>Научный руководитель</dd>
              <dt>Дата регистрации</dt>
              <dd>{date(profile.registeredAt)}</dd>
              <dt>Последний вход</dt>
              <dd>{date(profile.lastLogin)}</dd>
            </dl>
            <button
              className="sx-primary"
              onClick={() => {
                const {
                  first_name,
                  last_name,
                  middle_name,
                  email,
                  phone,
                  department,
                } = profile;
                setDraft({
                  first_name,
                  last_name,
                  middle_name,
                  email,
                  phone,
                  department,
                });
                setOpen(false);
                setError("");
              }}
            >
              Редактировать профиль
            </button>
            <button onClick={onLogout}>Выйти</button>
          </article>
        </>
      )}
      {draft && (
        <div
          className="sx-overlay"
          onClick={() => {
            if (!busy) setDraft(null);
          }}
        >
          <form
            className="sx-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование профиля"
            onClick={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                setProfile(await updateSupervisorProfile(draft));
                setDraft(null);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Ошибка сохранения");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="sx-drawer-heading">
              <h2>Редактирование профиля</h2>
              <button
                aria-label="Закрыть"
                type="button"
                onClick={() => setDraft(null)}
                disabled={busy}
              >
                ×
              </button>
            </div>
            <div className="sx-drawer-body">
              <p className="sx-intro">
                Измените личные данные и контактную информацию.
              </p>
              {(
                [
                  ["last_name", "Фамилия"],
                  ["first_name", "Имя"],
                  ["middle_name", "Отчество"],
                  ["email", "Электронная почта"],
                  ["phone", "Телефон (необязательно)"],
                  ["department", "Должность или подразделение"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : "text"
                    }
                    required={["last_name", "first_name", "email"].includes(
                      key,
                    )}
                    value={draft[key] ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label>
                Роль
                <input disabled value="Научный руководитель" />
              </label>
              <label>
                Дата регистрации
                <input disabled value={date(profile.registeredAt)} />
              </label>
              {error && <p role="alert">{error}</p>}
            </div>
            <footer className="sx-drawer-footer">
              <button className="sx-primary" disabled={busy}>
                Сохранить изменения
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setDraft(null)}
              >
                Отмена
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
