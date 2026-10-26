import { createButton, formatDate, makeElement } from "../modules/utils";
import { router } from "../router";
import { getPageById } from "../services/firebase/db";

export async function renderNotFoundPage(container: HTMLElement, pageId: string, currentRole: string | null) {
    container.innerHTML = "";
    
    const notFoundH1 = makeElement("h1", null, null, `404: ${pageId} not found`);
    const main = document.createElement("main");
    const content = makeElement("p", null, null, null);
    const text = makeElement("span", null, null, "The content you were looking for could not be found. Please check your spelling or ");
    const portfolioLink = makeElement("a", null, null, "go to the homepage") as HTMLAnchorElement;
    portfolioLink.href = "/";
    portfolioLink.addEventListener("click", (e) => {
        e.preventDefault();
        router.navigateTo("/");
    });
    content.append(text, portfolioLink);

    main.append(notFoundH1, content);

    try {
        const notFoundContent = await getPageById("not-found");
        if (notFoundContent) {
            notFoundH1.textContent = notFoundContent.title.replace("{title}", pageId);
            content.innerHTML = notFoundContent.content;
            const lastUpdated = makeElement("p", null, "center", `Last updated: ${formatDate(notFoundContent.updatedAt, true)}`);
            main.append(lastUpdated);
        }
    } catch (error) {
        console.error("Error loading custom not found page from DB", error);
    }

    if (currentRole === "admin") {
        const editPageBtn = createButton("Edit page", "button", "edit-btn", "", "edit");
        editPageBtn.addEventListener("click", () => router.navigateTo(`/not-found/edit`));
        main.prepend(editPageBtn);
    }

    container.appendChild(main);
}