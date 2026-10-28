import type { MessageParams } from "../models/message.model";

export function makeElement(elementType: string, elementId: string | null, elementClass: string | null, elementText: string | null) {
  const newElement = document.createElement(elementType);
  if (elementId) newElement.setAttribute('id', elementId);
  if (elementClass) {
    newElement.setAttribute('class', elementClass);
  }
  if (elementText) newElement.textContent = elementText;
  return newElement;
}

export function createButton(
  buttonText: string,
  buttonType: "button" | "submit" | "reset",
  buttonId: string,
  buttonClass: string,
  icon?: string
): HTMLElement {
  const newButton = document.createElement("button");
  newButton.setAttribute("type", buttonType);
  newButton.setAttribute("id", buttonId);
  newButton.setAttribute("class", buttonClass);
  if (icon) {
    const buttonIconSpan = document.createElement("span");
    buttonIconSpan.setAttribute("class", "material-symbols-outlined");
    const buttonIcon = document.createTextNode(icon);
    buttonIconSpan.appendChild(buttonIcon);
    newButton.appendChild(buttonIconSpan);
  }
  const buttonTextElm = makeElement("span", null, null, buttonText);
  newButton.appendChild(buttonTextElm);
  return newButton;
}

export function clearMessages() {
  const messageWrappers = document.getElementsByClassName("message-wrapper");
  for (const messageWrapper of messageWrappers) {
    messageWrapper.innerHTML = "";
  }
}

export function storeMessage(params: MessageParams) {
  clearMessages();
  sessionStorage.setItem("message", JSON.stringify(params));
}

export function createMessage(
  params: MessageParams
) {
  clearMessages();
  const messageWrapper = document.getElementById(params["location"]) as HTMLElement;
  if (!messageWrapper) return;

  const messageDiv = document.createElement("div");
  if (params["type"] === "check_circle") {
    messageDiv.setAttribute("class", "success message");
    messageDiv.setAttribute("aria-live", "polite");
  } else if (params["type"] === "error") {
    messageDiv.setAttribute("class", "error message");
    messageDiv.setAttribute("role", "alert");
    console.error(params["messageBody"]);
  } else if (params["type"] === "delete" || params["type"] === "warn") {
    messageDiv.setAttribute("class", "warn message");
    messageDiv.setAttribute("aria-live", "polite");
    console.warn(params["messageBody"]);
  } else {
    messageDiv.setAttribute("class", "info message");
    messageDiv.setAttribute("aria-live", "polite");
  }

  const icon = document.createElement("span");
  icon.setAttribute("class", "material-symbols-outlined");
  const iconName = document.createTextNode(params["type"]);
  icon.appendChild(iconName);
  messageDiv.appendChild(icon);

  const messageText = document.createTextNode(params["messageBody"]);
  messageDiv.appendChild(messageText);

  const closeButton = createButton("", "button", "closeButton", "", "close");
  closeButton.addEventListener("click", () => (messageWrapper.innerHTML = ""));
  messageDiv.appendChild(closeButton);

  messageWrapper.appendChild(messageDiv);

  if (params["autoCloseSeconds"] && params["autoCloseSeconds"] > 0) {
    setTimeout(() => {
      if (messageWrapper.contains(messageDiv)) {
        messageWrapper.innerHTML = "";
      }
    }, params["autoCloseSeconds"] * 1000);
  }
}

export function createTableHeader(tableHeadings: string[], textAlign: string): HTMLTableSectionElement {
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  tableHeadings.forEach((currentHeading) => {
    const newColumnHeader = makeElement("th", null, textAlign, null);
    const columnHeaderName = document.createTextNode(currentHeading);
    newColumnHeader.appendChild(columnHeaderName);
    headerRow.appendChild(newColumnHeader);
  });

  tableHead.appendChild(headerRow);
  return tableHead;
}

export function createLink(params: {href: string, linkText: string, external: boolean}) {
  const newLink = document.createElement("a") as HTMLAnchorElement;
  newLink.href = params.href;
  newLink.textContent = params.linkText;
  if (params.external) {
    newLink.target = "_blank";
  }
  return newLink;
}

export function formatDate(rawDate: any, includeTime: boolean) {
  const lastUpdatedDate = rawDate && typeof (rawDate as any).toDate === 'function'
    ? (rawDate as any).toDate()
    : (rawDate instanceof Date ? rawDate : new Date());

  if (includeTime) {
    return lastUpdatedDate.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return lastUpdatedDate.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric'
    });
  }
}

export function createInput(
  params: 
      {id: string, 
      type: "checkbox" | "color" | "date" | "email" | "file" | "image" | "number" | "tel" | "text" | "time" | "url" | "range", 
      placeholder: string}
    ): HTMLInputElement {
  const newInput = document.createElement("input") as HTMLInputElement;
  newInput.type = params.type;
  newInput.placeholder = params.placeholder;
  newInput.id = params.id;
  newInput.name = params.id;
  return newInput;
}

export function createSelect(params: {id: string, options: {text: string, value: string}[], promptText: string}) {
  const newSelect = makeElement("select", params.id, null, "Choose category") as HTMLSelectElement;
  newSelect.name = params.id;
  params.options.map(option => {
    const newOption = new Option(option.text, option.value);
    newSelect.add(newOption);
  });
  return newSelect;
}