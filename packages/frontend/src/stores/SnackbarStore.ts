import { makeAutoObservable } from "mobx";

type Severity = "success" | "error" | "info" | "warning";

export class SnackbarStore {
  open = false;
  message = "";
  severity: Severity = "success";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  show(message: string, severity: Severity = "success") {
    this.message = message;
    this.severity = severity;
    this.open = true;
  }

  close() {
    this.open = false;
  }
}
