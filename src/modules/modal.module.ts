import { createButton, makeElement } from "./utils.module";

export async function confirmDeleteModal(messageHeader: string, messageBody: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modalRoot = makeElement("div", "modal-root", null, null);
    const modalOverlay = makeElement("div", null, "modal-overlay", null);
    const modalContent = makeElement("div", null, "modal-content", null);

    const modalH2 = makeElement("h2", null, null, messageHeader);
    modalContent.appendChild(modalH2);

    const modalMessage = makeElement("p", null, null, messageBody);
    modalContent.appendChild(modalMessage);

    const formRow = makeElement("div", null, "button-row", null);

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
        resolve(false);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = modalContent.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const deleteButton = createButton("Delete", "button", "delete-btn", "delete-button", "delete");
    deleteButton.onclick = function () {
      closeModal();
      resolve(true);
    };

    const cancelButton = createButton("Cancel", "button", "cancel-btn", "");
    cancelButton.onclick = function () {
      closeModal();
      resolve(false);
    };
    formRow.append(cancelButton, deleteButton);

    modalContent.appendChild(formRow);
    modalOverlay.appendChild(modalContent);
    modalRoot.appendChild(modalOverlay);

    modalRoot.style.display = 'flex';
    document.body.classList.add("noScroll");
    document.body.appendChild(modalRoot);

    cancelButton.focus();
  });
}

export interface InputConfig {
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export async function createModal(
  messageHeader: string,
  inputs: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[],
  buttonText: string,
  modalRequired: boolean = false,
): Promise<string[] | null> {
  return new Promise((resolve) => {
    const modalRoot = makeElement("div", "modal-root", null, null);
    const modalOverlay = makeElement("div", null, "modal-overlay", null);
    const modalContent = makeElement("div", null, "modal-content", null);

    const modalH2 = makeElement("h2", null, null, messageHeader);
    modalH2.style.whiteSpace = "pre-line";
    modalContent.appendChild(modalH2);
    inputs.map(input => modalContent.appendChild(input));

    const buttonRow = makeElement("div", null, "button-row", null);

    const closeModal = () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("noScroll");
      if (document.body.contains(modalRoot)) {
        document.body.removeChild(modalRoot);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalRequired) {
        closeModal();
        resolve(null);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = modalContent.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const submitBtn = createButton(buttonText, "button", "submit-btn", "accent-button");
    submitBtn.onclick = function () {
      for (const input of inputs) {
        if (input.required && !input.value.trim()) {
          input.reportValidity?.();
          input.focus();
          return;
        }
      }

      const results = inputs.map((input) => input.value);
      closeModal();
      resolve(results);
    };

    if (!modalRequired) {
      const cancelButton = createButton("Cancel", "button", "cancel-btn", "", "close");
      cancelButton.onclick = function () {
        closeModal();
        resolve(null);
      };
      buttonRow.appendChild(cancelButton);
    }
    buttonRow.appendChild(submitBtn);
    modalContent.appendChild(buttonRow);
    modalOverlay.appendChild(modalContent);
    modalRoot.appendChild(modalOverlay);

    modalRoot.style.display = "flex";
    document.body.classList.add("noScroll");
    document.body.appendChild(modalRoot);

    if (inputs.length > 0) {
      inputs[0].focus();
    } else {
      submitBtn.focus();
    }
  });
}