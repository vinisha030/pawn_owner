
/* ============================================
   VINISHA PAWNBROKING
   OWNER DASHBOARD - COMPLETE JAVASCRIPT
   ============================================

   DEMO LOGIN:
   Mobile: 9876543210
   Password: owner123

   NOTE:
   This is a frontend demo using localStorage.
   Do not use hardcoded login for a real business.
============================================ */


/* ============================================
   GLOBAL DATA
============================================ */

let bills = [];
let cameraStream = null;
let capturedPhotos = {
  customer: "",
  item: ""
};


// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", function () {

  // Load saved bills safely
  try {
    bills = JSON.parse(localStorage.getItem("bills")) || [];
    bills = bills.map(normalizeBill);
  } catch (error) {
    bills = [];
    console.error("Error loading bills:", error);
  }

  // Connect login form
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      login();
    });
  }

  // Connect bill form
  const billForm = document.getElementById("billForm");

  if (billForm) {
    billForm.addEventListener("submit", addBill);
  }

  const sampleBillButton = document.getElementById("sampleBillButton");

  if (sampleBillButton) {
    sampleBillButton.addEventListener("click", showSampleBillPreview);
  }

  initializeCameraControls();

  const itemTypeSelector = document.getElementById("itemType");

  if (itemTypeSelector) {
    itemTypeSelector.addEventListener("change", toggleOtherItemField);
  }

  const metalTypeSelector = document.getElementById("metalType");

  if (metalTypeSelector) {
    metalTypeSelector.addEventListener("change", updateBillNumberHint);
    updateBillNumberHint();
  }

  const billMetalFilter = document.getElementById("billMetalFilter");

  if (billMetalFilter) {
    billMetalFilter.addEventListener("change", updateTable);
  }

  // Connect month selector
  const monthSelector = document.getElementById("monthSelector");

  if (monthSelector) {
    monthSelector.addEventListener("change", showMonthData);
  }

  // Connect logout button
  const logoutButton = document.querySelector(".logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  // Display date
  showDate();

  renderYearProgress();

});

// ============================================
// LOGIN
// ============================================

function login() {

  const mobileElement = document.getElementById("loginMobile");
  const passwordElement = document.getElementById("loginPassword");
  const errorElement = document.getElementById("loginError");

  if (!mobileElement || !passwordElement) {
    console.error("Login fields are missing from HTML.");
    return;
  }

  const mobile = mobileElement.value.trim();
  const password = passwordElement.value;

  if (mobile === "9876543210" && password === "owner123") {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    errorElement.textContent = "";
    loadDashboard();
    startCamera();
  } else {
    errorElement.textContent = "Incorrect mobile number or password.";
  }

}


// ============================================
// LOGOUT
// ============================================

function logout() {

  if (!window.confirm("Are you sure you want to logout?")) {
    return;
  }

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");

  document.getElementById("loginMobile").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").textContent = "";

}


// ============================================
// DATE
// ============================================

function showDate() {

  const today = new Date();

  const todayDate = document.getElementById("todayDate");
  const currentMonth = document.getElementById("currentMonth");

  if (todayDate) {
    todayDate.textContent = today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  if (currentMonth) {
    currentMonth.textContent = today.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  }

}


// ============================================
// ADD BILL
// ============================================

function addBill(event) {

  event.preventDefault();

  const billNumber = document.getElementById("billNumber");
  const metalType = document.getElementById("metalType");
  const customerName = document.getElementById("customerName");
  const customerMobile = document.getElementById("customerMobile");
  const aadharLast4 = document.getElementById("aadharLast4");
  const customerAddress = document.getElementById("customerAddress");
  const itemType = document.getElementById("itemType");
  const otherItem = document.getElementById("otherItem");
  const remark = document.getElementById("remark");
  const loanAmount = document.getElementById("loanAmount");
  const itemAmount = document.getElementById("itemAmount");
  const interestRate = document.getElementById("interestRate");

  if (
    !billNumber ||
    !metalType ||
    !customerName ||
    !customerMobile ||
    !aadharLast4 ||
    !customerAddress ||
    !itemType ||
    !otherItem ||
    !remark ||
    !loanAmount ||
    !itemAmount ||
    !interestRate
  ) {
    alert("Some bill form fields are missing in index.html.");
    return;
  }

  if (!capturedPhotos.customer || !capturedPhotos.item) {
    alert("Please capture both the customer photo and item photo.");
    return;
  }

  const amount = Number(loanAmount.value);
  const valuation = Number(itemAmount.value);
  const rate = Number(interestRate.value);
  const formattedBillNumber = billNumber.value.trim().toUpperCase();
  const selectedItem = itemType.value === "Other"
    ? otherItem.value.trim()
    : itemType.value.trim();
  const billNumberPattern = metalType.value === "Gold"
    ? /^G\d{4}$/
    : /^S\d{4}$/;

  if (
    !billNumberPattern.test(formattedBillNumber) ||
    metalType.value === "" ||
    customerName.value.trim() === "" ||
    customerMobile.value.trim() === "" ||
    aadharLast4.value.trim() === "" ||
    customerAddress.value.trim() === "" ||
    selectedItem === "" ||
    amount <= 0 ||
    valuation <= 0 ||
    !/^\d{10}$/.test(customerMobile.value.trim()) ||
    rate < 1 ||
    rate > 5 ||
    amount > valuation
    || !/^\d{4}$/.test(aadharLast4.value.trim())
  ) {
    alert("Please enter valid bill details.");
    return;
  }

  // Prevent duplicate bill numbers
  const duplicateBill = bills.some(function (bill) {
    return bill.billNumber.toLowerCase() ===
      billNumber.value.trim().toLowerCase();
  });

  if (duplicateBill) {
    alert("This bill number already exists.");
    return;
  }

  const bill = {

    billNumber: formattedBillNumber,

    metalType: metalType.value,

    customerName: customerName.value.trim(),

    customerMobile: customerMobile.value.trim(),

    aadharLast4: aadharLast4.value.trim(),

    customerAddress: customerAddress.value.trim(),

    itemType: selectedItem,

    remark: remark.value.trim(),

    loanAmount: amount,

    itemAmount: valuation,

    interestRate: rate,

    customerPhoto: capturedPhotos.customer,

    itemPhoto: capturedPhotos.item,

    date: new Date().toISOString()

  };

  // Rate is rupees charged per ₹100 of principal each month.
  bill.monthlyInterest = calculateMonthlyInterest(
    bill.loanAmount,
    bill.interestRate
  );

  // Save bill in array
  bills.push(bill);

  // Save bills in browser storage
  localStorage.setItem("bills", JSON.stringify(bills));

  const billForm = document.getElementById("billForm");

  if (billForm) {
    billForm.reset();
  }

  resetCapturedPhotos();

  loadDashboard();
  showPrintPreview(bill);

}


// ============================================
// DASHBOARD
// ============================================

function loadDashboard() {

  showDate();

  updateSummary();

  updateTable();

  renderYearProgress();

  createMonthSelector();

  showMonthData();

}


// ============================================
// SUMMARY
// ============================================

function updateSummary() {

  const gold = bills.filter(function (bill) {
    return bill.metalType === "Gold";
  }).length;

  const silver = bills.filter(function (bill) {
    return bill.metalType === "Silver";
  }).length;

  const totalInterest = bills.reduce(function (sum, bill) {
    return sum + Number(bill.monthlyInterest || 0);
  }, 0);

  setText("goldBills", gold);
  setText("silverBills", silver);
  setText("totalBills", bills.length);
  setText("monthInterest", formatMoney(totalInterest));

  const now = new Date();

  const currentMonthBills = bills.filter(function (bill) {

    const date = new Date(bill.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );

  });

  const monthlyGold = currentMonthBills.filter(function (bill) {
    return bill.metalType === "Gold";
  }).length;

  const monthlySilver = currentMonthBills.filter(function (bill) {
    return bill.metalType === "Silver";
  }).length;

  const monthlyLoan = currentMonthBills.reduce(function (sum, bill) {
    return sum + Number(bill.loanAmount || 0);
  }, 0);

  const monthlyInterest = currentMonthBills.reduce(function (sum, bill) {
    return sum + Number(bill.monthlyInterest || 0);
  }, 0);

  setText("monthlyBills", currentMonthBills.length);
  setText("monthlyGold", monthlyGold);
  setText("monthlySilver", monthlySilver);
  setText("monthlyLoan", formatMoney(monthlyLoan));
  setText("monthlyInterest", formatMoney(monthlyInterest));

}


// ============================================
// UPDATE TABLE
// ============================================

function updateTable() {

  const table = document.getElementById("currentBillTableBody");
  const tableWrapper = document.getElementById("currentBillsTable");
  const filter = document.getElementById("billMetalFilter");

  if (!table || !tableWrapper || !filter) {
    console.warn("Current bill table containers are missing from HTML.");
    return;
  }

  table.innerHTML = "";

  if (!filter.value) {
    tableWrapper.classList.add("hidden");
    return;
  }

  tableWrapper.classList.remove("hidden");

  bills.slice().sort(function (firstBill, secondBill) {
    return new Date(secondBill.date) - new Date(firstBill.date);
  }).forEach(function (bill) {
    appendBillRow(table, bill, filter.value);
  });

}


function appendBillRow(table, bill, view) {

  if (view !== "All" && bill.metalType !== view) {
    return;
  }

  const row = document.createElement("tr");
  const values = [
    formatBillDate(bill.date),
    bill.billNumber,
    bill.metalType,
    bill.customerName,
    formatMoney(bill.loanAmount)
  ];

  values.forEach(function (value, index) {
    const cell = document.createElement("td");

    if (index === 1) {
      const strong = document.createElement("strong");
      strong.textContent = value;
      cell.appendChild(strong);
    } else {
      cell.textContent = value;
    }

    row.appendChild(cell);
  });

  const actionCell = document.createElement("td");
  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.className = "view-btn";
  viewButton.textContent = "View Bill";
  viewButton.addEventListener("click", function () {
    showPrintPreview(bill);
  });

  actionCell.appendChild(viewButton);
  row.appendChild(actionCell);
  table.appendChild(row);

}


function formatBillDate(dateValue) {

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


// ============================================
// MONTH SELECTOR
// ============================================

function createMonthSelector() {

  const selector = document.getElementById("monthSelector");

  if (!selector) {
    console.warn("monthSelector is missing from HTML.");
    return;
  }

  const previousValue = selector.value;

  selector.innerHTML = "";

  const today = new Date();

  for (let offset = 0; offset < 12; offset += 1) {

    const date = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1
    );

    const option = document.createElement("option");

    option.value =
      date.getFullYear() + "-" + date.getMonth();

    option.textContent = date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });

    selector.appendChild(option);

  }

  // Restore previous selection when available
  if (
    previousValue &&
    Array.from(selector.options).some(function (option) {
      return option.value === previousValue;
    })
  ) {
    selector.value = previousValue;
  }

}


// ============================================
// MONTH DATA
// ============================================

function showMonthData() {

  const selector = document.getElementById("monthSelector");

  if (!selector || !selector.value) {
    return;
  }

  const parts = selector.value.split("-");

  const year = Number(parts[0]);
  const month = Number(parts[1]);

  const monthBills = bills.filter(function (bill) {

    const date = new Date(bill.date);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month
    );

  });

  const gold = monthBills.filter(function (bill) {
    return bill.metalType === "Gold";
  }).length;

  const silver = monthBills.filter(function (bill) {
    return bill.metalType === "Silver";
  }).length;

  const loan = monthBills.reduce(function (sum, bill) {
    return sum + Number(bill.loanAmount || 0);
  }, 0);

  const interest = monthBills.reduce(function (sum, bill) {
    return sum + Number(bill.monthlyInterest || 0);
  }, 0);

  setText("historyLoan", formatMoney(loan));
  setText("historyGold", gold);
  setText("historySilver", silver);
  setText("historyInterest", formatMoney(interest));

}


// ============================================
// HELPER FUNCTION
// ============================================

function setText(elementId, value) {

  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = value;
  }

}


function toggleOtherItemField() {

  const itemType = document.getElementById("itemType");
  const otherItemField = document.getElementById("otherItemField");
  const otherItem = document.getElementById("otherItem");

  if (!itemType || !otherItemField || !otherItem) {
    return;
  }

  const isOther = itemType.value === "Other";

  otherItemField.classList.toggle("hidden", !isOther);
  otherItem.required = isOther;

  if (!isOther) {
    otherItem.value = "";
  }

}


// ============================================
// MONEY FORMAT
// ============================================

function formatMoney(amount) {

  const number = Number(amount) || 0;

  return "₹" + number.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

}


// ============================================
// TWELVE-MONTH PROGRESS
// ============================================

function renderYearProgress() {

  const progress = document.getElementById("yearProgress");

  if (!progress) {
    return;
  }

  const today = new Date();
  const months = [];

  for (let offset = 11; offset >= 0; offset -= 1) {

    const date = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1
    );

    const monthBills = bills.filter(function (bill) {
      const billDate = new Date(bill.date);

      return (
        billDate.getFullYear() === date.getFullYear() &&
        billDate.getMonth() === date.getMonth()
      );
    });

    months.push({
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      count: monthBills.length
    });

  }

  const maximum = Math.max(1, ...months.map(function (month) {
    return month.count;
  }));

  progress.innerHTML = months.map(function (month) {
    const height = Math.max(8, (month.count / maximum) * 100);

    return `
      <div class="progress-month" title="${month.label}: ${month.count} bills">
        <div class="progress-track">
          <div class="progress-fill" style="height: ${height}%"></div>
        </div>
        <strong>${month.count}</strong>
        <span>${month.label}</span>
      </div>
    `;
  }).join("");

}


// ============================================
// BILL CALCULATIONS
// ============================================

function calculateMonthlyInterest(principal, ratePerHundred) {

  return (Number(principal) / 100) * Number(ratePerHundred);

}


function normalizeBill(bill) {

  const normalized = {
    ...bill,
    aadharLast4: String(bill.aadharLast4 || ""),
    customerAddress: String(bill.customerAddress || ""),
    remark: String(bill.remark || ""),
    itemAmount: Number(bill.itemAmount || bill.loanAmount || 0),
    loanAmount: Number(bill.loanAmount || 0),
    interestRate: Number(bill.interestRate || 0)
  };

  normalized.customerPhoto = String(bill.customerPhoto || "");
  normalized.itemPhoto = String(bill.itemPhoto || "");

  normalized.monthlyInterest = calculateMonthlyInterest(
    normalized.loanAmount,
    normalized.interestRate
  );

  return normalized;

}


function showPrintPreview(bill) {

  const preview = document.getElementById("printPreview");

  if (!preview) {
    return;
  }

  setText("printBillNumber", bill.billNumber);
  setText("printMetalType", bill.metalType);
  setText("printCustomerName", bill.customerName);
  setText("printCustomerMobile", bill.customerMobile);
  setText("printAadharLast4", bill.aadharLast4);
  setText("printCustomerAddress", bill.customerAddress);
  setText("printItemType", bill.itemType);
  setText("printRemark", bill.remark || "-");
  setText("printItemAmount", formatMoney(bill.itemAmount));
  setText("printLoanAmount", formatMoney(bill.loanAmount));
  setText("printInterestRate", "₹" + bill.interestRate + " / ₹100");
  setText("printDate", new Date(bill.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }));

  setImage("printCustomerPhoto", bill.customerPhoto);
  setImage("printItemPhoto", bill.itemPhoto);

  preview.classList.remove("hidden");

}


function closePrintPreview() {

  const preview = document.getElementById("printPreview");

  if (preview) {
    preview.classList.add("hidden");
  }

}


function printBill() {
  window.print();

}


function updateBillNumberHint() {

  const metalType = document.getElementById("metalType");
  const billNumber = document.getElementById("billNumber");

  if (!metalType || !billNumber) {
    return;
  }

  if (metalType.value === "Gold") {
    billNumber.placeholder = "Next Gold bill number";
    billNumber.pattern = "G[0-9]{4}";
    billNumber.value = getNextBillNumber("G");
  } else if (metalType.value === "Silver") {
    billNumber.placeholder = "Next Silver bill number";
    billNumber.pattern = "S[0-9]{4}";
    billNumber.value = getNextBillNumber("S");
  } else {
    billNumber.placeholder = "Select Gold or Silver";
    billNumber.removeAttribute("pattern");
    billNumber.value = "";
  }

}


function getNextBillNumber(prefix) {

  const numberPattern = new RegExp("^" + prefix + "(\\d{4})$");
  let highestNumber = 0;

  bills.forEach(function (bill) {
    const match = String(bill.billNumber || "").toUpperCase().match(numberPattern);

    if (match) {
      highestNumber = Math.max(highestNumber, Number(match[1]));
    }
  });

  return prefix + String(highestNumber + 1).padStart(4, "0");

}


// ============================================
// WEBCAM PHOTO CAPTURE
// ============================================

function initializeCameraControls() {

  const startButton = document.getElementById("startCameraButton");

  if (startButton) {
    startButton.addEventListener("click", startCamera);
  }

  document.querySelectorAll(".capture-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      capturePhoto(button.dataset.photoTarget);
    });
  });

  document.querySelectorAll(".clear-photo-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      clearPhoto(button.dataset.photoTarget);
    });
  });

}


async function startCamera() {

  const status = document.getElementById("cameraStatus");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCameraStatus("This browser does not support live camera access.", true);
    return;
  }

  if (cameraStream) {
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    ["customerCamera", "itemCamera"].forEach(function (cameraId) {
      const video = document.getElementById(cameraId);
      if (video) {
        video.srcObject = cameraStream;
        video.classList.add("is-live");
      }
    });

    document.querySelectorAll(".capture-btn").forEach(function (button) {
      button.disabled = false;
    });

    const startButton = document.getElementById("startCameraButton");
    if (startButton) {
      startButton.textContent = "Camera Ready";
      startButton.disabled = true;
    }

    setCameraStatus("Live camera connected. Capture the customer and item photos.");
  } catch (error) {
    setCameraStatus("Camera access was blocked. Allow camera permission and try again.", true);
    console.error("Unable to access webcam:", error);
  }

}


function capturePhoto(target) {

  if (!cameraStream) {
    setCameraStatus("Start the camera before capturing a photo.", true);
    return;
  }

  const video = document.getElementById(target + "Camera");
  const canvas = document.getElementById("photoCanvas");

  if (!video || !canvas || !video.videoWidth) {
    setCameraStatus("The camera is still warming up. Try again in a moment.", true);
    return;
  }

  const maxWidth = 900;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPhotos[target] = canvas.toDataURL("image/jpeg", 0.86);

  const preview = document.getElementById(target + "PhotoPreview");
  const status = document.getElementById(target + "PhotoStatus");

  if (preview) {
    preview.src = capturedPhotos[target];
    preview.classList.remove("hidden");
  }

  if (status) {
    status.textContent = "Captured";
    status.classList.add("captured");
  }

  setCameraStatus(target === "customer"
    ? "Customer photo captured. Now capture the item photo."
    : "Item photo captured. Both photos are ready.");

}


function clearPhoto(target) {

  capturedPhotos[target] = "";

  const preview = document.getElementById(target + "PhotoPreview");
  const status = document.getElementById(target + "PhotoStatus");

  if (preview) {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
  }

  if (status) {
    status.textContent = "Not captured";
    status.classList.remove("captured");
  }

  setCameraStatus("Photo cleared. Capture a new photo when ready.");

}


function resetCapturedPhotos() {
  clearPhoto("customer");
  clearPhoto("item");
}


function setCameraStatus(message, isError) {

  const status = document.getElementById("cameraStatus");

  if (status) {
    status.textContent = message;
    status.classList.toggle("error-status", Boolean(isError));
  }

}


function setImage(elementId, source) {

  const image = document.getElementById(elementId);

  if (!image) {
    return;
  }

  const photoBlock = image.parentElement;

  if (source) {
    image.src = source;
    image.classList.remove("hidden");
    if (photoBlock) {
      photoBlock.classList.remove("hidden");
    }
  } else {
    image.removeAttribute("src");
    image.classList.add("hidden");
    if (photoBlock) {
      photoBlock.classList.add("hidden");
    }
  }

}


function showSampleBillPreview() {

  const sampleImage = createSampleImage("SAMPLE");

  showPrintPreview({
    billNumber: "G0001",
    metalType: "Gold",
    customerName: "Sample Customer",
    customerMobile: "9876543210",
    aadharLast4: "1234",
    customerAddress: "12 Sample Street, Chennai",
    itemType: "Gold Chain",
    remark: "Sample bill preview",
    itemAmount: 75000,
    loanAmount: 50000,
    interestRate: 2,
    customerPhoto: sampleImage,
    itemPhoto: createSampleImage("ITEM"),
    date: new Date().toISOString()
  });

}


function createSampleImage(label) {

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" fill="#f5eee6"/>
      <rect x="28" y="28" width="844" height="504" rx="22" fill="#76513c"/>
      <circle cx="450" cy="220" r="92" fill="#e6c27a" opacity=".9"/>
      <path d="M300 470c20-105 90-155 150-155s130 50 150 155" fill="#e6c27a" opacity=".9"/>
      <text x="450" y="455" fill="#fffdf9" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle">${label} PHOTO</text>
    </svg>`;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);

}