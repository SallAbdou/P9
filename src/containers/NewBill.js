import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  // Méthode pour vérifier si l'extension de fichier est valide
  hasValidExtension = (extension, validExtensions = ['jpg', 'jpeg', 'png']) => validExtensions.includes(extension.toLowerCase())

  handleChangeFile = e => {
    e.preventDefault()
    // Sélectionne le fichier et crée un nouvel objet FormData
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    const errorExtension = this.document.querySelector("div[data-testid='error-extension']")
    errorExtension.classList.remove('show-error')
    errorExtension.classList.add('hide-error')

    // Vérifie si le nom du fichier contient une extension valide
    const fileNameSplitted = file.name.split('.')
    const extension = fileNameSplitted[fileNameSplitted.length - 1].toLowerCase()
    if (!this.hasValidExtension(extension)) {
      errorExtension.classList.add('show-error')
      errorExtension.classList.remove('hide-error')
      return
    }

    //On ajoute le fichier/mail au FormData, stock le nom du fichier puis créer le fichier
    formData.append('file', file)
    formData.append('email', email)
    this.fileName = file.name

    this.createFile(formData)
  }

  // Méthode pour gérer la soumission du formulaire
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  createFile = data => {
    if (this.store) {
      return this.store
        .bills()
        .create({
          data,
          headers: {
            noContentType: true
          }
        })
        .then(({ fileUrl, key }) => {
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
        })
        .catch(error => {
          console.error(error)
          throw error
        })
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}
