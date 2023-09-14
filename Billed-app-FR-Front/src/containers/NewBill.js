import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    // fix 3
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
  
    let toAllowExtensions = ["jpg", "jpeg", "png"];
  
    let extensionSplit = fileName.split(".");
    let extension = extensionSplit[extensionSplit.length - 1];
  
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
  
    formData.append("file", file);
    formData.append("email", email);
  
    if (!toAllowExtensions.includes(extension.toLowerCase())) {
      // Invalid file format, show an error message
      const errorMessageElement = document.createElement("div");
      errorMessageElement.textContent = "Format de fichier invalide";
      errorMessageElement.style.color = "red";
  
      // Remove the previous error message if it exists
      const existingErrorMessage = fileInput.parentElement.querySelector(".error-message");
      if (existingErrorMessage) {
        fileInput.parentElement.removeChild(existingErrorMessage);
      }
  
      errorMessageElement.classList.add("error-message");
      fileInput.parentElement.appendChild(errorMessageElement);
  
      // Clear the file input
      fileInput.value = "";
    } else {
      // Remove any existing error message
      const existingErrorMessage = fileInput.parentElement.querySelector(".error-message");
      if (existingErrorMessage) {
        fileInput.parentElement.removeChild(existingErrorMessage);
      }
  
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then((data) => {
          this.billId = data.key;
          this.fileUrl = data.fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => console.error(error));
    }
  };
  

  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
