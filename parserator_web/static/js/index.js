// Hi DataMade! I decided to use vanilla JS instead of jQuery this time,
// since it's been more my jam lately. In practice, I would probably use
// native HTML form handling for this use case, as it usually makes for better
// accessibility and, in my experience, performance and code simplicity!

// Wire up the main form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("address").parentElement;
  form.addEventListener("submit", onSubmit);
});

// Handle form submission
const onSubmit = async (e) => {
  // Prevent the page from reloading on submit
  e.preventDefault();
  // Grab the address field as a string
  const formFields = e.target.elements;
  const data = {
    address: formFields.address.value,
  };
  // Construct the request URL
  const url = new URL("/api/parse", window.location.toString());
  for (let field in data) {
    url.searchParams.append(field, data[field]);
  }

  // Send request to the API
  try {
    response = await fetch(url);
    // We'll reach this on any good response, even error codes
    handleResponse(response);
  } catch (err) {
    // We should only get here if the request fails (e.g. network failure)
    handleRequestError(err);
  }
};

// Process a response from the API
const handleResponse = async (res) => {
  // Convert response body to an object
  const data = await res.json();
  // Get references to some needed elements
  const resultsDiv = document.getElementById("address-results");
  const errorDiv = document.getElementById("error");

  if (res.ok) {
    // Hide errors section
    errorDiv.classList.add("d-none");
    // Get element references
    const resultsTableBody = resultsDiv.querySelector("table>tbody");
    const typeSpan = document.getElementById("parse-type");
    // Display the address type
    typeSpan.innerText = data.address_type;
    // Clear out any previous table rows
    resultsTableBody.innerHTML = "";
    // Write rows to the table
    for (let [part, tag] of Object.entries(data.address_components)) {
      const tableRow = document.createElement("tr");
      tableRow.innerHTML = `<td>${tag}</td><td>${part}</td>`;
      resultsTableBody.appendChild(tableRow);
    }
    // Show results section
    resultsDiv.classList.remove("d-none");
  } else {
    renderError(data.error.title, data.error.detail);
  }
};

// Handle any errors thrown when sending the request
const handleRequestError = (err) => {
  console.error(err);
  renderError(
    "Could not contact the server",
    "Check your network connection and try again."
  );
};

// Print an error message to the page
const renderError = (title, detail) => {
  const resultsDiv = document.getElementById("address-results");
  const errorDiv = document.getElementById("error");
  const errorP = errorDiv.querySelector("p");
  const errorH4 = errorDiv.querySelector("h4");
  // Hide results section
  resultsDiv.classList.add("d-none");
  // Populate error message
  errorH4.innerText = title;
  errorP.innerText = detail;
  // Show error section
  errorDiv.classList.remove("d-none");
};
