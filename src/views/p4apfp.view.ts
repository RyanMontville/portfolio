import { makeElement } from '../modules/utils.module';
import htmlContent from './p4apfp.html?raw';

export async function renderP4aPfp(): Promise<void> {
    document.title = "P4A PFP MAKER";
    const body = document.querySelector("body") as HTMLElement;
    body.innerHTML = htmlContent;
    body.style.backgroundColor = "#17214a";
    body.style.color = "#fff";

    const upload = makeElement("input", "upload", null, null);
    upload.setAttribute("type", "file");
    upload.setAttribute("accept", "image/*");
    const canvas = makeElement("canvas", "p4a-canvas", null, null) as HTMLCanvasElement;
    const downloadBtn = makeElement("button", "download", null, "Download") as HTMLButtonElement;
    const startOverButton = makeElement("button", "start-over", null, "Start Over") as HTMLButtonElement;
    startOverButton.type = "button";
    downloadBtn.type = "button";
    const ctx = canvas.getContext('2d')!;
    const frameOptionSection = document.getElementById('p4a-frame-select') as HTMLElement;
    const downloadSection = document.getElementById('p4a-canvas-container') as HTMLElement;
    const cardTitle = document.getElementById("p4a-card-title") as HTMLElement;
    const mainContent = document.getElementById("p4a-main-content") as HTMLElement;

    let overlay_src = "";

    function showImageUpload() {
        cardTitle.textContent = "< UPLOAD IMAGE >";
        mainContent.innerHTML = "";
        const uploadLabel = makeElement("label", null, "custom-file-upload", "Choose Image");
        uploadLabel.setAttribute("for", "upload");
        mainContent.append(uploadLabel, upload);
    }

    // Step 1 - User selects frame color
    cardTitle.textContent = "< SELECT FRAME COLOR >";
    const frameOptions = frameOptionSection.querySelectorAll('img');
    frameOptions.forEach((frame) => {
        frame.addEventListener('click', () => {
            frameOptions.forEach((frame) => frame.classList.remove("selected-frame"));
            overlay_src = `p4a/${frame.id}.png`;
            showImageUpload();
            frame.classList.add("selected-frame");
        });
    });

    // Step 2 - User uploads image
    upload.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;


        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                const img = new Image();
                img.onload = () => processImage(img);
                img.src = result;
                mainContent.innerHTML = "";
                const btns = makeElement("div", null, "button-row", null);
                btns.append(downloadBtn, startOverButton)
                mainContent.append(canvas, btns);
            }
        };
        reader.readAsDataURL(file);
    });

    // Step 3 - Crop image and add frame
    function processImage(img: HTMLImageElement) {
        cardTitle.textContent = "GENERATING IMAGE...";
        mainContent.classList.add("hide");

        const size = Math.min(img.width, img.height);
        const outputSize = 1000;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize);
        ctx.restore();

        const overlay = new Image();
        overlay.crossOrigin = "anonymous";
        overlay.onload = () => {
            ctx.drawImage(overlay, 0, 0, outputSize, outputSize);

            cardTitle.textContent = "DOWNLOAD IMAGE";
            mainContent.classList.remove("hide");
            downloadSection.classList.remove('hide');
        };

        overlay.onerror = () => {
            cardTitle.textContent = "ERROR LOADING FRAME";
            mainContent.classList.remove("hide");
        };

        overlay.src = overlay_src;
    }

    // Step 4 - Download button

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'p4a-2026-pfp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    startOverButton.addEventListener("click", () => {
        cardTitle.textContent = "< SELECT FRAME COLOR >";
        mainContent.innerHTML = "";
        const frameOptions = frameOptionSection.querySelectorAll('img');
        frameOptions.forEach((frame) => frame.classList.remove("selected-frame"));
    })
}