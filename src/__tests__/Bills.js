/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  })

  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      window.onNavigate(ROUTES_PATH.Bills);
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);
      const windowIcon = await waitFor(() => screen.getByTestId('icon-window'));
      expect(windowIcon.getAttribute('class')).toEqual('active-icon')
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });

    test("Then it should fetch bills from the mock API", async () => {
      const iconEyes = await waitFor(() => screen.getAllByTestId('icon-eye'))
      expect(iconEyes.length).toEqual((await mockStore.bills().list()).length)
    })

    test("Then it should display the 'Nouvelle note de frais' button", () => {
      document.body.innerHTML = BillsUI({ data: bills }); // Assurez-vous que les données sont chargées
      const newBillButton = screen.getByRole('button', { name: /Nouvelle note de frais/i });
      expect(newBillButton).toBeTruthy(); // Vérifie que le bouton est présent
    });
  
  });
});
