import type { StudentData } from '../../entities/student/student';
import { studentMock } from '../mocks/student';
let data: StudentData = structuredClone(studentMock);
export async function fetchStudent(): Promise<StudentData> { return structuredClone(data); }
export async function applyForTopic(id: number): Promise<StudentData> { const topic = data.topics.find(t => t.id === id); if (!topic?.available)
    throw new Error('Нет свободных мест'); if (data.applications.some(a => a.topicId === id && ['pending', 'approved'].includes(a.status)))
    throw new Error('Заявка уже подана'); data = { ...data, applications: [{ id: Math.max(0, ...data.applications.map(a => a.id)) + 1, topicId: id, date: new Date().toLocaleDateString('ru-RU'), status: 'pending' }, ...data.applications] }; return fetchStudent(); }
