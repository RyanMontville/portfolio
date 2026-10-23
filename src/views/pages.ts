import type { Page } from '../models/page.model';
import { confirmDeleteModal } from '../modules/modal';
import { createMessage, createTableHeader, makeElement } from '../modules/utils';
import { router } from '../router';
import { createNewPage, deletePage, getAllPages } from '../services/firebase/db';

export async function handleSubmit(nameInput: HTMLInputElement) {
    if (nameInput.value && nameInput.value.trim() !== "") {
        const pageId = await createNewPage(nameInput.value.trim());
        router.navigateTo(`/edit/${pageId}`);
    } else {
        createMessage({ messageBody: "Please enter the page name", location: "main-message", type: "error" });
        return;
    }
}

export async function renderPages(container: HTMLElement, currentRole: string) {
    const footer = document.querySelector("footer") as HTMLElement;
    footer.classList.add("hide");
    container.innerHTML = "";
    const main = makeElement("main", null, null, null);
    if (currentRole !== "admin") {
        router.navigateTo("/");
    } else {
        const pages = await getAllPages();
        const pagesTable = makeElement("table", "pages", null, null) as HTMLTableElement;
        const pageTHead = createTableHeader(["ID", "Name", "View Page", "Edit Page", "Delete Page"], "center");
        const pageTBody = pages.reduce((acc: HTMLElement, page: Page) => {
            const pageRow = makeElement("tr", page.id, null, null)
            const idCell = makeElement("td", null, null, page.id);
            const nameCell = makeElement("td", null, null, page.title);
            const viewCell = makeElement("td", null, "button-cell", null);
            viewCell.appendChild(makeElement("span", null, "material-symbols-outlined", "visibility"));
            viewCell.addEventListener("click", () => router.navigateTo(`/${page.id}`));
            const editCell = makeElement("td", null, "button-cell", null);
            editCell.appendChild(makeElement("span", null, "material-symbols-outlined", "edit"));
            editCell.addEventListener("click", () => router.navigateTo(`/editpage/${page.id}`));
            const deleteCell = makeElement("td", null, "button-cell", null);
            deleteCell.appendChild(makeElement("span", null, "material-symbols-outlined", "delete"));
            deleteCell.addEventListener("click", async () => {
                const response = await confirmDeleteModal(`Confirm Delete`, `Are you sure you want to delete ${page.title}?`);
                if (response) {
                     await deletePage(page.id);
                     const rowToDelete = document.getElementById(page.id);
                     if (rowToDelete) rowToDelete.remove();
                    createMessage({messageBody: `Deleted ${page.title}`, location: "main-message", type: "delete"});
                }
            })
            pageRow.append(idCell, nameCell, viewCell, editCell, deleteCell);
            acc.appendChild(pageRow);
            return acc;
        }, document.createElement("tbody"));
        const newPageRow = document.createElement("tr");
        const pageNameInputCell = document.createElement("td");
        pageNameInputCell.colSpan = 4;
        const pageNameInput = makeElement("input", "page-name", null, null) as HTMLInputElement;
        pageNameInput.type = "text";
        pageNameInput.placeholder = "New Page Name...";
        pageNameInputCell.appendChild(pageNameInput);
        const newPageCell = document.createElement("td");
        const newPageIcon = makeElement("span", null, "material-symbols-outlined", "add");
        const newPageText = makeElement("span", null, null, "Create New Page");
        newPageCell.append(newPageIcon, newPageText);
        newPageCell.addEventListener("click", () => handleSubmit(pageNameInput));
        newPageCell.classList.add("button-cell")
        newPageRow.append(pageNameInputCell, newPageCell);
        pageTBody.appendChild(newPageRow);
        pagesTable.append(pageTHead, pageTBody);

        main.append(pagesTable);
        container.appendChild(main);
    }
    footer.classList.remove("hide");
}