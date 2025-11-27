// Al cargar la página, verificar datos disponibles
document.addEventListener('DOMContentLoaded', function() {
    checkAvailableData();
});

function checkAvailableData() {
    const aesData = localStorage.getItem('cryptoanalyzer_aes_analysis');
    const rsaData = localStorage.getItem('cryptoanalyzer_rsa_analysis');
    const benchmarkData = localStorage.getItem('cryptoanalyzer_benchmark');
    
    const hasData = aesData || rsaData || benchmarkData;
    
    if (!hasData) {
        const infoBox = document.querySelector('.info-box');
        if (infoBox) {
            infoBox.innerHTML = `
                <h4 style="color: #ff0000;"><span class="material-icons">warning</span> Sin Datos Disponibles</h4>
                <p style="color: #ff0000;">No se han encontrado análisis previos. Por favor:</p>
                <ul>
                    <li>Ve a <a href="/modern" style="color: #00ff00;"><strong>Evaluación de Fortaleza</strong></a> y ejecuta análisis de AES o RSA</li>
                    <li>Ve a <a href="/benchmark" style="color: #00ff00;"><strong>Comparación de Rendimiento</strong></a> y ejecuta benchmarks</li>
                    <li>Luego regresa aquí para generar el reporte</li>
                </ul>
            `;
        }
    } else {
        const infoBox = document.querySelector('.info-box');
        let available = [];
        if (aesData) available.push('Análisis AES');
        if (rsaData) available.push('Análisis RSA');
        if (benchmarkData) available.push('Benchmarks');
        
        if (infoBox) {
            infoBox.innerHTML = `
                <h4 style="color: #00ff00;"><span class="material-icons">check_circle</span> Datos Disponibles</h4>
                <p>Se encontraron los siguientes análisis:</p>
                <ul>
                    ${available.map(item => `<li style="color: #00ff00;">${item}</li>`).join('')}
                </ul>
                <p>Puedes generar el reporte ahora.</p>
            `;
        }
    }
}

// ============================================
// GENERACIÓN DE REPORTES
// ============================================

// Almacenamiento temporal de datos
let reportData = {
    aes: null,
    rsa: null,
    benchmark: null
};

async function generateReport() {
    const title = document.getElementById('report-title').value;
    const organization = document.getElementById('report-organization').value;
    const auditor = document.getElementById('report-auditor').value;
    
    const includeAES = document.getElementById('include-aes').checked;
    const includeRSA = document.getElementById('include-rsa').checked;
    const includeBenchmark = document.getElementById('include-benchmark').checked;
    const includeRecommendations = document.getElementById('include-recommendations').checked;
    
    if (!title || !organization) {
        showNotification('Por favor completa los campos obligatorios', 'warning');
        return;
    }
    
    showNotification('Generando reporte...', 'info');
    
    try {
        // Recuperar datos de localStorage
        const aesData = localStorage.getItem('cryptoanalyzer_aes_analysis');
        const rsaData = localStorage.getItem('cryptoanalyzer_rsa_analysis');
        const benchmarkData = localStorage.getItem('cryptoanalyzer_benchmark');
        
        const reportData = {
            aes_analysis: aesData ? JSON.parse(aesData) : null,
            rsa_analysis: rsaData ? JSON.parse(rsaData) : null,
            benchmark: benchmarkData ? JSON.parse(benchmarkData) : null
        };
        
        // Verificar que haya al menos un análisis
        if (!reportData.aes_analysis && !reportData.rsa_analysis && !reportData.benchmark) {
            showNotification('No hay análisis disponibles. Por favor ejecuta al menos un análisis primero.', 'warning');
            return;
        }
        
        displayReport(reportData, title, organization, auditor);
        showNotification('Reporte generado exitosamente', 'success');
        
    } catch (error) {
        showNotification('Error al generar reporte: ' + error, 'error');
        console.error('Error:', error);
    }
}

function displayReport(data, title, organization, auditor) {
    const date = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let reportHTML = `
        <div class="report-header">
            <h1>${title}</h1>
            <div class="report-meta">
                <p><strong>Organización:</strong> ${organization}</p>
                ${auditor ? `<p><strong>Auditor:</strong> ${auditor}</p>` : ''}
                <p><strong>Fecha:</strong> ${date}</p>
                <p><strong>Herramienta:</strong> CryptoAnalyzer v1.0</p>
            </div>
        </div>

        <div class="report-section">
            <h2><span class="material-icons">summarize</span> Resumen Ejecutivo</h2>
            ${generateExecutiveSummary(data)}
        </div>
    `;
    
    // Sección AES
    if (data.aes_analysis && document.getElementById('include-aes').checked) {
        reportHTML += generateAESSection(data.aes_analysis);
    }
    
    // Sección RSA
    if (data.rsa_analysis && document.getElementById('include-rsa').checked) {
        reportHTML += generateRSASection(data.rsa_analysis);
    }
    
    // Sección Benchmark
    if (data.benchmark && document.getElementById('include-benchmark').checked) {
        reportHTML += generateBenchmarkSection(data.benchmark);
    }
    
    // Recomendaciones
    if (document.getElementById('include-recommendations').checked) {
        reportHTML += generateRecommendationsSection(data);
    }
    
    // Footer del reporte
    reportHTML += `
        <div class="report-footer">
            <p>Este reporte fue generado automáticamente por CryptoAnalyzer.</p>
            <p>Universidad La Salle - Arequipa | Curso de Ciberseguridad</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                Fecha de generación: ${new Date().toLocaleString('es-ES')}
            </p>
        </div>
    `;
    
    document.getElementById('report-content').innerHTML = reportHTML;
    document.getElementById('report-preview').style.display = 'block';
    document.getElementById('preview-btn').style.display = 'inline-flex';
    document.getElementById('print-btn').style.display = 'inline-flex';
    
    // Scroll to preview
    document.getElementById('report-preview').scrollIntoView({ behavior: 'smooth' });
}

function generateExecutiveSummary(data) {
    let summary = '<div class="executive-summary">';
    
    let totalIssues = 0;
    let criticalIssues = 0;
    let overallScore = 0;
    let scoreCount = 0;
    
    if (data.aes_analysis) {
        totalIssues += data.aes_analysis.issues ? data.aes_analysis.issues.length : 0;
        overallScore += data.aes_analysis.score || 0;
        scoreCount++;
    }
    
    if (data.rsa_analysis) {
        totalIssues += data.rsa_analysis.issues ? data.rsa_analysis.issues.length : 0;
        overallScore += data.rsa_analysis.score || 0;
        scoreCount++;
    }
    
    const avgScore = scoreCount > 0 ? Math.round(overallScore / scoreCount) : 0;
    const status = avgScore >= 80 ? 'SEGURA' : avgScore >= 60 ? 'ACEPTABLE' : avgScore >= 40 ? 'DÉBIL' : 'CRÍTICA';
    const statusColor = avgScore >= 80 ? '#00ff00' : avgScore >= 60 ? '#7fff00' : avgScore >= 40 ? '#ffff00' : '#ff0000';
    
    // Si no hay análisis, mostrar advertencia
    if (scoreCount === 0) {
        summary += `
            <div style="background: #fff3cd; padding: 20px; border-left: 5px solid #ffff00; margin: 20px 0;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Sin Análisis Disponibles</h3>
                <p style="color: #856404; margin: 0;">No se pueden generar métricas sin análisis previos. Por favor ejecuta análisis en las secciones correspondientes.</p>
            </div>
        `;
    } else {
        summary += `
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="material-icons">security</span>
                    <h3>Estado General</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${statusColor};">${status}</p>
                </div>
                <div class="summary-item">
                    <span class="material-icons">star</span>
                    <h3>Puntuación Promedio</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${statusColor};">${avgScore}/100</p>
                </div>
                <div class="summary-item">
                    <span class="material-icons">warning</span>
                    <h3>Issues Detectados</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${totalIssues > 0 ? '#000000ff' : '#00ff00'};">${totalIssues}</p>
                </div>
            </div>

            <h3>Hallazgos Principales:</h3>
            <ul>
        `;
        
        if (data.aes_analysis) {
            summary += `<li><strong>AES:</strong> Puntuación ${data.aes_analysis.score}/100 - ${data.aes_analysis.issues && data.aes_analysis.issues.length > 0 ? data.aes_analysis.issues.length + ' problemas detectados' : 'Sin problemas críticos'}</li>`;
        }
        
        if (data.rsa_analysis) {
            summary += `<li><strong>RSA:</strong> Puntuación ${data.rsa_analysis.score}/100 - ${data.rsa_analysis.issues && data.rsa_analysis.issues.length > 0 ? data.rsa_analysis.issues.length + ' problemas detectados' : 'Sin problemas críticos'}</li>`;
        }
        
        if (data.benchmark) {
            const algos = [];
            if (data.benchmark.aes_results) algos.push('AES');
            if (data.benchmark.rsa_results) algos.push('RSA');
            summary += `<li><strong>Rendimiento:</strong> Benchmarks ejecutados para ${algos.join(' y ')}</li>`;
        }
        
        summary += `</ul>`;
    }
    
    summary += `</div>`;
    
    return summary;
}function generateExecutiveSummary(data) {
    let summary = '<div class="executive-summary">';
    
    let totalIssues = 0;
    let criticalIssues = 0;
    let overallScore = 0;
    let scoreCount = 0;
    
    if (data.aes_analysis) {
        totalIssues += data.aes_analysis.issues ? data.aes_analysis.issues.length : 0;
        overallScore += data.aes_analysis.score || 0;
        scoreCount++;
    }
    
    if (data.rsa_analysis) {
        totalIssues += data.rsa_analysis.issues ? data.rsa_analysis.issues.length : 0;
        overallScore += data.rsa_analysis.score || 0;
        scoreCount++;
    }
    
    const avgScore = scoreCount > 0 ? Math.round(overallScore / scoreCount) : 0;
    const status = avgScore >= 80 ? 'SEGURA' : avgScore >= 60 ? 'ACEPTABLE' : avgScore >= 40 ? 'DÉBIL' : 'CRÍTICA';
    const statusColor = avgScore >= 80 ? '#00ff00' : avgScore >= 60 ? '#7fff00' : avgScore >= 40 ? '#ffff00' : '#ff0000';
    
    // Si no hay análisis, mostrar advertencia
    if (scoreCount === 0) {
        summary += `
            <div style="background: #fff3cd; padding: 20px; border-left: 5px solid #ffff00; margin: 20px 0;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Sin Análisis Disponibles</h3>
                <p style="color: #856404; margin: 0;">No se pueden generar métricas sin análisis previos. Por favor ejecuta análisis en las secciones correspondientes.</p>
            </div>
        `;
    } else {
        summary += `
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="material-icons">security</span>
                    <h3>Estado General</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${statusColor};">${status}</p>
                </div>
                <div class="summary-item">
                    <span class="material-icons">star</span>
                    <h3>Puntuación Promedio</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${statusColor};">${avgScore}/100</p>
                </div>
                <div class="summary-item">
                    <span class="material-icons">warning</span>
                    <h3>Issues Detectados</h3>
                    <p style="font-size: 24px; font-weight: bold; color: ${totalIssues > 0 ? '#ffff00' : '#00ff00'};">${totalIssues}</p>
                </div>
            </div>

            <h3>Hallazgos Principales:</h3>
            <ul>
        `;
        
        if (data.aes_analysis) {
            summary += `<li><strong>AES:</strong> Puntuación ${data.aes_analysis.score}/100 - ${data.aes_analysis.issues && data.aes_analysis.issues.length > 0 ? data.aes_analysis.issues.length + ' problemas detectados' : 'Sin problemas críticos'}</li>`;
        }
        
        if (data.rsa_analysis) {
            summary += `<li><strong>RSA:</strong> Puntuación ${data.rsa_analysis.score}/100 - ${data.rsa_analysis.issues && data.rsa_analysis.issues.length > 0 ? data.rsa_analysis.issues.length + ' problemas detectados' : 'Sin problemas críticos'}</li>`;
        }
        
        if (data.benchmark) {
            const algos = [];
            if (data.benchmark.aes_results) algos.push('AES');
            if (data.benchmark.rsa_results) algos.push('RSA');
            summary += `<li><strong>Rendimiento:</strong> Benchmarks ejecutados para ${algos.join(' y ')}</li>`;
        }
        
        summary += `</ul>`;
    }
    
    summary += `</div>`;
    
    return summary;
}

function generateAESSection(aesAnalysis) {
    return `
        <div class="report-section">
            <h2><span class="material-icons">lock</span> Análisis de Implementación AES</h2>
            
            <div class="analysis-summary">
                <p><strong>Puntuación:</strong> <span style="color: ${aesAnalysis.score >= 80 ? '#00ff00' : aesAnalysis.score >= 60 ? '#ffff00' : '#ff0000'};">${aesAnalysis.score}/100</span></p>
                <p><strong>Entropía del cifrado:</strong> ${aesAnalysis.entropy ? aesAnalysis.entropy.toFixed(3) : 'N/A'} bits/byte</p>
                <p><strong>Fortaleza de clave:</strong> ${aesAnalysis.key_analysis ? aesAnalysis.key_analysis.message : 'N/A'}</p>
            </div>

            <h3>Pruebas de Vulnerabilidades:</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Prueba</th>
                        <th>Resultado</th>
                        <th>Severidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${aesAnalysis.iv_test ? `
                    <tr>
                        <td>Reutilización de IV</td>
                        <td>${aesAnalysis.iv_test.message}</td>
                        <td style="color: ${aesAnalysis.iv_test.vulnerable ? '#ff0000' : '#00ff00'};">${aesAnalysis.iv_test.severity}</td>
                    </tr>
                    ` : ''}
                    ${aesAnalysis.ecb_test ? `
                    <tr>
                        <td>Vulnerabilidad ECB</td>
                        <td>${aesAnalysis.ecb_test.message}</td>
                        <td style="color: ${aesAnalysis.ecb_test.vulnerable ? '#ff0000' : '#00ff00'};">${aesAnalysis.ecb_test.severity}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>

            ${aesAnalysis.issues && aesAnalysis.issues.length > 0 ? `
            <h3>Problemas Detectados:</h3>
            <ul class="issues-list">
                ${aesAnalysis.issues.map(issue => `<li><span class="material-icons" style="color: #ffff00;">warning</span> ${issue}</li>`).join('')}
            </ul>
            ` : '<p style="color: #00ff00;"><span class="material-icons">check_circle</span> No se detectaron problemas críticos</p>'}
        </div>
    `;
}

function generateRSASection(rsaAnalysis) {
    return `
        <div class="report-section">
            <h2><span class="material-icons">vpn_key</span> Análisis de Implementación RSA</h2>
            
            <div class="analysis-summary">
                <p><strong>Puntuación:</strong> <span style="color: ${rsaAnalysis.score >= 80 ? '#00ff00' : rsaAnalysis.score >= 60 ? '#ffff00' : '#ff0000'};">${rsaAnalysis.score}/100</span></p>
                <p><strong>Longitud de clave:</strong> ${rsaAnalysis.bit_length || 'N/A'} bits</p>
                <p><strong>Exponente público:</strong> ${rsaAnalysis.exponent || 'N/A'}</p>
                <p><strong>Estado de seguridad:</strong> <span style="color: ${rsaAnalysis.key_properties && rsaAnalysis.key_properties.secure ? '#00ff00' : '#ff0000'};">${rsaAnalysis.key_properties && rsaAnalysis.key_properties.secure ? 'SEGURA' : 'INSEGURA'}</span></p>
            </div>

            ${rsaAnalysis.issues && rsaAnalysis.issues.length > 0 ? `
            <h3>Problemas Detectados:</h3>
            <ul class="issues-list">
                ${rsaAnalysis.issues.map(issue => `<li><span class="material-icons" style="color: #ffff00;">warning</span> ${issue}</li>`).join('')}
            </ul>
            ` : '<p style="color: #00ff00;"><span class="material-icons">check_circle</span> No se detectaron problemas críticos</p>'}
        </div>
    `;
}

function generateBenchmarkSection(benchmark) {
    return `
        <div class="report-section">
            <h2><span class="material-icons">speed</span> Análisis de Rendimiento</h2>
            
            <p>Se ejecutaron pruebas de rendimiento con ${benchmark.iterations || 100} iteraciones.</p>

            ${benchmark.aes_results ? `
            <h3>Resultados AES:</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Algoritmo</th>
                        <th>Tiempo Cifrado (ms)</th>
                        <th>Tiempo Descifrado (ms)</th>
                        <th>Tiempo Total (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    ${benchmark.aes_results.map(r => `
                    <tr>
                        <td>AES-${r.key_size}</td>
                        <td>${r.encrypt_time_ms.toFixed(3)}</td>
                        <td>${r.decrypt_time_ms.toFixed(3)}</td>
                        <td><strong>${r.total_time_ms.toFixed(3)}</strong></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}

            ${benchmark.rsa_results ? `
            <h3>Resultados RSA:</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Algoritmo</th>
                        <th>Tiempo Cifrado (ms)</th>
                        <th>Tiempo Descifrado (ms)</th>
                        <th>Tiempo Total (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    ${benchmark.rsa_results.map(r => `
                    <tr>
                        <td>RSA-${r.key_size}</td>
                        <td>${r.encrypt_time_ms.toFixed(3)}</td>
                        <td>${r.decrypt_time_ms.toFixed(3)}</td>
                        <td><strong>${r.total_time_ms.toFixed(3)}</strong></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}

            <p><strong>Conclusión:</strong> ${generateBenchmarkConclusion(benchmark)}</p>
        </div>
    `;
}

function generateBenchmarkConclusion(benchmark) {
    if (benchmark.aes_results && benchmark.rsa_results) {
        const aesAvg = benchmark.aes_results.reduce((sum, r) => sum + r.total_time_ms, 0) / benchmark.aes_results.length;
        const rsaAvg = benchmark.rsa_results.reduce((sum, r) => sum + r.total_time_ms, 0) / benchmark.rsa_results.length;
        const factor = (rsaAvg / aesAvg).toFixed(0);
        
        return `AES es aproximadamente ${factor}x más rápido que RSA. Se recomienda usar esquema híbrido: RSA para intercambio de claves y AES para cifrado de datos.`;
    }
    return 'Datos de benchmark disponibles parcialmente.';
}

function generateRecommendationsSection(data) {
    let recommendations = [];
    
    // Recomendaciones AES
    if (data.aes_analysis) {
        if (data.aes_analysis.score < 80) {
            recommendations.push('Mejorar la configuración AES según los problemas detectados');
        }
        if (data.aes_analysis.key_analysis && !data.aes_analysis.key_analysis.strong) {
            recommendations.push('Regenerar claves AES con fuente de aleatoriedad criptográficamente segura');
        }
        if (data.aes_analysis.iv_test && data.aes_analysis.iv_test.vulnerable) {
            recommendations.push('CRÍTICO: Implementar generación de IV único para cada operación de cifrado');
        }
    }
    
    // Recomendaciones RSA
    if (data.rsa_analysis) {
        if (data.rsa_analysis.bit_length < 2048) {
            recommendations.push('URGENTE: Actualizar a RSA-2048 como mínimo absoluto');
        } else if (data.rsa_analysis.bit_length === 2048) {
            recommendations.push('Considerar migración a RSA-4096 para protección a largo plazo');
        }
        
        if (data.rsa_analysis.exponent !== 65537) {
            recommendations.push('Usar e=65537 como exponente público estándar');
        }
    }
    
    // Recomendaciones generales
    recommendations.push('Implementar rotación periódica de claves criptográficas');
    recommendations.push('Usar sistema de gestión de claves (KMS) para almacenamiento seguro');
    recommendations.push('Considerar esquema híbrido (RSA + AES) para aplicaciones críticas');
    recommendations.push('Realizar auditorías de seguridad periódicas');
    recommendations.push('Mantener actualizadas las bibliotecas criptográficas');
    
    return `
        <div class="report-section">
            <h2><span class="material-icons">recommend</span> Recomendaciones de Seguridad</h2>
            
            <h3>Prioridad Alta:</h3>
            <ul class="recommendations-list priority-high">
                ${recommendations.filter(r => r.includes('CRÍTICO') || r.includes('URGENTE')).map(r => `<li>${r}</li>`).join('') || '<li>No hay recomendaciones de prioridad alta</li>'}
            </ul>

            <h3>Prioridad Media:</h3>
            <ul class="recommendations-list priority-medium">
                ${recommendations.filter(r => !r.includes('CRÍTICO') && !r.includes('URGENTE') && !r.includes('Implementar') && !r.includes('Realizar') && !r.includes('Mantener')).map(r => `<li>${r}</li>`).join('') || '<li>No hay recomendaciones de prioridad media</li>'}
            </ul>

            <h3>Buenas Prácticas:</h3>
            <ul class="recommendations-list priority-low">
                ${recommendations.filter(r => r.includes('Implementar') || r.includes('Realizar') || r.includes('Mantener')).map(r => `<li>${r}</li>`).join('')}
            </ul>

            <div class="best-practices">
                <h3>Mejores Prácticas Generales:</h3>
                <ul>
                    <li><strong>AES-256 en modo GCM:</strong> Para cifrado autenticado de datos</li>
                    <li><strong>RSA-2048 o superior:</strong> Para intercambio de claves y firmas digitales</li>
                    <li><strong>OAEP para RSA:</strong> Usar siempre OAEP en lugar de PKCS#1 v1.5</li>
                    <li><strong>IV único:</strong> Generar nuevo IV aleatorio para cada operación AES-CBC</li>
                    <li><strong>Gestión de claves:</strong> Usar HSM o KMS para claves de producción</li>
                    <li><strong>Rotación:</strong> Rotar claves regularmente (cada 6-12 meses)</li>
                </ul>
            </div>
        </div>
    `;
}

function previewReport() {
    document.getElementById('report-preview').scrollIntoView({ behavior: 'smooth' });
}

function printReport() {
    window.print();
}

function copyReportHTML() {
    const reportContent = document.getElementById('report-content').innerHTML;
    const fullHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Auditoría Criptográfica</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #fff; color: #000; }
        .report-header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #00ff00; padding-bottom: 20px; }
        .report-section { margin: 30px 0; page-break-inside: avoid; }
        .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .report-table th, .report-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .report-table th { background: #00ff00; color: #000; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .summary-item { text-align: center; padding: 20px; border: 2px solid #00ff00; border-radius: 8px; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    ${reportContent}
</body>
</html>
    `;
    
    navigator.clipboard.writeText(fullHTML).then(() => {
        showNotification('HTML del reporte copiado al portapapeles', 'success');
    }).catch(err => {
        showNotification('Error al copiar', 'error');
    });
}

function clearStoredData() {
    if (confirm('¿Estás seguro de eliminar todos los análisis guardados?')) {
        localStorage.removeItem('cryptoanalyzer_aes_analysis');
        localStorage.removeItem('cryptoanalyzer_rsa_analysis');
        localStorage.removeItem('cryptoanalyzer_benchmark');
        showNotification('Datos eliminados correctamente', 'success');
        checkAvailableData();
        document.getElementById('report-preview').style.display = 'none';
        document.getElementById('preview-btn').style.display = 'none';
        document.getElementById('print-btn').style.display = 'none';
    }

}
