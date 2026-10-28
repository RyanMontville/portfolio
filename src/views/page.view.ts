import { createImageCarousel } from "../modules/images.module";
import { state } from "../modules/state.module";
import { createButton, formatDate, makeElement } from "../modules/utils.module";
import { router } from "../router";
import { renderNotFoundPage } from "./notFound.view";

export async function renderPublicPageView(container: HTMLElement, pageId: string) {
    container.innerHTML = "";
    const loadingMain = document.createElement("main");
    const loading = makeElement("p", null, null, "Loading...");
    loadingMain.appendChild(loading);
    container.appendChild(loadingMain);

    try {
        const main = document.createElement("main");
        const page = state.pages?.find(page => page.id === pageId);
        if (page) {
            document.title = `${page.title} | Ryan Montville`;
            const pageTitle = makeElement("h2", null, null, page.title);
            const pageContent = makeElement("div", "page-content", null, null);
            pageContent.innerHTML = page.content;
            const screenshots = pageContent.querySelectorAll<HTMLElement>(".screenshot-placeholder");
                screenshots.forEach(screenshot => {
                  const imagesAttr = screenshot.getAttribute("data-images");
                  if (imagesAttr) {
                    try {
                      const images: { src: string; alt: string }[] = new Function(`return ${imagesAttr};`)();
                      if (images && images.length > 0) {
                        const screenshotsCarouselElement = createImageCarousel(images);
                        screenshot.replaceWith(screenshotsCarouselElement);
                      }
                    } catch (error) {
                      console.error("Failed to parse carousel images:", error);
                    }
                  }
                });
            main.append(pageTitle, pageContent);
            if (state.currentRole === "admin") {
                const editPageBtn = createButton("Edit page", "button", "edit-btn", "", "edit");
                editPageBtn.addEventListener("click", () => router.navigateTo(`/${pageId}/edit`));
                main.appendChild(editPageBtn);
            }
            const lastUpdated = makeElement("p", null, "center", `Last updated: ${formatDate(page.updatedAt, true)}`);
            main.appendChild(lastUpdated);
            loadingMain.remove();
            container.appendChild(main);
        } else {
          renderNotFoundPage(container, pageId);
        }
        
    } catch (error) {
        console.error("Page throwing error?")
        renderNotFoundPage(container, pageId);
    }
}