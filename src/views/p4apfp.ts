import htmlContent from './p4apfp.html?raw';

export async function renderP4aPfp(container: HTMLElement): Promise<void> {
    const body = document.querySelector("body") as HTMLElement;
    body.innerHTML = htmlContent;

    const upload = document.getElementById('upload') as HTMLInputElement;
    const canvas = document.getElementById('p4a-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const downloadBtn = document.getElementById('download') as HTMLElement;
    const frameOptionSection = document.getElementById('p4a-frame-select') as HTMLElement;
    const imageUploadSection = document.getElementById('pfa-image-upload') as HTMLElement;
    const downloadSection = document.getElementById('p4a-show-and-download-section') as HTMLElement;

    let overlay_src = "";

    // Step 1 - User selects frame color
    const frameOptions = frameOptionSection.querySelectorAll('img');
    frameOptions.forEach((frame) => {
        frame.addEventListener('click', () => {
            overlay_src = `p4a/${frame.id}.png`;
            frameOptionSection.classList.add('hide');
            imageUploadSection.classList.remove('hide');
        });
    });

    // Step 2 - User uploads image
    upload.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        // Show loading status feedback
        imageUploadSection.innerHTML = `<h2>Generating pfp...</h2>`;

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                const img = new Image();
                img.onload = () => processImage(img);
                img.src = result;
            }
        };
        reader.readAsDataURL(file);
    });

    // Step 3 - Crop image and add frame
    function processImage(img: HTMLImageElement) {
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
            imageUploadSection.classList.add('hide');
            downloadSection.classList.remove('hide');
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
}