import type { Timestamp } from "firebase/firestore";

export class Page {
    public id: string;
    public title: string;
    public navLink: boolean;
    public content: string;
    public updatedAt?: Timestamp | Date;

    constructor(
        id: string,
        title: string,
        navLink: boolean,
        content: string,
        updatedAt?: Timestamp | Date
    ) {
        this.id = id;
        this.title = title;
        this.navLink = navLink;
        this.content = content;
        if (updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
}