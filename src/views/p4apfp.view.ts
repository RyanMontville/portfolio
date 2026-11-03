import { makeElement } from '../modules/utils.module';
import htmlContent from './p4apfp.html?raw';

const frameImages: Record<number, string> = {
    1: "aqua",
    2: "green",
    3: "navy",
    4: "orange"
};

export async function renderP4aPfp(): Promise<void> {
    document.title = "P4A PFP MAKER";
    const body = document.querySelector("body") as HTMLElement;
    body.innerHTML = htmlContent;
    body.style.backgroundColor = "#17214a";
    body.style.color = "#fff";

    // DOM Elements
    const imageOutputRow = document.getElementById("image-output-row") as HTMLElement;
    const canvas = document.getElementById("p4a-canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const prevBtn = document.getElementById("prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("next") as HTMLButtonElement;

    // Upload Row
    const uploadRow = document.getElementById("upload-row") as HTMLElement;
    const upload = makeElement("input", "upload", null, null) as HTMLInputElement;
    upload.setAttribute("type", "file");
    upload.setAttribute("accept", "image/*");
    const uploadLabel = makeElement("label", null, "custom-file-upload", "Choose Image");
    uploadLabel.setAttribute("for", "upload");
    uploadRow.append(uploadLabel, upload);

    // Download row
    const downloadRow = document.getElementById("download-row") as HTMLElement;
    const downloadBtn = makeElement("button", "download", null, "Download") as HTMLButtonElement;
    const startOverButton = makeElement("button", "start-over", null, "Start Over") as HTMLButtonElement;
    startOverButton.type = "button";
    downloadBtn.type = "button";
    downloadRow.append(downloadBtn, startOverButton);

    // Frame selections
    const frameOptionSection = document.getElementById('p4a-frame-select') as HTMLElement;
    const frameKeys = Object.keys(frameImages).map(Number);

    const frameContainer = frameKeys.reduce((acc: HTMLElement, id) => {
        const colorName = frameImages[id];
        const nextImg = makeElement("img", String(id), "p4a-pfp-overlay", null) as HTMLImageElement;
        nextImg.src = `p4a/${colorName}.png`;
        acc.appendChild(nextImg);
        return acc;
    }, makeElement("div", null, "p4a-frame-container", null));
    frameOptionSection.appendChild(frameContainer);

    // Card title / Instructions
    const cardTitle = document.getElementById("p4a-card-title") as HTMLElement;

    let currentImg: HTMLImageElement | null = null;
    let selectedKeyIndex = 0;

    function getSelectedColor(): string {
        return frameImages[frameKeys[selectedKeyIndex]];
    }

    function setActiveClass(index: number) {
        const frameOptions = frameOptionSection.querySelectorAll('img');
        frameOptions.forEach(frame => frame.classList.remove("selected-frame"));
        if (frameOptions[index]) {
            frameOptions[index].classList.add("selected-frame");
        }
    }

    function processImage() {
        if (!currentImg) return;
        cardTitle.textContent = "GENERATING IMAGE...";
        imageOutputRow.classList.add("hide");
        downloadRow.classList.add("hide");

        const size = Math.min(currentImg.width, currentImg.height);
        const outputSize = 1000;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const sx = (currentImg.width - size) / 2;
        const sy = (currentImg.height - size) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(currentImg, sx, sy, size, size, 0, 0, outputSize, outputSize);
        ctx.restore();

        const overlay = new Image();
        overlay.crossOrigin = "anonymous";
        overlay.onload = () => {
            ctx.drawImage(overlay, 0, 0, outputSize, outputSize);
            cardTitle.textContent = "SELECT FRAME COLOR";
            imageOutputRow.classList.remove("hide");
            downloadRow.classList.remove("hide");
        };

        overlay.onerror = () => {
            cardTitle.textContent = "ERROR LOADING FRAME";
            imageOutputRow.classList.add("hide");
            downloadRow.classList.add("hide");
        };

        overlay.src = `p4a/${getSelectedColor()}.png`;
    }

    upload.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                currentImg = new Image();
                currentImg.src = result;
                currentImg.onload = () => {
                    selectedKeyIndex = 0;
                    setActiveClass(selectedKeyIndex);
                    frameOptionSection.classList.remove("hide");
                    uploadRow.classList.add("hide");
                    processImage();
                };
            }
        };
        reader.readAsDataURL(file);
    });

    prevBtn.addEventListener("click", () => {
        if (!currentImg) return;
        selectedKeyIndex = (selectedKeyIndex - 1 + frameKeys.length) % frameKeys.length;
        setActiveClass(selectedKeyIndex);
        processImage();
    });

    nextBtn.addEventListener("click", () => {
        if (!currentImg) return;
        selectedKeyIndex = (selectedKeyIndex + 1) % frameKeys.length;
        setActiveClass(selectedKeyIndex);
        processImage();
    });
    frameOptionSection.querySelectorAll('img').forEach((frame, idx) => {
        frame.addEventListener('click', () => {
            if (!currentImg) return;
            selectedKeyIndex = idx;
            setActiveClass(selectedKeyIndex);
            processImage();
        });
    });

    window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (!currentImg || frameOptionSection.classList.contains("hide")) return;

        if (e.key === "ArrowLeft") {
            selectedKeyIndex = (selectedKeyIndex - 1 + frameKeys.length) % frameKeys.length;
            setActiveClass(selectedKeyIndex);
            processImage();
        } else if (e.key === "ArrowRight") {
            selectedKeyIndex = (selectedKeyIndex + 1) % frameKeys.length;
            setActiveClass(selectedKeyIndex);
            processImage();
        }
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'p4a-2026-pfp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    startOverButton.addEventListener("click", () => {
        upload.value = "";
        currentImg = null;
        setActiveClass(0);
        uploadRow.classList.remove("hide");
        imageOutputRow.classList.add("hide");
        downloadRow.classList.add("hide");
        frameOptionSection.classList.add("hide");
        cardTitle.textContent = "UPLOAD IMAGE";
    });

    // Initial state setup
    cardTitle.textContent = "UPLOAD IMAGE";
    imageOutputRow.classList.add("hide");
    downloadRow.classList.add("hide");
    frameOptionSection.classList.add("hide");
}