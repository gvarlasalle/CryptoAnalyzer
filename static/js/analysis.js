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
// ANÁLISIS DE FRECUENCIA
// ============================================
async function analyzeFrequency() {
    const text = document.getElementById('freq-text').value;

    if (!text || text.trim().length === 0) {
        showNotification('Por favor ingresa un texto cifrado para analizar', 'warning');
        return;
    }

    if (text.replace(/\s/g, '').length < 20) {
        showNotification('El texto es muy corto. Necesitas al menos 20 letras para un análisis confiable', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/analysis/frequency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (data.success) {
            displayFrequencyResults(data.frequencies, data.chi_squared, data.chart, text);
            showNotification('Análisis completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function displayFrequencyResults(frequencies, chiSquared, chartBase64, originalText) {
    // Calcular estadísticas
    const totalLetters = originalText.replace(/[^a-zA-Z]/g, '').length;
    
    // Encontrar letra más común
    let maxFreq = 0;
    let mostCommon = '-';
    for (const [letter, freq] of Object.entries(frequencies)) {
        if (freq > maxFreq) {
            maxFreq = freq;
            mostCommon = letter;
        }
    }

    // Mostrar estadísticas generales
    document.getElementById('freq-total-letters').textContent = totalLetters;
    document.getElementById('freq-most-common').textContent = `${mostCommon} (${maxFreq.toFixed(2)}%)`;
    document.getElementById('freq-chi-squared').textContent = chiSquared.toFixed(2);

    // Mostrar gráfico
    if (chartBase64) {
        document.getElementById('frequency-chart-img').src = 'data:image/png;base64,' + chartBase64;
        document.getElementById('frequency-chart').style.display = 'block';
    } else {
        document.getElementById('frequency-chart').style.display = 'none';
    }

    // Crear tabla de frecuencias
    const spanishFreq = {
        'E': 13.68, 'A': 12.53, 'O': 8.68, 'S': 7.98, 'R': 6.87,
        'N': 6.71, 'I': 6.25, 'D': 5.86, 'L': 4.97, 'C': 4.68,
        'T': 4.63, 'U': 3.93, 'M': 3.15, 'P': 2.51, 'B': 2.22,
    };

    // Ordenar por frecuencia
    const sortedFreqs = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const tableBody = document.getElementById('frequency-table-body');
    tableBody.innerHTML = '';

    sortedFreqs.forEach(([letter, freq], index) => {
        const expectedFreq = spanishFreq[letter] || 0;
        const row = document.createElement('tr');
        
        let interpretation = '';
        if (freq > 10 && letter !== 'E' && letter !== 'A' && letter !== 'O') {
            interpretation = `Posiblemente representa E, A u O`;
        } else if (Math.abs(freq - expectedFreq) < 2) {
            interpretation = 'Similar al español';
        } else {
            interpretation = 'Desplazada';
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${letter}</strong></td>
            <td>${freq.toFixed(2)}%</td>
            <td>${expectedFreq.toFixed(2)}%</td>
            <td>${interpretation}</td>
        `;
        tableBody.appendChild(row);
    });

    // Interpretación general con SUGERENCIA PRÁCTICA
    const interpretation = document.getElementById('frequency-interpretation');
    let interpretationHTML = '<ul>';
    
    // Calcular posible desplazamiento César
    let suggestedShift = 0;
    let caesarSuggestion = '';
    
    if (mostCommon === 'E' || mostCommon === 'A' || mostCommon === 'O') {
        interpretationHTML += `<li><strong>✓</strong> La letra más frecuente es <strong>${mostCommon}</strong>, lo cual es normal en español.</li>`;
        interpretationHTML += '<li>El texto parece estar <strong>sin cifrar o con desplazamiento 0</strong>.</li>';
    } else {
        interpretationHTML += `<li><strong>!</strong> La letra más frecuente es <strong>${mostCommon}</strong> (${maxFreq.toFixed(2)}%), que normalmente no es tan común en español.</li>`;
        interpretationHTML += `<li>En español, las letras más comunes son: E (13.68%), A (12.53%), O (8.68%).</li>`;
        
        // Calcular posibles desplazamientos si representa E, A u O
        const possibleLetters = ['E', 'A', 'O'];
        const suggestions = [];
        
        for (const targetLetter of possibleLetters) {
            const shift = (mostCommon.charCodeAt(0) - targetLetter.charCodeAt(0) + 26) % 26;
            if (shift > 0) {
                suggestions.push({ letter: targetLetter, shift: shift });
            }
        }
        
        interpretationHTML += `<li><strong>Posibilidades:</strong> Si <strong>${mostCommon}</strong> representa...`;
        interpretationHTML += '<ul style="margin-left: 2rem; margin-top: 0.5rem;">';
        
        suggestions.forEach(s => {
            interpretationHTML += `<li><strong>${s.letter}</strong> → Desplazamiento: ${s.shift}</li>`;
        });
        
        interpretationHTML += '</ul></li>';
        
        // Botones para probar cada posibilidad
        caesarSuggestion = `
            <li style="background: rgba(0, 255, 0, 0.1); padding: 1rem; border-radius: 5px; margin-top: 1rem;">
                <strong>💡 PRUEBA ESTOS DESPLAZAMIENTOS:</strong><br>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
        `;
        
        suggestions.forEach(s => {
            caesarSuggestion += `
                <button class="btn btn-secondary" onclick="autoDecryptFromFrequency('${escapeHtml(originalText)}', ${s.shift})">
                    <span class="material-icons">vpn_key</span> Shift ${s.shift} (${mostCommon}→${s.letter})
                </button>
            `;
        });
        
        caesarSuggestion += `
                </div>
                <p style="margin-top: 0.75rem; font-size: 0.9rem; color: #cccccc;">
                    Haz clic en cada botón para ver el texto descifrado con ese desplazamiento
                </p>
            </li>
        `;
        
        // Almacenar sugerencias para uso posterior
        window.caesarSuggestions = suggestions.map(s => s.shift);
    }

    if (chiSquared < 50) {
        interpretationHTML += '<li><strong>Chi-cuadrado bajo:</strong> Las frecuencias se parecen al español normal.</li>';
    } else if (chiSquared < 200) {
        interpretationHTML += '<li><strong>Chi-cuadrado moderado:</strong> Hay alguna alteración en las frecuencias.</li>';
    } else {
        interpretationHTML += '<li><strong>Chi-cuadrado alto:</strong> Las frecuencias son muy diferentes al español.</li>';
    }

    interpretationHTML += caesarSuggestion;
    interpretationHTML += '</ul>';
    
    // Agregar recomendación final
    if (suggestedShift > 0) {
        interpretationHTML += `
            <div style="background: #1a1a1a; border: 2px solid #00ff00; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <strong style="color: #00ff00;">🎯 Recomendación:</strong><br>
                <p style="margin: 0.5rem 0;">Si el análisis de frecuencia sugiere un desplazamiento pero no estás seguro, 
                ve a la pestaña <strong>"Fuerza Bruta - César"</strong> para ver TODAS las posibilidades.</p>
            </div>
        `;
    }
    
    interpretation.innerHTML = interpretationHTML;

    // Mostrar resultados
    document.getElementById('frequency-results').style.display = 'block';
}

// Nueva función: Descifrar automáticamente desde análisis de frecuencia
async function autoDecryptFromFrequency(ciphertext, shift) {
    try {
        const response = await fetch('/api/caesar/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: ciphertext, shift: shift })
        });

        const data = await response.json();

        if (data.success) {
            // Crear un modal o sección para mostrar el resultado
            const resultHTML = `
                <div style="background: #000; border: 2px solid #00ff00; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                    <h4 style="color: #00ff00; display: flex; align-items: center; gap: 0.5rem;">
                        <span class="material-icons">done_all</span>
                        Texto Descifrado con Desplazamiento ${shift}
                    </h4>
                    <div style="background: #1a1a1a; border: 1px solid #00ff00; padding: 1rem; border-radius: 5px; margin-top: 1rem;">
                        <div style="color: #00ff00; font-family: 'Courier New', monospace; white-space: pre-wrap; word-break: break-word; line-height: 1.6;">
${data.result}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-small" onclick="copyTextToClipboard(\`${data.result.replace(/`/g, '\\`')}\`)">
                            <span class="material-icons">content_copy</span> Copiar
                        </button>
                        <button class="btn btn-small" onclick="this.closest('.auto-decrypt-result').remove()">
                            <span class="material-icons">close</span> Cerrar
                        </button>
                    </div>
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(0, 255, 0, 0.1); border-radius: 5px;">
                        <p style="margin: 0; color: #00ff00; font-size: 0.9rem;">
                            <strong>¿Tiene sentido este texto?</strong>
                        </p>
                        <p style="margin: 0.5rem 0 0 0; color: #cccccc; font-size: 0.85rem;">
                            ✓ Si es legible en español → ¡Encontraste la clave correcta!<br>
                            ✗ Si no tiene sentido → Prueba otro desplazamiento o usa "Fuerza Bruta - César"
                        </p>
                    </div>
                </div>
            `;
            
            // Agregar resultado después de la interpretación
            const interpretation = document.getElementById('frequency-interpretation');
            const existingResult = interpretation.querySelector('.auto-decrypt-result');
            if (existingResult) {
                existingResult.remove();
            }
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'auto-decrypt-result';
            resultDiv.innerHTML = resultHTML;
            interpretation.appendChild(resultDiv);
            
            showNotification(`Descifrado con shift ${shift}`, 'success');
            
            // Scroll al resultado
            setTimeout(() => {
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            showNotification('Error al descifrar: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

// Función auxiliar para copiar texto
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texto copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

function clearFrequency() {
    document.getElementById('freq-text').value = '';
    document.getElementById('frequency-results').style.display = 'none';
    showNotification('Campos limpiados', 'info');
}

// ============================================
// FUERZA BRUTA CÉSAR
// ============================================
async function bruteForceCaesar() {
    const text = document.getElementById('brute-caesar-text').value;

    if (!text || text.trim().length === 0) {
        showNotification('Por favor ingresa un texto cifrado', 'warning');
        return;
    }

    if (text.replace(/\s/g, '').length < 10) {
        showNotification('El texto es muy corto. Necesitas al menos 10 letras', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/analysis/bruteforce/caesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (data.success) {
            displayBruteForceCaesarResults(data.results);
            showNotification('Ataque completado - Revisa los resultados', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function displayBruteForceCaesarResults(results) {
    const container = document.getElementById('brute-caesar-candidates');
    container.innerHTML = '';

    results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        
        let badge = '';
        if (index === 0) {
            badge = '<span class="badge badge-success">MÁS PROBABLE</span>';
        } else if (index < 3) {
            badge = '<span class="badge badge-info">CANDIDATO</span>';
        }

        card.innerHTML = `
            <div class="candidate-header">
                <div>
                    <span class="material-icons">vpn_key</span>
                    <strong>Desplazamiento: ${result.shift}</strong>
                </div>
                ${badge}
                <div class="chi-value">Chi²: ${result.chi_squared.toFixed(2)}</div>
            </div>
            <div class="candidate-preview">
                <strong>Vista previa:</strong>
                <div class="preview-text">${result.preview}</div>
            </div>
            <div class="candidate-actions">
                <button class="btn btn-small" onclick="copyToClipboard('candidate-${index}')">
                    <span class="material-icons">content_copy</span> Copiar
                </button>
                <button class="btn btn-small" onclick="showFullText(${index}, '${escapeHtml(result.text)}')">
                    <span class="material-icons">visibility</span> Ver Completo
                </button>
            </div>
            <div id="candidate-${index}" style="display: none;">${result.text}</div>
        `;

        container.appendChild(card);
    });

    document.getElementById('brute-caesar-results').style.display = 'block';
}

function showFullText(index, text) {
    const preview = document.querySelector(`#brute-caesar-candidates .candidate-card:nth-child(${index + 1}) .preview-text`);
    const hiddenText = document.getElementById(`candidate-${index}`);
    
    if (preview.textContent.endsWith('...')) {
        preview.textContent = text;
        event.target.innerHTML = '<span class="material-icons">visibility_off</span> Ocultar';
    } else {
        preview.textContent = text.substring(0, 100) + (text.length > 100 ? '...' : '');
        event.target.innerHTML = '<span class="material-icons">visibility</span> Ver Completo';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'");
}

function clearBruteCaesar() {
    document.getElementById('brute-caesar-text').value = '';
    document.getElementById('brute-caesar-results').style.display = 'none';
    showNotification('Campos limpiados', 'info');
}

// ============================================
// ROMPER VIGENÈRE
// ============================================
async function estimateVigenereLength() {
    const text = document.getElementById('vigenere-break-text').value;

    if (!text || text.trim().length === 0) {
        showNotification('Por favor ingresa un texto cifrado', 'warning');
        return;
    }

    const cleanText = text.replace(/[^a-zA-Z]/g, '');
    if (cleanText.length < 50) {
        showNotification('El texto es muy corto. Necesitas al menos 50 letras para estimar la longitud', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/analysis/vigenere/keylength', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (data.success) {
            displayVigenereLengthResults(data.results);
            showNotification('Análisis completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function displayVigenereLengthResults(results) {
    const container = document.getElementById('vigenere-length-list');
    container.innerHTML = '';

    results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'length-card';
        
        let badge = '';
        if (index === 0) {
            badge = '<span class="badge badge-success">MÁS PROBABLE</span>';
        }

        const icDiff = Math.abs(result.ic - 0.065);
        const confidence = icDiff < 0.01 ? 'Alta' : icDiff < 0.02 ? 'Media' : 'Baja';

        card.innerHTML = `
            <div class="length-header">
                <div>
                    <span class="material-icons">straighten</span>
                    <strong>Longitud: ${result.length}</strong>
                </div>
                ${badge}
            </div>
            <div class="length-details">
                <div>IC: ${result.ic.toFixed(4)} (Español ≈ 0.065)</div>
                <div>Confianza: ${confidence}</div>
            </div>
            <button class="btn btn-small" onclick="document.getElementById('vigenere-key-length').value = ${result.length}; showNotification('Longitud ${result.length} seleccionada', 'info')">
                <span class="material-icons">check</span> Usar Esta Longitud
            </button>
        `;

        container.appendChild(card);
    });

    document.getElementById('vigenere-length-results').style.display = 'block';
}

async function estimateVigenereKey() {
    const text = document.getElementById('vigenere-break-text').value;
    const keyLength = parseInt(document.getElementById('vigenere-key-length').value);

    if (!text || text.trim().length === 0) {
        showNotification('Por favor ingresa un texto cifrado', 'warning');
        return;
    }

    if (!keyLength || keyLength < 1 || keyLength > 20) {
        showNotification('La longitud de clave debe estar entre 1 y 20', 'warning');
        return;
    }

    const cleanText = text.replace(/[^a-zA-Z]/g, '');
    if (cleanText.length < keyLength * 10) {
        showNotification(`Para longitud ${keyLength}, necesitas al menos ${keyLength * 10} letras (tienes ${cleanText.length})`, 'warning');
        return;
    }

    try {
        const response = await fetch('/api/analysis/vigenere/estimatekey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key_length: keyLength })
        });

        const data = await response.json();

        if (data.success) {
            displayVigenereKeyResults(data.estimated_key, data.decrypted_preview);
            showNotification('Clave estimada correctamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function displayVigenereKeyResults(key, preview) {
    document.getElementById('vigenere-estimated-key').textContent = key;
    document.getElementById('vigenere-decrypted-preview').textContent = preview;
    document.getElementById('vigenere-key-results').style.display = 'block';
}