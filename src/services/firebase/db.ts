import { 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDocs,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Page } from '../../models/page.model';
import { Project } from '../../models/project.model';

const PAGES_COLLECTION = 'pages';
const PROJECTS_COLLECTION = 'projects';
const CARDS_COLLECTION = 'cards';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ╔═══════════════════════════════════════════════════╗
// ║ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ PAGES ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ║
// ╚═══════════════════════════════════════════════════╝

export async function createNewPage(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  
  let pageId = baseSlug || `page-${Date.now().toString(36)}`;
  
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const randomSuffix = Math.floor(Math.random() * 10);
    pageId = `${pageId}-${randomSuffix}`;
  }

  const finalDocRef = doc(db, PAGES_COLLECTION, pageId);
  await setDoc(finalDocRef, {
    title,
    navLink: false,
    content: '',
    updatedAt: serverTimestamp(),
  });

  return pageId;
}

export async function getAllPages(): Promise<Page[]> {
    try {
        const pagesQuery = query(collection(db, PAGES_COLLECTION), orderBy("title", "asc"));
        const querySnapshot = await getDocs(pagesQuery);

        const pages: Page[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Page));

        return pages;
    } catch (error) {
        throw new Error(`Failed to fetch pages: ${error}`);
    }
}

export async function getPageById(pageId: string): Promise<Page | null> {
    const docRef = doc(db, PAGES_COLLECTION, pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data()
        } as Page;
    } else {
        throw new Error("Page not found");
    }
}

export async function updatePage(pageId: string, data: { title?: string; content?: string; navLink?: boolean }): Promise<void> {
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePage(pageId: string): Promise<void> {
  const docRef = doc(db, PAGES_COLLECTION, pageId);
  await deleteDoc(docRef);
}

// ╔═══════════════════════════════════════════════════╗
// ║ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ REDIRECTS ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ║
// ╚═══════════════════════════════════════════════════╝

export async function getEncodedValue(encodedKey: string): Promise<{encodedKey: string, encodedValue: string}> {
    const docRef = doc(db, "goTo", encodedKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return {
            encodedKey: docSnap.data().encodedKey,
            encodedValue: docSnap.data().encodedValue
        }
    } else {
        throw new Error("Invalid goTo key");
    }
}

// ╔═══════════════════════════════════════════════════╗
// ║ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ PROJECTS  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ║
// ╚═══════════════════════════════════════════════════╝

export type NewProjectData = Omit<Project, "id" | "getHeading">;

export async function getAllProjects(): Promise<Project[]> {
    try {
        const projectsQuery = query(collection(db, PROJECTS_COLLECTION), orderBy("datePublished", "desc"));
        const querySnapshot = await getDocs(projectsQuery);

        const projects: Project[] = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            const rawDate = data.datePublished;
            const datePublished = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);

            return new Project(
                docSnapshot.id,
                data.projectTitle,
                datePublished,
                data.skills || [],
                data.description || "",
                data.category || "websites-&-app"
            );
        });

        return projects;
    } catch (error) {
        throw new Error(`Failed to fetch projects: ${error}`);
    }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        const rawDate = data.datePublished;
        const datePublished = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);

        return new Project(
            docSnap.id,
            data.projectTitle,
            datePublished,
            data.skills || [],
            data.description || "",
            data.category || ""
        );
    } else {
        throw new Error("Project not found");
    }
}

export async function createNewProject(projectTitle: string) {
    const newProject: NewProjectData = {
        projectTitle: projectTitle,
        datePublished: new Date(),
        skills: [],
        description: "",
        category: "websites-&-app"
    }
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject);
    return docRef.id;
}

export async function updateProject(projectId: string, data: Project): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
        ...data
    });
}

export async function deleteProject(projectId: string) {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
}

// ╔═══════════════════════════════════════════════════╗
// ║ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ Cards ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ║
// ╚═══════════════════════════════════════════════════╝

export async function getCardById(cardId: string) {
    const docRef = doc(db, CARDS_COLLECTION, cardId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().content;
    } else {
        throw new Error("Card not found");
    }
}

export async function updateCard(cardId: string, updatedContent: string): Promise<void> {
    const docRef = doc(db, CARDS_COLLECTION, cardId);
    await setDoc(docRef, { content: updatedContent }, { merge: true });
}