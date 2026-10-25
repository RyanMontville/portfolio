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
    content.append(text, portfolioLink);
    try {
        const notFoundContent = await getPageById("not-found");
        if (notFoundContent) {
            notFoundH1.textContent = notFoundContent.title.replace("{title}", pageId);
            content.innerHTML = notFoundContent.content;
            let lastUpdated = makeElement("p", null, "center", `Last updated: ${formatDate(notFoundContent.updatedAt, true)}`);
            main.append(notFoundH1, content, lastUpdated);
            container.appendChild(main);
        }
    } catch (error) {
        console.error("Error loading not found page", error);
        main.append(notFoundH1, content);
        container.appendChild(main);
    }
    if (currentRole === "admin") {
        const editPageBtn = createButton("Edit page", "button", "edit-btn", "", "edit");
        editPageBtn.addEventListener("click", () => router.navigateTo(`/editpage/${pageId}`));
        main.prepend(editPageBtn);
    }
    
    // const notFoundImage = makeElement("img", null, "not-found-img", null) as HTMLImageElement;
    // notFoundImage.src = "/404error.png";
    // const tublebeastsCopyright = makeElement("p", null, "center", null);
    // const copyrightText = makeElement("span", null, null, "Tumblebeasts ©Matthew Inman | ");
    // const copyrightLink = createLink({href: "https://theoatmeal.com/", linkText: "The Oatmeal", external: true});
    // tublebeastsCopyright.append(copyrightText, copyrightLink);
}