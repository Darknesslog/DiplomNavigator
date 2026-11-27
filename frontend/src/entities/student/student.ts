export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export interface Topic {
    id: number;
    title: string;
    category: string;
    direction: string;
    supervisor: string;
    available: boolean;
    description: string;
}
export interface Application {
    id: number;
    topicId: number;
    date: string;
    status: ApplicationStatus;
    reason?: string;
}
export interface Stage {
    id: number;
    title: string;
    date: string;
    status: 'done' | 'current' | 'waiting' | 'locked';
    description: string;
    start?: string;
    comment?: string;
    files: string[];
}
export interface StudentData {
    name: string;
    topics: Topic[];
    applications: Application[];
    workTopicId: number;
    stages: Stage[];
    support: {
        channel: string;
        contact: string;
        hours: string;
    };
    notifications: {
        id: number;
        title: string;
        read: boolean;
    }[];
}
