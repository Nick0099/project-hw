// ---------- Login (front-end only, not real security) ----------
const VALID_USER = "404";
const VALID_PASS = "202";

const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const calculator = document.getElementById("calculator");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

usernameInput.focus();

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (usernameInput.value.trim() === VALID_USER && passwordInput.value === VALID_PASS) {
        loginScreen.hidden = true;
        calculator.hidden = false;
    } else {
        loginError.textContent = "Wrong username or password.";
        passwordInput.value = '';
        loginForm.classList.remove("shake");
        void loginForm.offsetWidth;          // restart the animation
        loginForm.classList.add("shake");
        passwordInput.focus();
    }
});

// ---------- Calculator ----------
const display = document.getElementById("screen");   // big line: current number / result
const history = document.getElementById("history");  // small line: the running expression
let a = '';
let b = '';
let operator = '';
let justEvaluated = false;   // true right after "=" is pressed
let lastExpression = '';     // e.g. "12 + 5 =" shown small after "="

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

document.querySelector(".digits").addEventListener("click", (e) => {
    if (!e.target.matches("button")) return;
    handleInput(e.target.id);
});

function handleInput(value) {
    switch (value) {
        case "AC":  handleClear();  break;
        case "DEL": handleDelete(); break;
        case "=":   handleEqual();  break;
        case "%":   handlePercent(); break;
        case "+":
        case "-":
        case "*":
        case "/":   handleOperator(value); break;
        case "ABS": handleAbs(); break;
        default:    handleButton(value); break;
    }
}

// Redraws both lines from the current state
function updateScreen() {
    const main = b !== '' ? b : a;
    const text = main === '' ? '0' : main;
    display.textContent = text;

    // shrink the font for long numbers
    display.style.fontSize = text.length > 12 ? "28px" : text.length > 9 ? "38px" : "52px";

    if (justEvaluated) {
        history.textContent = lastExpression;
    } else if (operator !== '') {
        history.textContent = `${a} ${symbols[operator]} ${b}`;
    } else {
        history.textContent = '';
    }
}

function handleEqual() {
    if (a === '' || b === '' || operator === '') return;

    const expression = `${a} ${symbols[operator]} ${b} =`;
    let result;
    switch (operator) {
        case "+": result = add(a, b);      break;
        case "-": result = subtract(a, b); break;
        case "*": result = multiply(a, b); break;
        case "/": result = divide(a, b);   break;
    }

    if (result === null) {
        handleClear();
        history.textContent = expression;
        display.textContent = "Can't divide by 0";
        display.style.fontSize = "28px";
        return;
    }

    result = parseFloat(result.toFixed(10)); // fixes 0.1 + 0.2 style errors
    a = String(result);
    b = '';
    operator = '';
    lastExpression = expression;
    justEvaluated = true;
    updateScreen();
}

function appendDigit(current, value) {
    if (value === '.') {
        if (current.includes('.')) return current;
        return current === '' ? '0.' : current + '.';
    }
    if (current === '0') return value;   // no leading zeros
    return current + value;
}

function handleButton(value) {
    if (justEvaluated) {          // typing after "=" starts a new calculation
        a = '';
        justEvaluated = false;
    }
    if (operator === '') {
        a = appendDigit(a, value);
    } else {
        b = appendDigit(b, value);
    }
    updateScreen();
}

function handleOperator(value) {
    if (a === '') return;
    if (b !== '') handleEqual();  // chain: 2 + 3 + ... evaluates 2 + 3 first
    justEvaluated = false;        // the result becomes the start of a new expression
    operator = value;
    updateScreen();
}

function add(a, b)      { return parseFloat(a) + parseFloat(b); }
function subtract(a, b) { return parseFloat(a) - parseFloat(b); }
function multiply(a, b) { return parseFloat(a) * parseFloat(b); }
function divide(a, b) {
    if (parseFloat(b) === 0) return null;
    return parseFloat(a) / parseFloat(b);
}

function handlePercent() {
    if (operator === '') {
        if (a === '') return;
        a = String(parseFloat(a) / 100);
    } else {
        if (b === '') return;
        b = String(parseFloat(b) / 100);
    }
    updateScreen();
}

function handleClear() {
    a = ''; b = ''; operator = '';
    justEvaluated = false;
    lastExpression = '';
    updateScreen();
}

function handleDelete() {
    if (justEvaluated) return;
    if (operator === '') {
        a = a.slice(0, -1);
    } else {
        b = b.slice(0, -1);
    }
    updateScreen();
}

function handleAbs() {
    if (operator === '') {
        if (a === '') return;
        a = String(parseFloat(a) * -1);
    } else {
        if (b === '') return;
        b = String(parseFloat(b) * -1);
    }
    updateScreen();
}