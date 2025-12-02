const XLSX = require("xlsx");
const workbook = XLSX.readFile("/tmp/lead_generation_0_2025-12-02.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let invalidRows = [];

rows.forEach((row, i) => {
  const name = row["Name"] || "";
  const firstName = row["First name"] || "";
  const lastName = row["Last name"] || "";
  const email = row["Email"] || "";

  const combinedName = name.trim() || [firstName, lastName].filter(Boolean).join(" ").trim();
  const emailValid = emailRegex.test(email);

  const errors = [];
  if (combinedName === "") errors.push("No name");
  if (email.trim() === "") errors.push("No email");
  else if (emailValid === false) errors.push("Invalid email: " + email);

  if (errors.length > 0) {
    invalidRows.push({ row: i+2, firstName, lastName, name, email, errors: errors.join(", ") });
  }
});

console.log("Found " + invalidRows.length + " invalid rows:");
invalidRows.forEach(r => {
  const displayName = (r.name || (r.firstName + " " + r.lastName)).trim() || "(empty)";
  console.log("Row " + r.row + ": " + r.errors + " | Name: " + displayName + " | Email: " + (r.email || "(empty)"));
});
