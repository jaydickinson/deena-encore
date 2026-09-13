(() => {
  const enquiry = document.getElementById("event-enquiry"),
    statusPanel = document.getElementById("form-status");
  if (!enquiry || !statusPanel) return;
  enquiry.querySelector("[type=submit]").disabled = false;
  enquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!enquiry.reportValidity()) return;
    const values = new FormData(enquiry);
    document.getElementById("brief-summary").textContent = [
      ["Name", "name"],
      ["Email", "email"],
      ["Company", "company"],
      ["Phone", "phone"],
      ["Location", "location"],
      ["Date", "date"],
      ["Guests", "guests"],
      ["Support", "service"],
      ["Brief", "brief"],
    ]
      .map(([label, key]) =>
        values.get(key) ? label + ": " + values.get(key) : "",
      )
      .filter(Boolean)
      .join("\n\n");
    enquiry.hidden = true;
    statusPanel.hidden = false;
    statusPanel.focus();
  });
  document.getElementById("edit-brief").addEventListener("click", () => {
    statusPanel.hidden = true;
    enquiry.hidden = false;
    enquiry.elements.name.focus();
  });
})();
