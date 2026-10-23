export type MessageParams = {
    messageBody: string;
    location: "main-message" | "modal-message";
    type: string;
    autoCloseSeconds?: number;
}