import { makeElement } from "../modules/utils.module";

export class Project {
    public id: string;
    public projectTitle: string;
    public datePublished: Date;
    public skills: string[];
    public description: string;
    public category: "websites-&-app" | "labs-&-utilities";

    constructor(
        id: string,
        projectTitle: string,
        datePublished: Date,
        skills: string[],
        description: string,
        category: "websites-&-app" | "labs-&-utilities"
    ) {
        this.id = id;
        this.projectTitle = projectTitle;
        this.datePublished = datePublished;
        this.skills = skills;
        this.description = description;
        this.category = category;
    }

    public getHeading() {
        const projectHeader = makeElement("section", null, "project-header", null);
        const titleH2 = makeElement("h2", null, null, this.projectTitle);
        const dateH2 = makeElement("h2", null, null, this.datePublished.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        }));
        projectHeader.append(titleH2, dateH2);
        return projectHeader;
    }
}