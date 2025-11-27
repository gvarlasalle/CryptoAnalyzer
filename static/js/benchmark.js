// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Actualizar tamaño del texto
document.addEventListener('DOMContentLoaded', function() {
    const textArea = document.getElementById('benchmark-text');
    if (textArea) {
        textArea.addEventListener('input', updateTextSize);
        updateTextSize();
    }
});

function updateTextSize() {
    const text = document.getElementById('benchmark-text').value;
    const size = new Blob([text]).size;
    document.getElementById('text-size').textContent = size;
}

// Variables globales para almacenar resultados
let aesResults = null;
let rsaResults = null;

// ============================================
// BENCHMARK AES
// ============================================
async function runAESBenchmark() {
    const text = document.getElementById('benchmark-text').value;
    const iterations = parseInt(document.getElementById('benchmark-iterations').value);
    
    if (!text) {
        showNotification('Por favor ingresa un texto', 'warning');
        return;
    }
    
    // Mostrar loading
    document.getElementById('aes-benchmark-loading').style.display = 'block';
    document.getElementById('aes-benchmark-result').style.display = 'none';
    
    try {
        const response = await fetch('/api/benchmark/aes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, iterations: iterations })
        });
        
        const data = await response.json();
        
        if (data.success) {
            aesResults = data.results;
            displayAESResults(data.results);
            showNotification('Benchmark AES completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    } finally {
        document.getElementById('aes-benchmark-loading').style.display = 'none';
    }
}

function displayAESResults(results) {
    // Llenar tabla
    let tbody = '';
    let fastest = results[0];
    
    results.forEach(result => {
        const isFastest = result.total_time_ms === Math.min(...results.map(r => r.total_time_ms));
        const rowClass = isFastest ? 'fastest-row' : '';
        const badge = isFastest ? '<span class="material-icons" style="color: #00ff00;">flash_on</span>' : '';
        
        tbody += `
            <tr class="${rowClass}">
                <td><strong>AES-${result.key_size}</strong> ${badge}</td>
                <td>${result.encrypt_time_ms.toFixed(3)} ms</td>
                <td>${result.decrypt_time_ms.toFixed(3)} ms</td>
                <td><strong>${result.total_time_ms.toFixed(3)} ms</strong></td>
                <td>${getSpeedRating(result.total_time_ms, results)}</td>
            </tr>
        `;
        
        if (result.total_time_ms < fastest.total_time_ms) {
            fastest = result;
        }
    });
    
    document.getElementById('aes-benchmark-tbody').innerHTML = tbody;
    
    // Análisis
    const slowest = results.reduce((prev, current) => 
        (prev.total_time_ms > current.total_time_ms) ? prev : current
    );
    
    const difference = ((slowest.total_time_ms - fastest.total_time_ms) / fastest.total_time_ms * 100).toFixed(1);
    
    document.getElementById('aes-analysis').innerHTML = `
        <ul style="color: #fff;">
            <li><strong style="color: #00ff00;">Más rápido:</strong> AES-${fastest.key_size} (${fastest.total_time_ms.toFixed(3)} ms)</li>
            <li><strong style="color: #ffff00;">Más lento:</strong> AES-${slowest.key_size} (${slowest.total_time_ms.toFixed(3)} ms)</li>
            <li><strong>Diferencia:</strong> ${difference}% más lento</li>
            <li><strong>Conclusión:</strong> ${getAESConclusion(difference)}</li>
        </ul>
    `;
    
    // Mostrar resultados
    document.getElementById('aes-benchmark-result').style.display = 'block';
    
    // Crear gráfico
    createAESChart(results);

    const existingBenchmark = JSON.parse(localStorage.getItem('cryptoanalyzer_benchmark') || '{}');
    existingBenchmark.aes_results = results;
    existingBenchmark.timestamp = new Date().toISOString();
    localStorage.setItem('cryptoanalyzer_benchmark', JSON.stringify(existingBenchmark));
}

function createAESChart(results) {
    const ctx = document.getElementById('aes-chart');
    
    // Destruir gráfico anterior si existe
    if (window.aesChartInstance) {
        window.aesChartInstance.destroy();
    }
    
    window.aesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: results.map(r => `AES-${r.key_size}`),
            datasets: [
                {
                    label: 'Cifrado (ms)',
                    data: results.map(r => r.encrypt_time_ms),
                    backgroundColor: 'rgba(0, 255, 0, 0.7)',
                    borderColor: 'rgba(0, 255, 0, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Descifrado (ms)',
                    data: results.map(r => r.decrypt_time_ms),
                    backgroundColor: 'rgba(0, 255, 255, 0.7)',
                    borderColor: 'rgba(0, 255, 255, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de Rendimiento AES',
                    color: '#00ff00',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: '#00ff00' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' },
                    title: {
                        display: true,
                        text: 'Tiempo (ms)',
                        color: '#00ff00'
                    }
                },
                x: {
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' }
                }
            }
        }
    });
}

function getAESConclusion(difference) {
    if (difference < 10) {
        return 'Diferencia mínima entre tamaños de clave. AES-256 recomendado por mejor seguridad con mínimo impacto en rendimiento.';
    } else if (difference < 20) {
        return 'Diferencia moderada. AES-256 ofrece mejor seguridad con impacto aceptable en velocidad.';
    } else {
        return 'Diferencia notable. Considerar balance entre seguridad (AES-256) y velocidad (AES-128).';
    }
}

// ============================================
// BENCHMARK RSA
// ============================================
async function runRSABenchmark() {
    const text = document.getElementById('benchmark-text').value;
    const iterations = parseInt(document.getElementById('benchmark-iterations').value);
    
    if (!text) {
        showNotification('Por favor ingresa un texto', 'warning');
        return;
    }
    
    // Advertencia para muchas iteraciones
    if (iterations > 100) {
        const confirm = window.confirm('RSA con más de 100 iteraciones puede tardar varios minutos. ¿Continuar?');
        if (!confirm) return;
    }
    
    // Mostrar loading
    document.getElementById('rsa-benchmark-loading').style.display = 'block';
    document.getElementById('rsa-benchmark-result').style.display = 'none';
    
    try {
        const response = await fetch('/api/benchmark/rsa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.substring(0, 100), iterations: iterations })
        });
        
        const data = await response.json();
        
        if (data.success) {
            rsaResults = data.results;
            displayRSAResults(data.results);
            showNotification('Benchmark RSA completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    } finally {
        document.getElementById('rsa-benchmark-loading').style.display = 'none';
    }
}

function displayRSAResults(results) {
    // Llenar tabla
    let tbody = '';
    let fastest = results[0];
    
    results.forEach(result => {
        const isFastest = result.total_time_ms === Math.min(...results.map(r => r.total_time_ms));
        const rowClass = isFastest ? 'fastest-row' : '';
        const badge = isFastest ? '<span class="material-icons" style="color: #00ff00;">flash_on</span>' : '';
        const warning = result.key_size === 1024 ? '<span style="color: #ff0000;">⚠️</span> ' : '';
        
        tbody += `
            <tr class="${rowClass}">
                <td><strong>${warning}RSA-${result.key_size}</strong> ${badge}</td>
                <td>${result.encrypt_time_ms.toFixed(3)} ms</td>
                <td>${result.decrypt_time_ms.toFixed(3)} ms</td>
                <td><strong>${result.total_time_ms.toFixed(3)} ms</strong></td>
                <td>${getSpeedRating(result.total_time_ms, results)}</td>
            </tr>
        `;
        
        if (result.total_time_ms < fastest.total_time_ms) {
            fastest = result;
        }
    });
    
    document.getElementById('rsa-benchmark-tbody').innerHTML = tbody;
    
    // Análisis
    const slowest = results.reduce((prev, current) => 
        (prev.total_time_ms > current.total_time_ms) ? prev : current
    );
    
    const factor = (slowest.total_time_ms / fastest.total_time_ms).toFixed(1);
    
    document.getElementById('rsa-analysis').innerHTML = `
        <ul style="color: #fff;">
            <li><strong style="color: #00ff00;">Más rápido:</strong> RSA-${fastest.key_size} (${fastest.total_time_ms.toFixed(3)} ms)</li>
            <li><strong style="color: #ffff00;">Más lento:</strong> RSA-${slowest.key_size} (${slowest.total_time_ms.toFixed(3)} ms)</li>
            <li><strong>Factor:</strong> RSA-${slowest.key_size} es ${factor}x más lento</li>
            <li><strong>Conclusión:</strong> ${getRSAConclusion(factor)}</li>
        </ul>
    `;
    
    // Mostrar resultados
    document.getElementById('rsa-benchmark-result').style.display = 'block';
    
    // Crear gráfico
    createRSAChart(results);

    const existingBenchmark = JSON.parse(localStorage.getItem('cryptoanalyzer_benchmark') || '{}');
    existingBenchmark.rsa_results = results;
    existingBenchmark.timestamp = new Date().toISOString();
    localStorage.setItem('cryptoanalyzer_benchmark', JSON.stringify(existingBenchmark));
}

function createRSAChart(results) {
    const ctx = document.getElementById('rsa-chart');
    
    // Destruir gráfico anterior si existe
    if (window.rsaChartInstance) {
        window.rsaChartInstance.destroy();
    }
    
    window.rsaChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: results.map(r => `RSA-${r.key_size}`),
            datasets: [
                {
                    label: 'Cifrado (ms)',
                    data: results.map(r => r.encrypt_time_ms),
                    backgroundColor: 'rgba(0, 255, 0, 0.7)',
                    borderColor: 'rgba(0, 255, 0, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Descifrado (ms)',
                    data: results.map(r => r.decrypt_time_ms),
                    backgroundColor: 'rgba(255, 255, 0, 0.7)',
                    borderColor: 'rgba(255, 255, 0, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de Rendimiento RSA',
                    color: '#00ff00',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: '#00ff00' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' },
                    title: {
                        display: true,
                        text: 'Tiempo (ms)',
                        color: '#00ff00'
                    }
                },
                x: {
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' }
                }
            }
        }
    });
}

function getRSAConclusion(factor) {
    if (factor < 5) {
        return 'Diferencia moderada entre tamaños. RSA-2048 ofrece buen balance.';
    } else if (factor < 10) {
        return `Diferencia significativa (${factor}x). RSA-4096 solo para datos críticos a largo plazo.`;
    } else {
        return `Gran diferencia (${factor}x). RSA-4096 es considerablemente más lento pero más seguro.`;
    }
}

// ============================================
// COMPARACIÓN GLOBAL
// ============================================
async function runFullBenchmark() {
    const text = document.getElementById('benchmark-text').value;
    const iterations = parseInt(document.getElementById('benchmark-iterations').value);
    
    if (!text) {
        showNotification('Por favor ingresa un texto', 'warning');
        return;
    }
    
    // Mostrar loading
    document.getElementById('full-benchmark-loading').style.display = 'block';
    document.getElementById('comparison-result').style.display = 'none';
    
    try {
        // Ejecutar ambos benchmarks
        showNotification('Ejecutando benchmark AES...', 'info');
        const aesResponse = await fetch('/api/benchmark/aes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, iterations: iterations })
        });
        
        const aesData = await aesResponse.json();
        
        showNotification('Ejecutando benchmark RSA...', 'info');
        const rsaResponse = await fetch('/api/benchmark/rsa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.substring(0, 100), iterations: iterations })
        });
        
        const rsaData = await rsaResponse.json();
        
        if (aesData.success && rsaData.success) {
            aesResults = aesData.results;
            rsaResults = rsaData.results;
            displayComparison(aesData.results, rsaData.results);
            showNotification('Benchmark completo finalizado', 'success');
        } else {
            showNotification('Error en benchmarks', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    } finally {
        document.getElementById('full-benchmark-loading').style.display = 'none';
    }
}

function displayComparison(aesResults, rsaResults) {
    // Encontrar el más rápido de cada tipo
    const fastestAES = aesResults.reduce((prev, current) => 
        prev.total_time_ms < current.total_time_ms ? prev : current
    );
    
    const fastestRSA = rsaResults.reduce((prev, current) => 
        prev.total_time_ms < current.total_time_ms ? prev : current
    );
    
    const fastestOverall = fastestAES.total_time_ms < fastestRSA.total_time_ms ? fastestAES : fastestRSA;
    
    // Resumen
    document.getElementById('fastest-algo').innerHTML = `
        <p style="font-size: 24px; font-weight: bold; color: #00ff00; margin: 10px 0;">
            ${fastestOverall.key_size < 1000 ? 'AES' : 'RSA'}-${fastestOverall.key_size}
        </p>
        <p style="color: #fff;">${fastestOverall.total_time_ms.toFixed(3)} ms</p>
    `;
    
    document.getElementById('most-secure-algo').innerHTML = `
        <p style="font-size: 24px; font-weight: bold; color: #00ff00; margin: 10px 0;">
            AES-256 + RSA-4096
        </p>
        <p style="color: #fff;">Esquema Híbrido</p>
    `;
    
    document.getElementById('best-balance-algo').innerHTML = `
        <p style="font-size: 24px; font-weight: bold; color: #00ff00; margin: 10px 0;">
            AES-256 + RSA-2048
        </p>
        <p style="color: #fff;">Usado en TLS/HTTPS</p>
    `;
    
    // Tabla comparativa
    let tbody = '';
    
    aesResults.forEach(result => {
        tbody += `
            <tr>
                <td><strong>AES-${result.key_size}</strong></td>
                <td><span style="background: #00ff00; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 11px;">SIMÉTRICO</span></td>
                <td>${result.total_time_ms.toFixed(3)} ms</td>
                <td>${getRelativeSpeed(result.total_time_ms, fastestOverall.total_time_ms)}</td>
                <td style="color: #fff;">${getRecommendation(result.key_size, 'AES')}</td>
            </tr>
        `;
    });
    
    rsaResults.forEach(result => {
        tbody += `
            <tr>
                <td><strong>RSA-${result.key_size}</strong></td>
                <td><span style="background: #ffff00; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 11px;">ASIMÉTRICO</span></td>
                <td>${result.total_time_ms.toFixed(3)} ms</td>
                <td>${getRelativeSpeed(result.total_time_ms, fastestOverall.total_time_ms)}</td>
                <td style="color: #fff;">${getRecommendation(result.key_size, 'RSA')}</td>
            </tr>
        `;
    });
    
    document.getElementById('comparison-tbody').innerHTML = tbody;
    
    // Conclusiones
    const aesAvg = aesResults.reduce((sum, r) => sum + r.total_time_ms, 0) / aesResults.length;
    const rsaAvg = rsaResults.reduce((sum, r) => sum + r.total_time_ms, 0) / rsaResults.length;
    const factor = (rsaAvg / aesAvg).toFixed(0);
    
    document.getElementById('comparison-conclusions').innerHTML = `
        <ul style="color: #fff;">
            <li><strong style="color: #00ff00;">AES es ~${factor}x más rápido que RSA</strong> - Ideal para cifrado de datos masivos</li>
            <li><strong>RSA es esencial para intercambio de claves</strong> - Permite comunicación segura sin clave compartida previa</li>
            <li><strong>Esquema híbrido combina ambos:</strong> RSA intercambia clave AES, luego AES cifra los datos</li>
            <li><strong>Para HTTPS/TLS:</strong> Se usa RSA-2048+ para handshake y AES-256-GCM para datos</li>
            <li><strong>Recomendación general:</strong> AES-256 para cifrado de datos, RSA-2048+ para claves e identidad</li>
        </ul>
    `;
    
    // Mostrar resultados
    document.getElementById('comparison-result').style.display = 'block';
    
    // Crear gráfico
    createComparisonChart(aesResults, rsaResults);
}

function createComparisonChart(aesResults, rsaResults) {
    const ctx = document.getElementById('comparison-chart');
    
    // Destruir gráfico anterior si existe
    if (window.comparisonChartInstance) {
        window.comparisonChartInstance.destroy();
    }
    
    const labels = [
        ...aesResults.map(r => `AES-${r.key_size}`),
        ...rsaResults.map(r => `RSA-${r.key_size}`)
    ];
    
    const data = [
        ...aesResults.map(r => r.total_time_ms),
        ...rsaResults.map(r => r.total_time_ms)
    ];
    
    const colors = [
        ...aesResults.map(() => 'rgba(0, 255, 0, 0.7)'),
        ...rsaResults.map(() => 'rgba(255, 255, 0, 0.7)')
    ];
    
    const borderColors = [
        ...aesResults.map(() => 'rgba(0, 255, 0, 1)'),
        ...rsaResults.map(() => 'rgba(255, 255, 0, 1)')
    ];
    
    window.comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tiempo Total (ms)',
                data: data,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación Global de Algoritmos',
                    color: '#00ff00',
                    font: { size: 18 }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' },
                    title: {
                        display: true,
                        text: 'Tiempo Total (ms)',
                        color: '#00ff00'
                    }
                },
                x: {
                    ticks: { color: '#00ff00' },
                    grid: { color: 'rgba(0, 255, 0, 0.1)' }
                }
            }
        }
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function getSpeedRating(time, allResults) {
    const min = Math.min(...allResults.map(r => r.total_time_ms));
    const max = Math.max(...allResults.map(r => r.total_time_ms));
    const range = max - min;
    const normalized = range > 0 ? (time - min) / range : 0;
    
    if (normalized < 0.33) return '<span style="color: #00ff00;">🟢 Rápido</span>';
    if (normalized < 0.67) return '<span style="color: #ffff00;">🟡 Medio</span>';
    return '<span style="color: #ff6f00;">🔴 Lento</span>';
}

function getRelativeSpeed(time, fastestTime) {
    const factor = (time / fastestTime).toFixed(1);
    return `${factor}x`;
}

function getRecommendation(keySize, algorithm) {
    if (algorithm === 'AES') {
        if (keySize === 256) return 'Recomendado para datos sensibles';
        if (keySize === 192) return 'Buen balance seguridad/velocidad';
        return 'Aceptable para datos estándar';
    } else {
        if (keySize === 4096) return 'Para datos a muy largo plazo';
        if (keySize === 2048) return 'Estándar actual recomendado';
        return 'NO USAR - Inseguro';
    }
}

// ============================================
// GUARDAR RESULTADOS EN LOCALSTORAGE
// ============================================
function saveBenchmarkData(aesResults, rsaResults) {
    try {
        const benchmarkData = {
            timestamp: new Date().toISOString(),
            aes_results: aesResults,
            rsa_results: rsaResults,
            iterations: parseInt(document.getElementById('benchmark-iterations').value)
        };
        localStorage.setItem('cryptoanalyzer_benchmark', JSON.stringify(benchmarkData));
        console.log('Benchmark data saved to localStorage');
    } catch (error) {
        console.error('Error saving benchmark data:', error);
    }
}