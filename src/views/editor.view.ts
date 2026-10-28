import type { Page } from '../models/page.model';
import { Project } from '../models/project.model';
import { openSkillsModal, renderSkillsRow } from '../modules/skills.module';
import { state } from '../modules/state.module';
import { createButton, createInput, createMessage, createSelect, makeElement } from '../modules/utils.module';
import { getAllPages, getAllProjects, getProjectById, updatePage, updateProject } from '../services/firebase/db';
import { renderNotFoundPage } from './notFound.view';

async function handlePageSubmit(formElement: HTMLFormElement, pageId: string) {
    const formData = new FormData(formElement);
    let updatedContent: Page = {
        id: pageId,
        title: "",
        content: "",
        navLink: false,
        updatedAt: new Date()
    }

    const titleInput = formData.get("title-input");
    if (!titleInput || titleInput.toString().trim() === "") {
        console.log(`title is ${titleInput} as string ${titleInput?.toString()}`)
        createMessage({ messageBody: "Please do not leave the title blank", location: "main-message", type: "error" });
        return;
    } else {
        updatedContent.title = titleInput.toString().trim();
    }
    const contentTextArea = formData.get("content-textarea");
    if (!contentTextArea || contentTextArea.toString() === "") {
        createMessage({ messageBody: "Please do not leave the content blank", location: "main-message", type: "error" });
        return;
    } else {
        updatedContent.content = contentTextArea.toString();
    }
    const nlCheck = document.getElementById("nav-link-checkbox") as HTMLInputElement;
    updatedContent.navLink = nlCheck ? nlCheck.checked : false;
    if (state.currentRole === "admin") {
        await updatePage(pageId, { title: titleInput.toString().trim(), content: contentTextArea.toString(), navLink: updatedContent.navLink });
        createMessage({ messageBody: `${titleInput.toString().trim()} updated`, location: "main-message", type: "check_circle", autoCloseSeconds: 5 });
        state.setPages(await getAllPages());
    } else {
        createMessage({messageBody: "Denied. Insufficient Permissions", location: "main-message", type: "error"});
    }
}

async function handleProjectSubmit(formElement: HTMLFormElement, projectId: string, currentProjectSkills: string[]) {
    const formData = new FormData(formElement);
    const updatedData: Project = new Project(
        projectId,
        "",
        new Date(),
        [],
        "",
        "websites-&-app"
    )
    const titleVale = formData.get("title");
    if (!titleVale || titleVale.toString().trim() === "") {
        createMessage({ messageBody: "Please do not leave the title blank", location: "main-message", type: "error" });
        return;
    } else {
        updatedData.projectTitle = titleVale.toString().trim();
    }

    const datePublishedValue = formData.get("date-published");
    if (!datePublishedValue) {
        createMessage({ messageBody: "Please do not leave the date blank", location: "main-message", type: "error" });
        return;
    } else {
        updatedData.datePublished =
            new Date(datePublishedValue.toString());
    }

    updatedData.skills = currentProjectSkills;

    const descriptionValue = formData.get("description-textarea");
    if (!descriptionValue) {
        createMessage({ messageBody: "Please do not leave the description blank", location: "main-message", type: "error" });
        return;
    } else {
        updatedData.description = descriptionValue.toString();
    }

    const categorySelected = formData.get("category-select");
    if (!categorySelected) {
        createMessage({ messageBody: "Please select a category", location: "main-message", type: "error" });
        return;
    } else {
        updatedData.category = categorySelected as "websites-&-app" | "labs-&-utilities"
    }
    if (state.currentRole === "admin") {
        await updateProject(projectId, updatedData);
        createMessage({ messageBody: `${titleVale.toString().trim()} updated`, location: "main-message", type: "check_circle", autoCloseSeconds: 5 });
        state.setProjects(await getAllProjects());
    } else {
        createMessage({messageBody: "Denied. Insufficient Permissions", location: "main-message", type: "error"});
    }

}

export async function renderPageEditor(container: HTMLElement, pageId: string | null) {
    container.innerHTML = "";
    let error: boolean = false;
    const main = makeElement("main", null, null, null);
    const editorForm = makeElement("form", "editor-form", null, null) as HTMLFormElement;
    const titleInput = createInput({ id: "title-input", type: "text", placeholder: "Page Title..." })
    const checkboxDiv = document.createElement("div");
    checkboxDiv.style.display = "flex";
    const checkboxLabel = makeElement("label", null, null, "Include page in nav");
    checkboxLabel.setAttribute("for", "nav-link-checkbox");
    const navLinkCheckbox = createInput({ id: "nav-link-checkbox", type: "checkbox", placeholder: "navLink" });
    checkboxDiv.append(checkboxLabel, navLinkCheckbox);
    const contentTextArea = makeElement("textarea", "content-textarea", null, null) as HTMLTextAreaElement;
    contentTextArea.name = "content-textarea";
    contentTextArea.placeholder = "Start typing...";
    const submitButton = createButton("Submit", "submit", "submit-page", "", "");

    if (pageId) {
        try {
            const page = state.pages?.find(page => page.id === pageId);
            if (page) {
                titleInput.value = page.title;
                contentTextArea.value = page.content;
                if (page.navLink === true) {
                    navLinkCheckbox.checked = true;
                } else {
                    navLinkCheckbox.checked = false;
                }
            } else {
                renderNotFoundPage(container, pageId);
                error = true;
            }
        } catch (err) {
            error = true;
            console.error("Error loading page: ", err);
            renderNotFoundPage(container, pageId);
        }
    }

    if (!error) {
        editorForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await handlePageSubmit(editorForm, pageId ? pageId : "");
        });
        editorForm.append(titleInput, checkboxDiv, contentTextArea, submitButton);
        main.appendChild(editorForm);
        container.appendChild(main);
    }
}

export async function renderProjectEditor(container: HTMLElement, projectId: string | null) {
    container.innerHTML = "";
    let error: boolean = false;
    const main = makeElement("main", null, null, null);
    const helperBox = makeElement("div", null, "editor-helper-box", null);
    helperBox.innerHTML = `
<p>Image Carousel:</p>
<pre style="background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 4px; font-size: 0.8rem; overflow-x: auto;"><code>
&lt;section class="screenshot-placeholder" data-images='[
{src: "", alt: ""}
]'&gt;&lt;/section&gt;</code></pre>
<small>(Remember: Use <code>&amp;apos;</code> for apostrophes since <code>data-images</code> is wrapped in single quotes.)</small>
<p>Links:</p>
<pre style="background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 4px; font-size: 0.8rem; overflow-x: auto;"><code>&lt;section class="links"&gt;
&lt;a href="#"&gt;internalLink&lt;/a&gt;
&lt;a href="#" target="_blank"&gt;externalLink&lt;/a&gt;
&lt;/section&gt;</code></pre>
<hr>
    `;
    const editorForm = makeElement("form", "editor-form", null, null) as HTMLFormElement;
    const titleInput = createInput({ id: "title", placeholder: "Project Title", type: "text" });
    const dateInput = createInput({ id: "date-published", type: "date", placeholder: "Date Published" });
    let currentProjectSkills: string[] = [];
    let skillsContainer = makeElement("div", "skills-list", null, null);
    const editSkillsBtn = createButton("Edit Skills", "button", "", "", "edit");
    editSkillsBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const updatedSkills = await openSkillsModal(currentProjectSkills);
        if (updatedSkills !== null) {
            currentProjectSkills = updatedSkills;

            // Re-render the skills visual row and swap it in the DOM
            const newSkillsDiv = renderSkillsRow(currentProjectSkills);
            newSkillsDiv.id = "skills-list";
            skillsContainer.replaceWith(newSkillsDiv);
            skillsContainer = newSkillsDiv;
        }
    });
    const descriptionTextarea = makeElement("textarea", "description-textarea", null, null) as HTMLTextAreaElement;
    descriptionTextarea.name = "description-textarea";
    descriptionTextarea.placeholder = "Project description raw HTML";
    const categorySelect = createSelect({ id: "category-select", options: [{ text: "Websites & App", value: "websites-&-app" }, { text: "Labs & Utilities", value: "labs-&-utilities" }], promptText: "Select the project category" });
    const submitBtn = createButton("Submit", "submit", "submit-btn", "");

    if (projectId && !error) {
        try {
            const project = await getProjectById(projectId);
            if (project) {
                titleInput.value = project.projectTitle;
                dateInput.valueAsDate = project.datePublished;
                descriptionTextarea.value = project.description;
                categorySelect.value = project.category;
                currentProjectSkills = project.skills || [];
                skillsContainer = renderSkillsRow(currentProjectSkills);
                skillsContainer.id = "skills-list";
            } else {
                skillsContainer.textContent = "No skills added";
            }
        } catch (err) {
            error = true;
            console.error("Error loading project: ", err);
            renderNotFoundPage(container, projectId);
        }
    }
    editorForm.append(titleInput, dateInput, skillsContainer, editSkillsBtn, descriptionTextarea, categorySelect, submitBtn);
    editorForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleProjectSubmit(editorForm, projectId ? projectId : "", currentProjectSkills);
    });
    main.append(helperBox, editorForm);
    container.appendChild(main);
}