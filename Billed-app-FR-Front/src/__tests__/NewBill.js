/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from '@testing-library/user-event'
import mockStore from '../__mocks__/store.js'
import router from '../app/Router.js'
jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',

        })
      )
    })

    test("Then icon mail should have the 'active' class", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(mailIcon).toHaveClass('active-icon');
    })

    test("Then form new bill is displayed", async () => {
      const formNewBill = await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(formNewBill).toBeTruthy();
    });

      // describe('When I upload a file', () => {
      //   test("Then btn-send-bill should be disabled for invalid file extensions", () => {
      //     const html = NewBillUI()
      //     document.body.innerHTML = html

      //     const onNavigate = (pathname) => {
      //       document.body.innerHTML = ROUTES({ pathname })
      //     }

      //     const newBill = new NewBill({
      //       document, onNavigate, store: mockStore, localStorage: window.localStorage
      //     })
      //     // fonction

      //     const file = new File(['image.pdf'], 'image.pdf', { type: 'application/pdf' })

      //     const handleChangeFile = jest.fn((e)=> newBill.handleChangeFile(e,file))

      //     const inputFile = screen.getByTestId('file');

      //     expect(inputFile).toBeTruthy()

      //     inputFile.addEventListener('change', (e) => handleChangeFile(e, file));

      //     fireEvent.change(inputFile, {
      //       target: {
      //         files: [file],
      //       },
      //     })

      //     expect(handleChangeFile).toHaveBeenCalled()

      //     const btn = screen.getByTestId('btn-file')

      //     expect(btn).toBeDisabled()
      //   })

      //   test("Then is valid file extensions", async () => {
      //     const html = NewBillUI()
      //     document.body.innerHTML = html
        
      //     const onNavigate = (pathname) => {
      //       document.body.innerHTML = ROUTES({ pathname })
      //     }
        
      //     const newBill = new NewBill({
      //       document, onNavigate, store: mockStore, localStorage: window.localStorage
      //     })

      //     const file = new File(['image.png'], 'image.png', { type: 'image/png' })

      //     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e,file))
          
      //     const inputFile = screen.getByTestId('file');
      //     expect(inputFile).toBeTruthy()
        
      //     inputFile.addEventListener('change', (e) => handleChangeFile(e, file));
        
          
        
      //     fireEvent.change(inputFile, {
      //       target: { files: [file] },
      //     })
        
      //     // await waitFor(() => {
      //     //   const btn = screen.getByTestId('btn-file');
      //     //   expect(btn).toBeEnabled();
      //     // });
      //   });
      
      
      // })
  

      
      //new test


      describe('When I submit the form ', () => {

        test('Then should stay on newBill page', () => {
  
          
          document.body.innerHTML = NewBillUI();
          const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });
  
          // recuperation du formulaire
          const form = screen.getByTestId('form-new-bill');
  
          //expect(screen.getByTestId('expense-type').value).toBe('');
          expect(screen.getByTestId('expense-name').value).toBe('');
          expect(screen.getByTestId('datepicker').value).toBe('');
          expect(screen.getByTestId('amount').value).toBe('');
          expect(screen.getByTestId('vat').value).toBe('');
          expect(screen.getByTestId('pct').value).toBe('');
          expect(screen.getByTestId('file').value).toBe('');
  
          // Submit from
          const handlerSubmit = jest.fn((e) => newBill.handleSubmit(e));
          form.addEventListener('submit', handlerSubmit);
          fireEvent.submit(form);
  
          expect(handlerSubmit).toBeCalled();
          expect(form).toBeTruthy();
        })
      });
  })
})
