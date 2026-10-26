import htmlContent from './portfolio.html?raw';
import { router } from '../router';
import type { Project } from '../models/project.model';
import { createButton, createInput, createMessage, makeElement } from '../modules/utils';
import { createNewProject, deleteProject, getAllProjects, getCardById, updateCard } from '../services/firebase/db';
import { confirmDeleteModal, createModal } from '../modules/modal';
import { createImageCarousel } from '../modules/images';
import { populateSkillsSelect, renderSkillsRow } from '../modules/skills';

let all: Project[] = [];
let websites: Project[] = [];
let labs: Project[] = [];
let projectsToDisplay: Project[] = [];

let tabs: { id: string, label: string }[] = [];
let activeTab: string = "all";
let selectedSkill: string | null = null;

async function editIntroCard(cardElement: HTMLElement, cardContent: string, currentRole: string) {
  cardElement.innerHTML = "";
  const editorTextarea = document.createElement("textarea") as HTMLTextAreaElement;
  editorTextarea.value = cardContent;
  const buttonRow = makeElement("div", null, "button-row", null);
  const cancelBtn = createButton("Cancel", "button", "cancel-edit-btn", "", "close");
  cancelBtn.addEventListener("click", () => renderIntroCard(currentRole));
  const updateBtn = createButton("Update Card", "button", "update-card-btn", "", "check");
  updateBtn.addEventListener("click", async () => {
    try {
      await updateCard("intro", editorTextarea.value.toString());
      createMessage({messageBody: "Updated intro card", location: "main-message", type: "info", autoCloseSeconds: 10});
      renderIntroCard(currentRole);
    } catch (err: any) {
      createMessage({messageBody: err, location: "main-message", type: "error"});
    }
  })
  buttonRow.append(cancelBtn, updateBtn);
  cardElement.append(editorTextarea, buttonRow);
}

async function renderIntroCard(currentRole: string) {
  const introCard = document.getElementById("intro") as HTMLElement;
  try {
    const cardContent = await getCardById("intro");
    introCard.innerHTML = cardContent;
    if (currentRole === "admin") {
      const editBtn = createButton("Edit", "button", "edit-intro", "", "edit");
      editBtn.addEventListener("click", () => editIntroCard(introCard, cardContent, currentRole));
      introCard.appendChild(editBtn);
    }
  } catch (err: any) {
    createMessage({messageBody: `Error fetching card: ${err}`, location: "main-message", type: "error"});
  }
  
}

function rerenderProjects(projectsContainer: HTMLElement, currentRole: string) {
  projectsContainer.innerHTML = "";
  
  // Render the tabs bar
  const tabsRow = tabs.reduce((acc: HTMLElement, currTab: { id: string, label: string }) => {
    const nextTab = createButton(currTab.label, "button", currTab.id, "");
    if (currTab.id === activeTab) nextTab.classList.add("active");
    nextTab.addEventListener("click", () => {
      activeTab = currTab.id;
      selectedSkill = null;
      switch (currTab.id) {
        case "websites":
          projectsToDisplay = websites;
          break;
        case "labs":
          projectsToDisplay = labs;
          break;
        default:
          projectsToDisplay = all;
      }
      rerenderProjects(projectsContainer, currentRole);
    });
    acc.appendChild(nextTab);
    return acc;
  }, makeElement("section", "tabs", null, null));

  // If logged in as admin, add new project button
  if (currentRole === "admin") {
    const newProjectBtn = createButton("New Project", "button", "new-project-btn", "", "add");
    newProjectBtn.addEventListener("click", async () => {
      const response = await createModal("Add New Project", [createInput({ id: "project-title", type: "text", placeholder: "Project Title" })], "Create Project", false);
      if (response) {
        const projectId = await createNewProject(response[0]);
        router.navigateTo(`/editproject/${projectId}`);
      }
    });
    tabsRow.prepend(newProjectBtn);
  }

  function filterProjectsBySkill(skill: string) {
    selectedSkill = skill;
    activeTab = "skill";
    if (!skill || skill === "all") {
      projectsToDisplay = all;
    } else {
      projectsToDisplay = all.filter(project => project.skills.includes(skill));
    }
    console.log(projectsToDisplay.length);
    rerenderProjects(projectsContainer, currentRole);
  }

  // Render project heading and cards
  const projectsHeader = makeElement("div", "projects-header", null, null);
  const projectsHeading = makeElement("h2", null, null, null);
  if (selectedSkill) {
    projectsHeading.textContent = `Displaying ${projectsToDisplay.length} project${projectsToDisplay.length === 1 ? '' : "s"} for ${selectedSkill}`;
  } else {
    projectsHeading.textContent = `Displaying ${projectsToDisplay.length} project${projectsToDisplay.length === 1 ? '' : "s"}`;
  }
  const filterProjects = makeElement("select", null, null, null) as HTMLSelectElement;
  populateSkillsSelect(filterProjects);
  filterProjects.addEventListener("change", () => filterProjectsBySkill(filterProjects.value));
  projectsHeader.append(projectsHeading, filterProjects);

  const projectsDiv = projectsToDisplay.reduce((acc: HTMLElement, currProject: Project) => {
    const nextProject = makeElement("article", currProject.id, "card", null);
    const projectHeading = currProject.getHeading();
    const skillsSection = renderSkillsRow(currProject.skills);
    const descriptionSection = makeElement("section", `${currProject.id}-description`, null, null);
    descriptionSection.innerHTML = currProject.description;
    
    const screenshots = descriptionSection.querySelectorAll<HTMLElement>(".screenshot-placeholder");
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

    nextProject.append(projectHeading, skillsSection, descriptionSection);
    if (currentRole === "admin") {
      const adminBtnRow = makeElement("section", `${currProject.id}-actions`, "button-row", null);
      const editBtn = createButton("Edit", "button", `edit-${currProject.id}`, "", "edit");
      editBtn.addEventListener("click", () => router.navigateTo(`/portfolio/${currProject.id}/edit`));
      const deleteBtn = createButton("Delete", "button", `delete-${currProject.id}`, "delete-button", "delete");
      deleteBtn.addEventListener("click", async () => {
        const response = await confirmDeleteModal(`Delete Project ${currProject.id}`, `Are you sure you want to delete ${currProject.projectTitle}`);
        if (response) await deleteProject(currProject.id);
      });
      adminBtnRow.append(editBtn, deleteBtn);
      nextProject.appendChild(adminBtnRow);
    }
    acc.appendChild(nextProject);
    return acc;
  }, makeElement("div", "projects", null, null));

  projectsContainer.append(tabsRow, projectsHeader, projectsDiv);
}

export async function renderPortfolioHome(container: HTMLElement, currentRole: string) {
  container.innerHTML = htmlContent;
  const projectContainer = document.getElementById("projects") as HTMLElement;
  await renderIntroCard(currentRole);
  // Load projects
  all = await getAllProjects();
  websites = all.filter(project => project.category === "websites-&-app");
  labs = all.filter(project => project.category === "labs-&-utilities");
  projectsToDisplay = all;

  // Initialize tabs
  tabs = [
    { id: "all", label: `All Projects (${all.length})` },
    { id: "websites", label: `Websites & Apps (${websites.length})` },
    { id: "labs", label: `Labs & Utilities (${labs.length})` }
  ];

  //Render tabs and Projects
  rerenderProjects(projectContainer, currentRole);

  projectContainer.classList.remove("hide");
  const loadingCard = document.getElementById("loading-card");
  if (loadingCard) loadingCard.remove();
}
