import { createLink, makeElement } from "../modules/utils";

export function renderNotFoundPage(container: HTMLElement, pageId: string) {
    container.innerHTML = "";
        const main = document.createElement("main");
        const notFoundH1 = makeElement("h1", null, null, `404: ${pageId} not found`);
        const notFoundImage = makeElement("img", null, "not-found-img", null) as HTMLImageElement;
        notFoundImage.src = "/404error.png";
        const tublebeastsCopyright = makeElement("p", null, "center", null);
        const copyrightText = makeElement("span", null, null, "Tumblebeasts ©Matthew Inman | ");
        const copyrightLink = createLink({href: "https://theoatmeal.com/", linkText: "The Oatmeal", external: true});
        tublebeastsCopyright.append(copyrightText, copyrightLink);
        main.append(notFoundH1, notFoundImage, tublebeastsCopyright);
        container.appendChild(main);
}