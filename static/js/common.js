// ============================================
// FUNCIONES COMUNES COMPARTIDAS
// ============================================

// Sistema de notificaciones personalizado
function showNotification(message, type = 'info') {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Agregar icono según el tipo
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    switch(type) {
        case 'success':
            icon.textContent = 'check_circle';
            break;
        case 'error':
            icon.textContent = 'error';
            break;
        case 'warning':
            icon.textContent = 'warning';
            break;
        default:
            icon.textContent = 'info';
    }
    
    const text = document.createElement('span');
    text.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(text);
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Función para copiar al portapapeles
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.value;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar', 'error');
    });
}

// ============================================
// MANEJO DE PEGADO (PASTE) RESTRINGIDO
// ============================================
function handlePaste(event, type) {
    event.preventDefault();
    
    // Obtener el texto pegado
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    
    let cleanText = '';
    
    switch(type) {
        case 'letters':
            // Solo permitir letras A-Z (sin espacios, números, símbolos)
            cleanText = pastedText.replace(/[^A-Za-z]/g, '');
            break;
        case 'numbers':
            // Solo permitir números
            cleanText = pastedText.replace(/[^0-9]/g, '');
            break;
        case 'alphanumeric':
            // Solo letras y números
            cleanText = pastedText.replace(/[^A-Za-z0-9]/g, '');
            break;
    }
    
    // Insertar el texto limpio
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;
    
    input.value = currentValue.substring(0, start) + cleanText + currentValue.substring(end);
    
    // Posicionar el cursor después del texto pegado
    const newPosition = start + cleanText.length;
    input.setSelectionRange(newPosition, newPosition);
    
    // Mostrar notificación si se removieron caracteres
    if (cleanText.length < pastedText.length) {
        showNotification(`Se removieron ${pastedText.length - cleanText.length} caracteres no válidos`, 'info');
    }
}

// ============================================
// NORMALIZACIÓN DE TEXTO
// ============================================
function normalizeText(text) {
    // Eliminar tildes
    const withoutAccents = text
        .replace(/[áàäâ]/gi, 'a')
        .replace(/[éèëê]/gi, 'e')
        .replace(/[íìïî]/gi, 'i')
        .replace(/[óòöô]/gi, 'o')
        .replace(/[úùüû]/gi, 'u')
        .replace(/ñ/gi, 'n');
    
    // Mantener solo letras A-Z y espacios
    return withoutAccents.replace(/[^A-Za-z\s]/g, '');
}

function normalizeTextPlayfair(text) {
    // Eliminar tildes y convertir J a I
    const withoutAccents = text
        .replace(/[áàäâ]/gi, 'a')
        .replace(/[éèëê]/gi, 'e')
        .replace(/[íìïî]/gi, 'i')
        .replace(/[óòöô]/gi, 'o')
        .replace(/[úùüû]/gi, 'u')
        .replace(/ñ/gi, 'n')
        .replace(/j/gi, 'I');  // J -> I (Playfair rule)
    
    // Mantener solo letras A-Z (SIN espacios para Playfair)
    return withoutAccents.replace(/[^A-Za-z]/g, '');
}

// Función mejorada para manejar pegado
function handlePaste(event, type) {
    event.preventDefault();
    
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    
    let cleanText = '';
    
    switch(type) {
        case 'letters':
            // Solo permitir letras A-Z (sin espacios, números, símbolos)
            cleanText = pastedText.replace(/[^A-Za-z]/g, '');
            break;
        case 'letters-spaces':
            // Solo letras A-Z y espacios (para César y Vigenère)
            cleanText = normalizeText(pastedText);
            break;
        case 'letters-playfair':
            // Solo letras A-Z sin espacios, J->I (para Playfair)
            cleanText = normalizeTextPlayfair(pastedText);
            break;
        case 'numbers':
            // Solo permitir números
            cleanText = pastedText.replace(/[^0-9]/g, '');
            break;
        case 'alphanumeric':
            // Solo letras y números
            cleanText = pastedText.replace(/[^A-Za-z0-9]/g, '');
            break;
    }
    
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;
    
    input.value = currentValue.substring(0, start) + cleanText + currentValue.substring(end);
    
    const newPosition = start + cleanText.length;
    input.setSelectionRange(newPosition, newPosition);
    
    if (cleanText.length < pastedText.length) {
        const removed = pastedText.length - cleanText.length;
        showNotification(`Se normalizaron/removieron ${removed} caracteres (Ñ, tildes, espacios, símbolos)`, 'info');
    }
}

// Función para aplicar normalización en tiempo real
function handleTextInput(event) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    input.value = normalizeText(input.value);
    
    const newLength = input.value.length;
    const removedChars = originalLength - newLength;
    
    // Ajustar posición del cursor
    if (removedChars > 0) {
        input.setSelectionRange(cursorPos - removedChars, cursorPos - removedChars);
    } else {
        input.setSelectionRange(cursorPos, cursorPos);
    }
}

// Función específica para Playfair (sin espacios, J->I)
function handleTextInputPlayfair(event) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    input.value = normalizeTextPlayfair(input.value);
    
    const newLength = input.value.length;
    const removedChars = originalLength - newLength;
    
    // Ajustar posición del cursor
    if (removedChars > 0) {
        input.setSelectionRange(cursorPos - removedChars, cursorPos - removedChars);
    } else {
        input.setSelectionRange(cursorPos, cursorPos);
    }
}