// ============================================
// MANEJO DE TABS
// ============================================
function showTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.closest('.tab-button').classList.add('active');
}

// ============================================
// CIFRADO CÉSAR
// ============================================
async function caesarEncrypt() {
    const text = document.getElementById('caesar-text').value;
    const shiftInput = document.getElementById('caesar-shift').value;

    if (!text) {
        showNotification('Por favor ingresa un texto', 'warning');
        return;
    }

    if (shiftInput === '' || shiftInput === null) {
        showNotification('Por favor ingresa un desplazamiento', 'warning');
        return;
    }

    const shift = parseInt(shiftInput);

    if (isNaN(shift)) {
        showNotification('El desplazamiento debe ser un número', 'error');
        return;
    }

    if (shift < 0 || shift > 25) {
        showNotification('El desplazamiento debe estar entre 0 y 25', 'warning');
        return;
    }

    if (shift === 0) {
        showNotification('Desplazamiento 0 no modifica el texto', 'info');
        showResult('caesar', text);
        return;
    }

    try {
        const response = await fetch('/api/caesar/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, shift })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('caesar', data.result);
            showNotification(`Texto cifrado con desplazamiento ${shift}`, 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function caesarDecrypt() {
    const text = document.getElementById('caesar-text').value;
    const shiftInput = document.getElementById('caesar-shift').value;

    if (!text) {
        showNotification('Por favor ingresa un texto cifrado', 'warning');
        return;
    }

    if (shiftInput === '' || shiftInput === null) {
        showNotification('Por favor ingresa un desplazamiento', 'warning');
        return;
    }

    const shift = parseInt(shiftInput);

    if (isNaN(shift)) {
        showNotification('El desplazamiento debe ser un número', 'error');
        return;
    }

    if (shift < 0 || shift > 25) {
        showNotification('El desplazamiento debe estar entre 0 y 25', 'warning');
        return;
    }

    if (shift === 0) {
        showNotification('Desplazamiento 0 no modifica el texto', 'info');
        showResult('caesar', text);
        return;
    }

    try {
        const response = await fetch('/api/caesar/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, shift })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('caesar', data.result);
            showNotification(`Texto descifrado con desplazamiento ${shift}`, 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function clearCaesar() {
    document.getElementById('caesar-text').value = '';
    document.getElementById('caesar-shift').value = '3';
    document.getElementById('caesar-result').style.display = 'none';
    showNotification('Campos limpiados', 'info');
}

// ============================================
// CIFRADO VIGENÈRE
// ============================================
async function vigenereEncrypt() {
    const text = document.getElementById('vigenere-text').value;
    const key = document.getElementById('vigenere-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto y clave', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/vigenere/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('vigenere', data.result);
            showNotification('Texto cifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function vigenereDecrypt() {
    const text = document.getElementById('vigenere-text').value;
    const key = document.getElementById('vigenere-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto cifrado y clave', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/vigenere/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('vigenere', data.result);
            showNotification('Texto descifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function clearVigenere() {
    document.getElementById('vigenere-text').value = '';
    document.getElementById('vigenere-key').value = '';
    document.getElementById('vigenere-result').style.display = 'none';
    showNotification('Campos limpiados', 'info');
}

// ============================================
// CIFRADO PLAYFAIR
// ============================================
async function playfairEncrypt() {
    const text = document.getElementById('playfair-text').value;
    const key = document.getElementById('playfair-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto y clave', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/playfair/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('playfair', data.result);
            showNotification('Texto cifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function playfairDecrypt() {
    const text = document.getElementById('playfair-text').value;
    const key = document.getElementById('playfair-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto cifrado y clave', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/playfair/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('playfair', data.result);
            showNotification('Texto descifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function clearPlayfair() {
    document.getElementById('playfair-text').value = '';
    document.getElementById('playfair-key').value = '';
    document.getElementById('playfair-result').style.display = 'none';
    showNotification('Campos limpiados', 'info');
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function showResult(cipher, result) {
    const resultBox = document.getElementById(cipher + '-result');
    const resultText = document.getElementById(cipher + '-result-text');
    
    resultText.textContent = result;
    resultBox.style.display = 'block';
}

// ============================================
// FUNCIONES AUXILIARES PARA PLAYFAIR
// ============================================
function generatePlayfairMatrix(key) {
    // Limpiar y preparar la clave
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    const matrix = [];
    const used = new Set();
    
    // Agregar letras de la clave (sin duplicados)
    for (const char of key) {
        if (!used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }
    
    // Agregar resto del alfabeto (sin J)
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // Sin J
    for (const char of alphabet) {
        if (!used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }
    
    return matrix;
}

function displayPlayfairMatrix(key) {
    if (!key || key.length === 0) {
        document.getElementById('playfair-matrix-container').style.display = 'none';
        return;
    }
    
    const matrix = generatePlayfairMatrix(key);
    const matrixDisplay = document.getElementById('playfair-matrix-display');
    const keyLetters = new Set(key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '').split(''));
    
    // Limpiar matriz anterior
    matrixDisplay.innerHTML = '';
    
    // Crear celdas de la matriz
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        
        // Marcar letras que vienen de la clave
        if (keyLetters.has(matrix[i])) {
            cell.classList.add('key-letter');
        } else {
            cell.classList.add('alphabet-letter');
        }
        
        cell.textContent = matrix[i];
        matrixDisplay.appendChild(cell);
    }
    
    document.getElementById('playfair-matrix-container').style.display = 'block';
}

// Modificar las funciones de Playfair para mostrar la matriz
async function playfairEncrypt() {
    const text = document.getElementById('playfair-text').value;
    const key = document.getElementById('playfair-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto y clave', 'warning');
        return;
    }

    // Mostrar la matriz generada
    displayPlayfairMatrix(key);

    try {
        const response = await fetch('/api/playfair/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('playfair', data.result);
            showNotification('Texto cifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function playfairDecrypt() {
    const text = document.getElementById('playfair-text').value;
    const key = document.getElementById('playfair-key').value;

    if (!text || !key) {
        showNotification('Por favor ingresa texto cifrado y clave', 'warning');
        return;
    }

    // Mostrar la matriz generada
    displayPlayfairMatrix(key);

    try {
        const response = await fetch('/api/playfair/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();
        
        if (data.success) {
            showResult('playfair', data.result);
            showNotification('Texto descifrado correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}