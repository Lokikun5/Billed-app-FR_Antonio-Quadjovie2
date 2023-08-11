/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { bills } from "../fixtures/bills.js";
import user from "@testing-library/user-event";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
    });

    test("Then icon mail should have the 'active' class", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      //to-do write expect expression
      expect(mailIcon).toHaveClass("active-icon");
    });

    test("Then form new bill is displayed", async () => {
      const formNewBill = await waitFor(() =>
        screen.getByTestId("form-new-bill")
      );
      expect(formNewBill).toBeTruthy();
    });

    describe("I am on NewBill Page and I upload file", () => {
      test("added valid extensions", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // render the component
        document.body.innerHTML = NewBillUI();

        const uploader = screen.getByTestId("file");
        fireEvent.change(uploader, {
          target: {
            files: [new File(["image"], "image.png", { type: "image/png" })],
          },
        });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(() => newBills.handleChangeFile);

        uploader.addEventListener("change", handleChangeFile);
        fireEvent.change(uploader);

        expect(uploader.files[0].name).toBe("image.png");
        expect(uploader.files[0].name).toMatch(/(jpeg|jpg|png)/);
        expect(handleChangeFile).toHaveBeenCalled();
      });

      test("cancel upload bad file extension", () => {
        document.body.innerHTML = NewBillUI();

        const uploader = screen.getByTestId("file");
        fireEvent.change(uploader, {
          target: {
            files: [
              new File(["image"], "image.pdf", { type: "application/pdf" }),
            ],
          },
        });

        const img = document.querySelector(`input[data-testid="file"]`);

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(newBills.handleChangeFile);

        uploader.addEventListener("change", handleChangeFile);

        fireEvent.change(uploader);

        expect(img.files[0].name).not.toMatch(/(jpeg|jpg|png)/);
      });
    });

    //new test
    describe("When I submit the form ", () => {
      test("form validation", async () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        document.body.innerHTML = NewBillUI();
        window.onNavigate(ROUTES_PATH.NewBill);

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const inputData = bills[0];
        const formNewBill = screen.getByTestId("form-new-bill");

        //get the different fields

        const expenseType = screen.getByTestId("expense-type");
        const expenseName = screen.getByTestId("expense-name");
        const amount = screen.getByTestId("amount");
        const date = screen.getByTestId("datepicker");
        const vat = screen.getByTestId("vat");
        const pct = screen.getByTestId("pct");
        const commentary = screen.getByTestId("commentary");
        const input = screen.getByTestId("file");
        const file = new File(["img"], inputData.fileName, {
          type: "image/jpg",
        });

        //Fill the fields from to make sure it is valid
        userEvent.selectOptions(
          expenseType,
          screen.getByRole("option", { name: inputData.type })
        );
        expect(
          screen.getByRole("option", { name: inputData.type }).selected
        ).toBe(true);

        fireEvent.change(expenseName, { target: { value: inputData.name } });
        expect(expenseName.value).toBe(inputData.name);

        fireEvent.change(amount, { target: { value: inputData.amount } });
        expect(amount.value).toBe(inputData.amount.toString());

        fireEvent.change(date, { target: { value: inputData.date } });
        expect(date.value).toBe(inputData.date);

        fireEvent.change(vat, { target: { value: inputData.vat } });
        expect(vat.value).toBe(inputData.vat);

        fireEvent.change(pct, { target: { value: inputData.pct } });
        expect(pct.value).toBe(inputData.pct.toString());

        fireEvent.change(commentary, {
          target: { value: inputData.commentary },
        });
        expect(commentary.value).toBe(inputData.commentary);

        user.upload(input, file);

        //Submit form
        const handleSubmit = jest.fn(newBill.handleSubmit);
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });

      test("fetches message from API", async () => {
        const bill = {
          type: "Restaurants et bars",
          name: "test",
          amount: 200,
          date: "2023-08-04",
          vat: "40",
          pct: 20,
          commentary: "test commentary",
          fileName: "test.jpg",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
          status: "pending",
          commentAdmin: "",
          email: "a@a",
        };

        const callStore = jest.spyOn(mockStore, "bills");

        mockStore.bills().create(bill);

        expect(callStore).toHaveBeenCalled();
      });
    });
  });
});
