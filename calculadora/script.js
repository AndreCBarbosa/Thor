const display = document.querySelector('.value');
const historyDisplay = document.querySelector('.history');
const buttons = document.querySelectorAll('.key');

let current = '0';
let previous = null;
let operator = null;
let history = '';
let waitingForNewNumber = false;

updateDisplay();

// evento para TODOS os botões
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.target;

        if (target.dataset.number) {
            inputNumber(target.dataset.number);
        }

        if (target.dataset.operator) {
            handleOperator(target.dataset.operator);
        }

        if (target.dataset.action) {
            handleAction(target.dataset.action);
        }

        updateDisplay();
    });
});

// ---------------- FUNÇÕES ----------------

function inputNumber(number) {
    if (waitingForNewNumber) {
        current = number;
        waitingForNewNumber = false;
        return;
    }

    if (hasMaxDigits(current)) return;

    if (current === '0') {
        current = number;
    } else {
        current += number;
    }
}

function handleOperator(op) {
    if (op === 'equal') {
        if (previous !== null && operator !== null) {
            history = `${previous} ${getOperatorSymbol(operator)} ${current}`;
            calculate();
        }
        return;
    }

    if (op === 'percent') {
        if (previous !== null && operator !== null) {
            history = `${previous} ${getOperatorSymbol(operator)} ${current}%`;
        } else {
            history = `${current}%`;
        }
        handlePercent();
        return;
    }

    if (op === 'changesignal') {
        toggleSign();
        return;
    }

    if (previous === null) {
        previous = current;
        operator = op;
        history = `${current} ${getOperatorSymbol(op)}`;
        waitingForNewNumber = true;
        return;
    }

    if (operator !== null && !waitingForNewNumber) {
        const result = operate(previous, current, operator);
        current = result;
        if (result === 'Erro') {
            previous = null;
            operator = null;
            waitingForNewNumber = false;
            history = '';
            return;
        }
        previous = result;
        history = `${result} ${getOperatorSymbol(op)}`;
    } else {
        history = `${previous} ${getOperatorSymbol(op)}`;
    }

    operator = op;
    waitingForNewNumber = true;
}

function handleAction(action) {
    if (action === 'clear') {
        current = '0';
        previous = null;
        operator = null;
        history = '';
        waitingForNewNumber = false;
    }

    if (action === 'decimal') {
        if (waitingForNewNumber) {
            current = '0,';
            waitingForNewNumber = false;
            return;
        }

        if (!current.includes(',')) {
            current += ',';
        }
    }
}

function handlePercent() {
    const curr = parseValue(current);
    if (isNaN(curr)) return;

    if (previous !== null && operator !== null) {
        const prev = parseValue(previous);
        if (isNaN(prev)) {
            current = 'Erro';
            previous = null;
            operator = null;
            return;
        }

        current = formatResult((prev * curr) / 100);
    } else {
        current = formatResult(curr / 100);
    }
}

function toggleSign() {
    if (current === '0') return;
    if (current.startsWith('-')) {
        current = current.slice(1);
    } else {
        current = '-' + current;
    }
}

function operate(prevValue, currValue, operatorType) {
    const prev = parseValue(prevValue);
    const curr = parseValue(currValue);

    if (isNaN(prev) || isNaN(curr)) {
        return 'Erro';
    }

    let result;
    switch (operatorType) {
        case 'addiction':
            result = prev + curr;
            break;
        case 'subtraction':
            result = prev - curr;
            break;
        case 'multiplication':
            result = prev * curr;
            break;
        case 'division':
            result = curr !== 0 ? prev / curr : NaN;
            break;
        default:
            return 'Erro';
    }

    return formatResult(result);
}

function calculate() {
    const prev = parseValue(previous);
    const curr = parseValue(current);

    if (isNaN(prev) || isNaN(curr)) {
        current = 'Erro';
        previous = null;
        operator = null;
        history = '';
        return;
    }

    let result;
    switch (operator) {
        case 'addiction':
            result = prev + curr;
            break;
        case 'subtraction':
            result = prev - curr;
            break;
        case 'multiplication':
            result = prev * curr;
            break;
        case 'division':
            result = curr !== 0 ? prev / curr : NaN;
            break;
        default:
            return;
    }

    current = formatResult(result);
    previous = null;
    operator = null;
}

function parseValue(value) {
    if (typeof value !== 'string') return NaN;
    return parseFloat(value.replace(',', '.'));
}

function formatResult(value) {
    if (!Number.isFinite(value)) return 'Erro';
    const normalized = parseFloat(value.toFixed(10));
    const text = normalized.toString().replace('.', ',');
    const digits = text.replace(/[^0-9]/g, '');
    return digits.length > 11 ? 'Erro' : text;
}

function updateDisplay() {
    historyDisplay.textContent = history;
    display.textContent = current;
}

function hasMaxDigits(value) {
    const digits = value.replace('-', '').replace(',', '');
    return digits.length >= 11;
}

function getOperatorSymbol(op) {
    switch (op) {
        case 'addiction':
            return '+';
        case 'subtraction':
            return '-';
        case 'multiplication':
            return '×';
        case 'division':
            return '÷';
        default:
            return op;
    }
}
