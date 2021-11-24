/**
 * Hi DataMade 👋 I decided to use vanilla JS instead of jQuery this
 * time, since it's been more my jam lately. In practice, I would
 * probably use native HTML form handling for this use case, as it
 * usually makes for better accessibility and, in my experience,
 * performance and code simplicity!
 */

"use strict"

// Wire up the form
document.addEventListener("DOMContentLoaded", (e) => {
  const form = document.getElementById("address").parentElement
  form.addEventListener("submit", onSubmit)
})

// Handle form submission
async function onSubmit (e) {
  // Prevent the page from reloading on submit
  e.preventDefault()

  // Grab the form field(s)
  const formFields = e.target.elements
  const data = {
    address: formFields.address.value,
  }

  // Construct the request URL
  const url = new URL("/api/parse", window.location.toString())
  for (let field in data) {
    url.searchParams.append(field, data[field])
  }

  // Send request to the API
  try {
    const response = await fetch(url)
    // We'll reach this on any good response, even error codes
    handleResponse(response)
  } catch (err) {
    // Should only get here if the request fails (e.g. network failure, bug)
    handleRequestError(err)
  }
}

// Process a response from the API
async function handleResponse (res) {
  // Convert response body to an object
  const data = await res.json()

  // Check for error key rather than status - no need for a 500 on invalid input
  if (data.hasOwnProperty("error")) {
    renderError(data.error.title, data.error.detail)
  } else {
    renderResults(data)
  }
}

// Handle any errors thrown when sending the request
function handleRequestError (err) {
  console.error(err)
  renderError(
    "Could not contact the server",
    "Check your network connection and try again."
  )
}

function renderResults (data) {
  // Get references to some needed elements
  const resultsDiv = document.getElementById("address-results")
  const errorDiv = document.getElementById("error")
  /**
   * NOTE: "display: none" removes an element from the accessibility tree,
   * so no need to manually remove the element from markup.
   * */
  errorDiv.classList.add("d-none")

  const resultsTableBody = resultsDiv.querySelector("table>tbody")
  const typeSpan = document.getElementById("parse-type")

  // Populate address type
  typeSpan.textContent = data.address_type

  // Clear out any previous table rows (only use innerHTML for clearing)
  resultsTableBody.innerHTML = ""

  // Write rows to the table
  for (let [part, tag] of Object.entries(data.address_components)) {
    const tableRow = document.createElement("tr")
    const tagCell = document.createElement("td")
    const partCell = document.createElement("td")
    tagCell.textContent = tag
    partCell.textContent = part
    tableRow.appendChild(tagCell)
    tableRow.appendChild(partCell)
    resultsTableBody.appendChild(tableRow)
  }

  // Show results section
  resultsDiv.classList.remove("d-none")
}

// Print an error message to the page
function renderError (title, detail) {
  const resultsDiv = document.getElementById("address-results")
  const errorDiv = document.getElementById("error")
  const errorP = errorDiv.querySelector("p")
  const errorH4 = errorDiv.querySelector("h4")

  resultsDiv.classList.add("d-none")

  errorH4.textContent = title
  errorP.textContent = detail

  errorDiv.classList.remove("d-none")
}
