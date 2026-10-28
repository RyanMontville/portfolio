import { createButton, makeElement } from "./utils.module";

export function createImageCarousel(images: {src: string, alt: string}[]): HTMLElement {
    let imageIndex: number = 0;
  const numImages: number = images.length;
  //Create Main Elements
  const carouselContainer = document.createElement('div');
  carouselContainer.setAttribute("class", "carousel");
  const content = document.createElement('section');
  content.setAttribute('class', 'carousel-content');
  const screenshot = document.createElement('img');
  const screenshotDescriptionP = document.createElement('p');
  //Core Update Function
  const updateCarousel = () => {
    const currentImage = images[imageIndex];
    const screenshotSource = currentImage.src;
    const screenshotDescription = currentImage.alt;
    //Update Image Attributes
    screenshot.setAttribute('src', screenshotSource);
    screenshot.setAttribute('alt', screenshotDescription);
    screenshot.setAttribute('title', screenshotDescription);
    //Update Description Text
    screenshotDescriptionP.textContent = screenshotDescription;
    //Update Dots (if they exist)
    const dotsContainer = carouselContainer.querySelector('.dots');
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === imageIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  };
  //Initial Setup
  updateCarousel();
  screenshot.addEventListener('click', () => window.open(images[imageIndex].src, '_blank'));
  //Navigation Logic
  if (numImages > 1) {
    //Helper to calculate the next/previous index
    const nextIndex = (current: number) => (current + 1) % numImages;
    const prevIndex = (current: number) => (current - 1 + numImages) % numImages;
    //Previous Button
    const previousButton = createButton("", "button", "prevBtn", "previousImageButton");
    const prevIcon = makeElement("span", null, "material-symbols-outlined", "arrow_back_ios");
    previousButton.appendChild(prevIcon);
    
    previousButton.addEventListener('click', () => {
      imageIndex = prevIndex(imageIndex);
      updateCarousel();
    });
    content.appendChild(previousButton);
    //Next Button
    const nextButton = createButton("", "button", "nextBtn", "nextImageButton");
    const nextIcon = makeElement("span", null, "material-symbols-outlined", "arrow_forward_ios");
    nextButton.appendChild(nextIcon);
    nextButton.addEventListener('click', () => {
      imageIndex = nextIndex(imageIndex);
      updateCarousel();
    });
    content.appendChild(nextButton);
  }
  content.appendChild(screenshot);
  content.appendChild(screenshotDescriptionP);
  carouselContainer.appendChild(content);
  //Create Dots
  if (numImages > 1) {
    const dots = document.createElement('section');
    dots.setAttribute('class', "dots");
    images.forEach((currentImage, index) => {
      const dot = createButton(`${index + 1}`, "button", currentImage.alt, "dot");
      //Set initial active class
      if (index === imageIndex) {
        dot.classList.add('active');
      }
      dot.addEventListener('click', () => {
        imageIndex = index;
        updateCarousel();
      });
      dots.appendChild(dot);
    });
    carouselContainer.appendChild(dots);
  }
  return carouselContainer;
}