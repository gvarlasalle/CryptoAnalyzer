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

// ============================================
// ANÁLISIS AES
// ============================================
async function generateAnalysisAESKey() {
    const keySize = parseInt(document.getElementById('aes-analyze-key-size').value);
    
    try {
        const response = await fetch('/api/aes/generate-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key_size: keySize })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('aes-analyze-key').value = data.key;
            showNotification('Clave AES generada', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function analyzeAES() {
    const plaintext = document.getElementById('aes-analyze-text').value;
    const key = document.getElementById('aes-analyze-key').value;
    const mode = document.getElementById('aes-analyze-mode').value;
    
    if (!plaintext || !key) {
        showNotification('Por favor ingresa texto y genera una clave', 'warning');
        return;
    }
    
    showNotification('Analizando implementación AES...', 'info');
    
    try {
        const response = await fetch('/api/analyze/aes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                plaintext: plaintext,
                key: key,
                mode: mode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAESAnalysis(data.evaluation);
            document.getElementById('aes-analysis-result').style.display = 'block';
            showNotification('Análisis completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

function displayAESAnalysis(analysis) {
    // Puntuación
    const score = Math.round(analysis.score);
    document.getElementById('aes-score-value').textContent = score;
    
    const scoreCircle = document.getElementById('aes-score-circle');
    if (score >= 80) {
        scoreCircle.className = 'score-circle score-high';
        document.getElementById('aes-score-level').innerHTML = `
            <h3 style="color: #28a745;">Implementación Segura</h3>
            <p>La configuración AES cumple con los estándares de seguridad recomendados.</p>
        `;
    } else if (score >= 60) {
        scoreCircle.className = 'score-circle score-medium';
        document.getElementById('aes-score-level').innerHTML = `
            <h3 style="color: #ffa000;">Seguridad Aceptable</h3>
            <p>La configuración es funcional pero tiene áreas de mejora.</p>
        `;
    } else if (score >= 40) {
        scoreCircle.className = 'score-circle score-low';
        document.getElementById('aes-score-level').innerHTML = `
            <h3 style="color: #ff6f00;">Seguridad Débil</h3>
            <p>Se detectaron problemas que comprometen la seguridad.</p>
        `;
    } else {
        scoreCircle.className = 'score-circle score-critical';
        document.getElementById('aes-score-level').innerHTML = `
            <h3 style="color: #d32f2f;">Implementación Insegura</h3>
            <p>CRÍTICO: Esta configuración NO debe usarse en producción.</p>
        `;
    }
    
    // Análisis de clave
    const keyAnalysis = analysis.key_analysis;
    const keyIcon = keyAnalysis.strong ? 'check_circle' : 'error';
    const keyColor = keyAnalysis.strong ? '#28a745' : '#d32f2f';
    
    document.getElementById('aes-key-analysis').innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span class="material-icons" style="color: ${keyColor};">${keyIcon}</span>
            <strong>${keyAnalysis.message}</strong>
        </div>
        <p><strong>Entropía:</strong> ${keyAnalysis.entropy.toFixed(2)} / ${keyAnalysis.max_entropy.toFixed(2)} bits</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${keyAnalysis.entropy_percentage}%; background: ${keyColor};"></div>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">
            ${keyAnalysis.entropy_percentage.toFixed(1)}% de entropía máxima
        </p>
    `;
    
    // Entropía del cifrado
    const entropy = analysis.entropy;
    const entropyPercent = (entropy / 8.0) * 100;
    const entropyColor = entropyPercent > 90 ? '#28a745' : entropyPercent > 75 ? '#ffa000' : '#d32f2f';
    
    document.getElementById('aes-entropy-analysis').innerHTML = `
        <p><strong>Entropía de Shannon:</strong> ${entropy.toFixed(3)} bits/byte</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${entropyPercent}%; background: ${entropyColor};"></div>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">
            ${entropyPercent.toFixed(1)}% de entropía máxima (8.0 bits/byte es perfecto)
        </p>
        <p style="margin-top: 10px; font-size: 14px;">
            ${entropyPercent > 90 ? '✓ Excelente aleatoriedad' : 
              entropyPercent > 75 ? '⚠ Aleatoriedad aceptable' : 
              '✗ Baja aleatoriedad - posible debilidad'}
        </p>
    `;
    
    // Distribución de bytes
    const dist = analysis.distribution;
    const uniformColor = dist.uniformity > 80 ? '#28a745' : dist.uniformity > 60 ? '#ffa000' : '#d32f2f';
    
    document.getElementById('aes-distribution-analysis').innerHTML = `
        <p><strong>Bytes únicos:</strong> ${dist.unique_bytes} / 256</p>
        <p><strong>Total de bytes:</strong> ${dist.total_bytes}</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${dist.uniformity}%; background: ${uniformColor};"></div>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">
            ${dist.uniformity.toFixed(1)}% de uniformidad
        </p>
        <p style="margin-top: 10px; font-size: 14px;">
            <strong>Chi-cuadrado:</strong> ${dist.chi_squared.toFixed(2)}
        </p>
    `;
    
    // Patrones
    const patterns = analysis.patterns;
    const patternColor = patterns.repetition_rate < 5 ? '#28a745' : patterns.repetition_rate < 15 ? '#ffa000' : '#d32f2f';
    
    document.getElementById('aes-pattern-analysis').innerHTML = `
        <p><strong>Bloques totales:</strong> ${patterns.total_blocks}</p>
        <p><strong>Bloques únicos:</strong> ${patterns.unique_blocks}</p>
        <p><strong>Bloques repetidos:</strong> ${patterns.repeated_blocks}</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${patterns.repetition_rate}%; background: ${patternColor};"></div>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">
            ${patterns.repetition_rate.toFixed(1)}% de repetición
        </p>
        <p style="margin-top: 10px; font-size: 14px;">
            ${patterns.repetition_rate < 5 ? '✓ No hay patrones sospechosos' : 
              patterns.repetition_rate < 15 ? '⚠ Algunos bloques se repiten' : 
              '✗ CRÍTICO: Muchos bloques repetidos (vulnerabilidad ECB)'}
        </p>
    `;
    
    // Test de IV
    const ivTest = analysis.iv_test;
    const ivIcon = ivTest.vulnerable ? 'error' : 'check_circle';
    const ivColor = ivTest.vulnerable ? '#d32f2f' : '#28a745';
    
    document.getElementById('aes-iv-test').innerHTML = `
        <div class="test-result-header" style="background: ${ivColor}; color: white;">
            <span class="material-icons">${ivIcon}</span>
            <span>Prueba de Reutilización de IV</span>
        </div>
        <div class="test-result-body">
            <p><strong>Estado:</strong> ${ivTest.severity}</p>
            <p>${ivTest.message}</p>
            <p style="font-size: 13px; color: #666;">${ivTest.details}</p>
        </div>
    `;
    
    // Test de ECB
    if (analysis.ecb_test) {
        const ecbTest = analysis.ecb_test;
        const ecbIcon = ecbTest.vulnerable ? 'error' : 'check_circle';
        const ecbColor = ecbTest.vulnerable ? '#d32f2f' : '#28a745';
        
        document.getElementById('aes-ecb-test').innerHTML = `
            <div class="test-result-header" style="background: ${ecbColor}; color: white;">
                <span class="material-icons">${ecbIcon}</span>
                <span>Prueba de Vulnerabilidad ECB</span>
            </div>
            <div class="test-result-body">
                <p><strong>Estado:</strong> ${ecbTest.severity}</p>
                <p>${ecbTest.message}</p>
                <p style="font-size: 13px; color: #666;">${ecbTest.details}</p>
                ${ecbTest.recommendation ? `<p style="margin-top: 10px;"><strong>Recomendación:</strong> ${ecbTest.recommendation}</p>` : ''}
            </div>
        `;
    } else {
        document.getElementById('aes-ecb-test').innerHTML = '';
    }
    
    // Issues
    if (analysis.issues && analysis.issues.length > 0) {
        document.getElementById('aes-issues-container').style.display = 'block';
        let issuesHTML = '';
        analysis.issues.forEach(issue => {
            issuesHTML += `<li><span class="material-icons" style="color: #ff6f00; font-size: 18px;">warning</span> ${issue}</li>`;
        });
        document.getElementById('aes-issues-list').innerHTML = issuesHTML;
    } else {
        document.getElementById('aes-issues-container').style.display = 'none';
    }
    
    // Recomendaciones
    let recommendations = [];
    
    if (!keyAnalysis.strong) {
        recommendations.push('Regenerar clave con fuente de aleatoriedad criptográficamente segura');
    }
    
    if (entropy < 7.5) {
        recommendations.push('La baja entropía sugiere posible debilidad en la implementación');
    }
    
    if (patterns.repetition_rate > 10) {
        recommendations.push('CRÍTICO: Cambiar modo de operación - detectados patrones repetidos');
    }
    
    if (ivTest.vulnerable) {
        recommendations.push('CRÍTICO: Implementar generación de IV único para cada cifrado');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('La implementación cumple con las mejores prácticas de seguridad');
        recommendations.push('Mantener rotación periódica de claves');
        recommendations.push('Monitorear por actualizaciones de seguridad');
    }
    
    let recsHTML = '<ul>';
    recommendations.forEach(rec => {
        recsHTML += `<li>${rec}</li>`;
    });
    recsHTML += '</ul>';
    document.getElementById('aes-recommendations').innerHTML = recsHTML;

    // Detección de Debilidades en Implementación
    
    // 1. IV Reutilización
    const ivReuse = ivTest.vulnerable ? 'critical' : 'safe';
    document.getElementById('weakness-iv-reuse').innerHTML = `
        <p>${ivTest.message}</p>
        <span class="weakness-status ${ivReuse}">
            ${ivTest.vulnerable ? 'VULNERABLE' : 'SEGURO'}
        </span>
    `;
    
    // 2. Modo ECB
    let ecbStatus = 'safe';
    let ecbMessage = 'No se usa modo ECB';
    
    if (analysis.ecb_test) {
        ecbStatus = analysis.ecb_test.vulnerable ? 'critical' : 'safe';
        ecbMessage = analysis.ecb_test.message;
    } else {
        const mode = document.getElementById('aes-analyze-mode').value;
        if (mode === 'ECB') {
            ecbStatus = 'critical';
            ecbMessage = 'CRÍTICO: Modo ECB detectado';
        }
    }
    
    document.getElementById('weakness-ecb-mode').innerHTML = `
        <p>${ecbMessage}</p>
        <span class="weakness-status ${ecbStatus}">
            ${ecbStatus === 'critical' ? 'INSEGURO' : 'SEGURO'}
        </span>
    `;
    
    // 3. Fortaleza de Clave
    const keyStatus = keyAnalysis.strong ? 'safe' : (keyAnalysis.severity === 'CRÍTICO' ? 'critical' : 'warning');
    document.getElementById('weakness-key-strength').innerHTML = `
        <p>Entropía: ${keyAnalysis.entropy.toFixed(2)} / ${keyAnalysis.max_entropy.toFixed(2)} bits</p>
        <p>${keyAnalysis.entropy_percentage.toFixed(1)}% de entropía máxima</p>
        <span class="weakness-status ${keyStatus}">
            ${keyAnalysis.strong ? 'FUERTE' : 'DÉBIL'}
        </span>
    `;
    
    // 4. Entropía del Cifrado
    const entropyStatus = entropyPercent > 90 ? 'safe' : (entropyPercent > 75 ? 'warning' : 'critical');
    document.getElementById('weakness-entropy').innerHTML = `
        <p>Entropía: ${entropy.toFixed(2)} / 8.0 bits/byte</p>
        <p>${entropyPercent.toFixed(1)}% de aleatoriedad</p>
        <span class="weakness-status ${entropyStatus}">
            ${entropyStatus === 'safe' ? 'EXCELENTE' : (entropyStatus === 'warning' ? 'ACEPTABLE' : 'BAJO')}
        </span>
    `;

    saveAESAnalysis(analysis);
}

// ============================================
// ANÁLISIS RSA
// ============================================
async function generateAnalysisRSAKey() {
    const keySize = parseInt(document.getElementById('rsa-analyze-key-size').value);
    
    showNotification('Generando par de claves RSA...', 'info');
    
    try {
        const response = await fetch('/api/rsa/generate-keypair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key_size: keySize })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('rsa-analyze-public-key').value = data.keypair.public_key;
            document.getElementById('rsa-analyze-private-key').value = data.keypair.private_key;
            document.getElementById('rsa-analyze-keys').style.display = 'block';
            document.getElementById('rsa-analyze-btn').style.display = 'inline-flex';
            showNotification('Par de claves generado exitosamente', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
    }
}

async function analyzeRSA() {
    const publicKey = document.getElementById('rsa-analyze-public-key').value;
    const keySize = parseInt(document.getElementById('rsa-analyze-key-size').value);
    const padding = document.getElementById('rsa-analyze-padding').value;
    const text = document.getElementById('rsa-analyze-text').value;
    
    if (!publicKey) {
        showNotification('Por favor genera un par de claves primero', 'warning');
        return;
    }
    
    showNotification('Analizando implementación RSA...', 'info');
    
    try {
        const response = await fetch('/api/analyze/rsa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                public_key: publicKey,
                key_size: keySize,
                padding: padding,
                text: text
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayRSAAnalysis(data.evaluation, padding);
            document.getElementById('rsa-analysis-result').style.display = 'block';
            showNotification('Análisis completado', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Error de conexión: ' + error, 'error');
        console.error('Error completo:', error);
    }
}

function displayRSAAnalysis(analysis, padding) {
    // Puntuación
    const score = Math.round(analysis.score);
    document.getElementById('rsa-score-value').textContent = score;
    
    const scoreCircle = document.getElementById('rsa-score-circle');
    if (score >= 80) {
        scoreCircle.className = 'score-circle score-high';
        document.getElementById('rsa-score-level').innerHTML = `
            <h3 style="color: #00ff00;">Implementación Segura</h3>
            <p>La configuración RSA cumple con los estándares de seguridad actuales.</p>
        `;
    } else if (score >= 60) {
        scoreCircle.className = 'score-circle score-medium';
        document.getElementById('rsa-score-level').innerHTML = `
            <h3 style="color: #7fff00;">Seguridad Aceptable</h3>
            <p>La configuración es funcional pero considerar actualización.</p>
        `;
    } else if (score >= 40) {
        scoreCircle.className = 'score-circle score-low';
        document.getElementById('rsa-score-level').innerHTML = `
            <h3 style="color: #ffff00;">Seguridad Débil</h3>
            <p>Se recomienda actualizar la configuración.</p>
        `;
    } else {
        scoreCircle.className = 'score-circle score-critical';
        document.getElementById('rsa-score-level').innerHTML = `
            <h3 style="color: #ff0000;">Implementación Insegura</h3>
            <p>CRÍTICO: Esta clave NO debe usarse en producción.</p>
        `;
    }
    
    // Verificar que existan las propiedades
    const bitLength = analysis.bit_length || 0;
    const exponent = analysis.exponent || 0;
    const keyProps = analysis.key_properties || { secure: false, issues: [] };
    const secure = keyProps.secure || false;
    
    // Longitud de clave
    const lengthColor = bitLength >= 4096 ? '#00ff00' : bitLength >= 2048 ? '#7fff00' : '#ff0000';
    
    document.getElementById('rsa-bit-length').innerHTML = `
        <p style="font-size: 32px; font-weight: bold; color: ${lengthColor}; margin: 10px 0;">
            ${bitLength} bits
        </p>
        <p style="color: #fff;">${bitLength >= 4096 ? 'Excelente longitud para largo plazo' : 
             bitLength >= 2048 ? 'Longitud estándar actual' : 
             'INSEGURO: Clave demasiado corta'}</p>
    `;
    
    // Exponente
    const expColor = exponent === 65537 ? '#00ff00' : '#ffff00';
    
    document.getElementById('rsa-exponent').innerHTML = `
        <p style="font-size: 24px; font-weight: bold; color: ${expColor}; margin: 10px 0;">
            e = ${exponent}
        </p>
        <p style="color: #fff;">${exponent === 65537 ? 'Exponente recomendado (2^16 + 1)' : 
             'Exponente no estándar - verificar implementación'}</p>
    `;
    
    // Estado de seguridad
    const secureColor = secure ? '#00ff00' : '#ff0000';
    const secureIcon = secure ? 'check_circle' : 'error';
    
    document.getElementById('rsa-security-status').innerHTML = `
        <div style="text-align: center;">
            <span class="material-icons" style="font-size: 48px; color: ${secureColor};">${secureIcon}</span>
            <p style="font-weight: bold; color: ${secureColor}; margin: 10px 0;">
                ${secure ? 'Clave Segura' : 'Clave Insegura'}
            </p>
        </div>
    `;
    
    // Proyección temporal
    let projection = '';
    if (bitLength >= 4096) {
        projection = '2040+';
    } else if (bitLength >= 2048) {
        projection = '~2030';
    } else {
        projection = 'YA INSEGURA';
    }
    
    const projColor = bitLength >= 4096 ? '#00ff00' : bitLength >= 2048 ? '#7fff00' : '#ff0000';
    
    document.getElementById('rsa-time-projection').innerHTML = `
        <p style="font-size: 24px; font-weight: bold; color: ${projColor}; margin: 10px 0;">
            ${projection}
        </p>
        <p style="color: #fff;">Seguridad estimada hasta este año según proyecciones NIST</p>
    `;
    
    // Detección de Debilidades en Implementación RSA
    let weaknessesHTML = '';
    
    // 1. Tamaño de clave
    const keySizeStatus = bitLength >= 4096 ? 'safe' : (bitLength >= 2048 ? 'warning' : 'critical');
    const keySizeIcon = bitLength >= 4096 ? 'check_circle' : (bitLength >= 2048 ? 'warning' : 'error');
    weaknessesHTML += `
        <div class="weakness-test-card">
            <h5><span class="material-icons">${keySizeIcon}</span> Tamaño de Clave</h5>
            <p style="color: #fff; margin: 5px 0;"><strong>Longitud:</strong> ${bitLength} bits</p>
            <p style="color: #fff; font-size: 13px;">${bitLength >= 4096 ? 'Excelente para protección a largo plazo (>2040)' : 
                 bitLength >= 2048 ? 'Estándar actual, seguro hasta ~2030' : 
                 'PELIGRO: Factorizable con recursos actuales'}</p>
            <span class="weakness-status ${keySizeStatus}">
                ${keySizeStatus === 'safe' ? 'SEGURO' : (keySizeStatus === 'warning' ? 'ACEPTABLE' : 'CRÍTICO')}
            </span>
        </div>
    `;
    
    // 2. Exponente público
    const expStatus = exponent === 65537 ? 'safe' : 'warning';
    const expIcon = exponent === 65537 ? 'check_circle' : 'warning';
    weaknessesHTML += `
        <div class="weakness-test-card">
            <h5><span class="material-icons">${expIcon}</span> Exponente Público</h5>
            <p style="color: #fff; margin: 5px 0;"><strong>Valor:</strong> e = ${exponent}</p>
            <p style="color: #fff; font-size: 13px;">${exponent === 65537 ? 'Valor estándar recomendado (2^16 + 1)' : 
                 exponent === 3 ? 'DÉBIL: Vulnerable a ataques de módulo pequeño' :
                 'No estándar - verificar razones de implementación'}</p>
            <span class="weakness-status ${expStatus}">
                ${expStatus === 'safe' ? 'CORRECTO' : 'REVISAR'}
            </span>
        </div>
    `;
    
    // 3. Esquema de Padding
    let paddingStatus = 'safe';
    let paddingMessage = '';
    let paddingIcon = 'check_circle';
    
    if (padding === 'OAEP') {
        paddingStatus = 'safe';
        paddingMessage = 'OAEP es el estándar seguro actual. Resistente a ataques conocidos.';
        paddingIcon = 'check_circle';
    } else if (padding === 'PKCS1v15') {
        paddingStatus = 'warning';
        paddingMessage = 'PKCS#1 v1.5 es vulnerable a ataques de padding oracle (Bleichenbacher). Migrar a OAEP.';
        paddingIcon = 'warning';
    } else {
        paddingStatus = 'critical';
        paddingMessage = 'Sin padding detectado - EXTREMADAMENTE INSEGURO.';
        paddingIcon = 'error';
    }
    
    weaknessesHTML += `
        <div class="weakness-test-card">
            <h5><span class="material-icons">${paddingIcon}</span> Esquema de Padding</h5>
            <p style="color: #fff; margin: 5px 0;"><strong>Actual:</strong> ${padding}</p>
            <p style="color: #fff; font-size: 13px;">${paddingMessage}</p>
            <span class="weakness-status ${paddingStatus}">
                ${paddingStatus === 'safe' ? 'SEGURO' : (paddingStatus === 'warning' ? 'VULNERABLE' : 'CRÍTICO')}
            </span>
        </div>
    `;
    
    // 4. Seguridad general
    const overallStatus = secure && padding === 'OAEP' && bitLength >= 2048 ? 'safe' : 
                          secure && bitLength >= 2048 ? 'warning' : 'critical';
    const overallIcon = overallStatus === 'safe' ? 'verified_user' : 
                        overallStatus === 'warning' ? 'warning' : 'error';
    
    let overallMessage = '';
    if (overallStatus === 'safe') {
        overallMessage = 'Configuración aprobada. No se detectaron problemas críticos de seguridad.';
    } else if (overallStatus === 'warning') {
        overallMessage = 'Configuración funcional pero con áreas de mejora detectadas.';
    } else {
        overallMessage = 'RECHAZADO: Se detectaron problemas críticos que comprometen la seguridad.';
    }
    
    weaknessesHTML += `
        <div class="weakness-test-card">
            <h5><span class="material-icons">${overallIcon}</span> Evaluación General</h5>
            <p style="color: #fff; margin: 5px 0;"><strong>Issues detectados:</strong> ${keyProps.issues.length}</p>
            <p style="color: #fff; font-size: 13px;">${overallMessage}</p>
            <span class="weakness-status ${overallStatus}">
                ${overallStatus === 'safe' ? 'APROBADO' : (overallStatus === 'warning' ? 'REVISAR' : 'RECHAZADO')}
            </span>
        </div>
    `;
    
    document.getElementById('rsa-weaknesses').innerHTML = weaknessesHTML;
    
    // Issues
    if (analysis.issues && analysis.issues.length > 0) {
        document.getElementById('rsa-issues-container').style.display = 'block';
        let issuesHTML = '';
        analysis.issues.forEach(issue => {
            issuesHTML += `<li><span class="material-icons" style="color: #ffff00; font-size: 18px;">warning</span> ${issue}</li>`;
        });
        document.getElementById('rsa-issues-list').innerHTML = issuesHTML;
    } else {
        document.getElementById('rsa-issues-container').style.display = 'none';
    }
    
    // Recomendaciones
    let recommendations = [];
    
    if (bitLength < 2048) {
        recommendations.push('URGENTE: Actualizar a RSA-2048 como mínimo absoluto');
    } else if (bitLength === 2048) {
        recommendations.push('Considerar migración a RSA-4096 para protección a largo plazo');
    } else {
        recommendations.push('Longitud de clave apropiada para uso a largo plazo');
    }
    
    if (exponent !== 65537) {
        recommendations.push('Usar e=65537 como exponente público estándar');
    }
    
    if (padding !== 'OAEP') {
        recommendations.push('IMPORTANTE: Migrar a OAEP para protección contra ataques de padding oracle');
    }
    
    recommendations.push('Proteger clave privada en HSM o almacenamiento cifrado');
    recommendations.push('Implementar rotación periódica de pares de claves');
    recommendations.push('Para nuevas implementaciones, considerar ECDSA como alternativa más eficiente');
    
    let recsHTML = '<ul>';
    recommendations.forEach(rec => {
        recsHTML += `<li>${rec}</li>`;
    });
    recsHTML += '</ul>';
    document.getElementById('rsa-recommendations').innerHTML = recsHTML;

    saveRSAAnalysis(analysis);
}

// ============================================
// GUARDAR RESULTADOS EN LOCALSTORAGE
// ============================================
function saveAESAnalysis(evaluation) {
    try {
        const analysisData = {
            timestamp: new Date().toISOString(),
            score: evaluation.score,
            entropy: evaluation.entropy,
            distribution: evaluation.distribution,
            patterns: evaluation.patterns,
            key_analysis: evaluation.key_analysis,
            iv_test: evaluation.iv_test,
            ecb_test: evaluation.ecb_test,
            issues: evaluation.issues
        };
        localStorage.setItem('cryptoanalyzer_aes_analysis', JSON.stringify(analysisData));
        console.log('AES analysis saved to localStorage');
    } catch (error) {
        console.error('Error saving AES analysis:', error);
    }
}

function saveRSAAnalysis(evaluation) {
    try {
        const analysisData = {
            timestamp: new Date().toISOString(),
            score: evaluation.score,
            bit_length: evaluation.bit_length,
            exponent: evaluation.exponent,
            key_properties: evaluation.key_properties,
            issues: evaluation.issues
        };
        localStorage.setItem('cryptoanalyzer_rsa_analysis', JSON.stringify(analysisData));
        console.log('RSA analysis saved to localStorage');
    } catch (error) {
        console.error('Error saving RSA analysis:', error);
    }
}