export interface Notification {
    id: string;
    process: string;
    title: string;
    message: string;
    color: string;
    useclass?: string;
    timestamp: number;
}