import { createButton, makeElement } from "./utils";

export function getSkillImage(skill: string): string {
    switch (skill) {
        case 'Java': { return "https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white"; }
        case 'Python': { return "https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54"; }
        case 'C#': { return "https://img.shields.io/badge/c%23-%23239120.svg?style=for-the-badge&logo=csharp&logoColor=white"; }
        case 'HTML': { return "https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white"; }
        case 'CSS': { return "https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white"; }
        case 'JavaScript': { return "https://img.shields.io/badge/JavaScript-141414?style=for-the-badge&logo=javascript&logoColor=F7DF1E"; }
        case 'TypeScript': { return "https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"; }
        case 'Spring Boot': { return "https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot"; }
        case 'PostgreSQL': { return "https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white"; }
        case 'JSON': { return "https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white"; }
        case 'Vue.js': { return "https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D"; }
        case 'React.js': { return "https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"; }
        case 'Angular': { return "https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white"; }
        case 'Bootstrap': { return "https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=fff&style=for-the-badge"; }
        case 'Turtle Graphics': { return "https://raw.githubusercontent.com/RyanMontville/ryanmontville.github.io/main/images/Turtle%20Grpahics.png"; }
        case 'Blazor': { return "https://img.shields.io/badge/Blazor-512BD4?logo=blazor&logoColor=fff&style=for-the-badge"; }
        case 'Flask': { return "https://img.shields.io/badge/Flask-58CC02?style=for-the-badge&logo=flask&logoColor=white"; }
        case 'Node.js': { return "https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white"; }
        case 'Intentionally Bad Design': { return "https://raw.githubusercontent.com/RyanMontville/ryanmontville.github.io/main/images/intbaddes.png"; }
        case 'MySQL': { return "https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"; }
        case 'PHP': { return "https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white"; }
        case 'Python Pillow': { return "https://raw.githubusercontent.com/RyanMontville/ryanmontville.github.io/refs/heads/main/images/pillow.png" }
        case 'HTML Canvas Graphics': { return "https://raw.githubusercontent.com/RyanMontville/ryanmontville.github.io/refs/heads/main/images/htmlcanvas.png" }
        case 'Firebase': { return "https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" }
        case 'Vite': { return "https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white" }
        case "Quill": { return "https://img.shields.io/badge/Quill-52B0E7?style=for-the-badge&logo=apache&logoColor=white" }
        case "D3.js": { return "https://img.shields.io/badge/D3.JS-%23000000?style=for-the-badge&logo=D3&logoColor=#ff823e" }
        default: { return ""; break; }
    }
}

export async function openSkillsModal(currentSkills: string[]): Promise<string[] | null> {
    const allAvailableSkills = ["Java", "Python", "C#", "HTML", "CSS", "JavaScript", "TypeScript", "Spring Boot", "PostgreSQL", "JSON", "Vue.js", "React.js", "Angular", "Bootstrap", "Turtle Graphics", "Blazor", "Flask", "Node.js", "Intentionally Bad Design", "MySQL", "PHP", "Python Pillow", "HTML Canvas Graphics", "Firebase", "Vite", "Quill", "D3.js"];
    allAvailableSkills.sort();
    return new Promise((resolve) => {
        const modalRoot = makeElement("div", "modal-root", null, null);
        const modalOverlay = makeElement("div", null, "modal-overlay", null);
        const modalContent = makeElement("div", null, "modal-content", null);

        const modalH2 = makeElement("h2", null, null, "Select Project Skills");
        modalContent.appendChild(modalH2);

        // Create a scrollable container for skill checkboxes
        const skillsListContainer = makeElement("div", null, "skills-checkbox-container", null);

        // Keep track of checkbox elements
        const checkboxes: { skill: string; checkbox: HTMLInputElement }[] = [];

        allAvailableSkills.forEach((skill) => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = skill;
            // Pre-check if the project already has this skill
            checkbox.checked = currentSkills.includes(skill);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(skill));
            skillsListContainer.appendChild(label);

            checkboxes.push({ skill, checkbox });
        });

        modalContent.appendChild(skillsListContainer);

        const buttonRow = makeElement("div", null, "button-row", null);

        const closeModal = () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.classList.remove("noScroll");
            if (document.body.contains(modalRoot)) {
                document.body.removeChild(modalRoot);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeModal();
                resolve(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        const submitBtn = createButton("Save Skills", "button", "submit-btn", "accent-button");
        submitBtn.onclick = function () {
            // Collect all currently checked skills into an array
            const selectedSkills = checkboxes
                .filter(item => item.checkbox.checked)
                .map(item => item.skill);

            closeModal();
            resolve(selectedSkills);
        };

        const cancelButton = createButton("Cancel", "button", "cancel-btn", "", "close");
        cancelButton.onclick = function () {
            closeModal();
            resolve(null);
        };

        buttonRow.append(cancelButton, submitBtn);
        modalContent.appendChild(buttonRow);
        modalOverlay.appendChild(modalContent);
        modalRoot.appendChild(modalOverlay);

        modalRoot.style.display = "flex";
        document.body.classList.add("noScroll");
        document.body.appendChild(modalRoot);
    });
}

export function renderSkillsRow(skills: string[]): HTMLElement {
    return skills.reduce((accSkill: HTMLElement, skill: string) => {
        const skillImg = document.createElement('img');
        skillImg.setAttribute('src', getSkillImage(skill));
        skillImg.setAttribute('alt', skill);
        skillImg.style.cursor = 'pointer';
        accSkill.appendChild(skillImg);
        return accSkill;
    }, makeElement("section", null, "skills", null));
}