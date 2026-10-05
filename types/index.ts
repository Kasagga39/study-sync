export interface IUser {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
}

export interface ICourse {
    _id: string;
    name: string;
    description: string;
    ownerId: string;
    createdAt?: string;
}

export interface ITask {
    _id: string;
    title: string;
    description: string;
    courseId: string | ICourse;
    userId: string;
    dueDate: string;
    status: "Not Started" | "In Progress" | "Completed";
    createdAt?: string;
}

export interface IResource {
    _id: string;
    title: string;
    description: string;
    url: string;
    courseId: string;
    userId: string;
    createdAt?: string;
}

export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}