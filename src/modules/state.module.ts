import type { Page } from "../models/page.model";
import type { Project } from "../models/project.model";

class AppState {
    private _currentUser: any = null;
    private _currentRole: string | null = null;
    private _pages: Page[] | null = null;
    private _projects: Project[] | null = null;

    get currentUser(): any {
        return this._currentUser;
    }

    setCurrentUser(newUser: any) {
        this._currentUser = newUser;
    }

    get currentRole(): string | null {
        return this._currentRole;
    }

    setCurrentRole(newRole: string | null) {
        this._currentRole = newRole;
    }

    get pages(): Page[] | null {
        return this._pages;
    }

    setPages(pagesArray: Page[]) {
        this._pages = pagesArray;
    }

    get projects(): Project[] | null {
        return this._projects;
    }

    setProjects(projectsArray: Project[]) {
        this._projects = projectsArray;
    }
}

export const state = new AppState();