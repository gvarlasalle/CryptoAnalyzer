"""
Generación de reportes de auditoría criptográfica
"""

from datetime import datetime
import json


class ReportGenerator:
    """Genera reportes detallados de auditoría criptográfica"""
    
    @staticmethod
    def generate_full_report(analysis_data):
        """
        Genera un reporte completo de auditoría
        
        Args:
            analysis_data: Diccionario con resultados de análisis
        
        Returns:
            Diccionario con el reporte formateado
        """
        report = {
            'metadata': {
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'tool': 'CryptoAnalyzer v1.0',
                'analyst': 'Sistema Automatizado'
            },
            'executive_summary': ReportGenerator._generate_executive_summary(analysis_data),
            'detailed_findings': analysis_data.get('vulnerabilities', []),
            'recommendations': ReportGenerator._generate_recommendations(analysis_data),
            'technical_details': analysis_data.get('technical_details', {}),
            'risk_assessment': ReportGenerator._generate_risk_assessment(analysis_data)
        }
        
        return report
    
    @staticmethod
    def _generate_executive_summary(analysis_data):
        """Genera resumen ejecutivo del análisis"""
        algorithm = analysis_data.get('algorithm', 'Desconocido')
        vulnerabilities = analysis_data.get('vulnerabilities', [])
        
        critical_count = sum(1 for v in vulnerabilities if v['severity'] == 'CRÍTICA')
        high_count = sum(1 for v in vulnerabilities if v['severity'] == 'ALTA')
        
        if critical_count > 0:
            risk_level = 'CRÍTICO'
            summary = f'El análisis del algoritmo {algorithm} reveló {critical_count} vulnerabilidad(es) crítica(s) que comprometen significativamente la seguridad. Se requiere acción inmediata.'
        elif high_count > 0:
            risk_level = 'ALTO'
            summary = f'El análisis del algoritmo {algorithm} identificó {high_count} vulnerabilidad(es) de alta severidad que deben ser atendidas prioritariamente.'
        elif len(vulnerabilities) > 0:
            risk_level = 'MEDIO'
            summary = f'El análisis del algoritmo {algorithm} encontró algunas debilidades que deberían ser consideradas para mejorar la seguridad.'
        else:
            risk_level = 'BAJO'
            summary = f'El algoritmo {algorithm} no presenta vulnerabilidades críticas en la configuración actual.'
        
        return {
            'algorithm': algorithm,
            'risk_level': risk_level,
            'total_vulnerabilities': len(vulnerabilities),
            'critical_vulnerabilities': critical_count,
            'high_vulnerabilities': high_count,
            'summary': summary
        }
    
    @staticmethod
    def _generate_recommendations(analysis_data):
        """Genera recomendaciones basadas en vulnerabilidades encontradas"""
        vulnerabilities = analysis_data.get('vulnerabilities', [])
        algorithm = analysis_data.get('algorithm', '').lower()
        
        recommendations = []
        
        # Recomendaciones generales por tipo de algoritmo
        if algorithm in ['caesar', 'vigenere', 'playfair']:
            recommendations.append({
                'priority': 'ALTA',
                'category': 'Migración de Algoritmo',
                'recommendation': 'Migrar a algoritmos criptográficos modernos y certificados.',
                'details': 'Los cifrados clásicos no son apropiados para proteger información sensible. Se recomienda implementar AES-256-GCM para cifrado simétrico o RSA-2048/4096 con OAEP para cifrado asimétrico.',
                'estimated_effort': 'Medio',
                'security_impact': 'Crítico'
            })
        
        # Recomendaciones específicas por vulnerabilidad
        vuln_types = set(v['type'] for v in vulnerabilities)
        
        if 'Modo ECB No Seguro' in vuln_types:
            recommendations.append({
                'priority': 'CRÍTICA',
                'category': 'Configuración de Cifrado',
                'recommendation': 'Reemplazar modo ECB inmediatamente',
                'details': 'Implementar modo CBC, CTR o preferiblemente GCM. Generar IV aleatorio único para cada operación de cifrado.',
                'estimated_effort': 'Bajo',
                'security_impact': 'Crítico'
            })
        
        if 'Tamaño de Clave Insuficiente' in vuln_types or 'Clave Demasiado Corta' in vuln_types:
            recommendations.append({
                'priority': 'ALTA',
                'category': 'Gestión de Claves',
                'recommendation': 'Aumentar longitud de claves',
                'details': 'Para AES, usar mínimo 256 bits. Para RSA, usar mínimo 2048 bits (preferible 4096). Para claves basadas en contraseñas, usar mínimo 12-16 caracteres con alta entropía.',
                'estimated_effort': 'Bajo',
                'security_impact': 'Alto'
            })
        
        if 'Sin Autenticación' in vuln_types:
            recommendations.append({
                'priority': 'MEDIA',
                'category': 'Integridad de Datos',
                'recommendation': 'Implementar autenticación de mensajes',
                'details': 'Usar modos AEAD como AES-GCM o agregar HMAC-SHA256 para verificar integridad y autenticidad de datos cifrados.',
                'estimated_effort': 'Medio',
                'security_impact': 'Alto'
            })
        
        if 'Reutilización de IV/Nonce' in vuln_types:
            recommendations.append({
                'priority': 'CRÍTICA',
                'category': 'Vectores de Inicialización',
                'recommendation': 'Generar IV/nonce único por operación',
                'details': 'Implementar generación de IV/nonce criptográficamente seguro y único para cada mensaje. Nunca reutilizar.',
                'estimated_effort': 'Bajo',
                'security_impact': 'Crítico'
            })
        
        # Recomendaciones generales de buenas prácticas
        recommendations.append({
            'priority': 'MEDIA',
            'category': 'Gestión de Claves',
            'recommendation': 'Implementar rotación de claves',
            'details': 'Establecer política de rotación periódica de claves criptográficas. Usar HSM o servicios de gestión de claves en la nube para claves de producción.',
            'estimated_effort': 'Alto',
            'security_impact': 'Medio'
        })
        
        recommendations.append({
            'priority': 'BAJA',
            'category': 'Monitoreo',
            'recommendation': 'Implementar auditoría y logging',
            'details': 'Registrar todas las operaciones criptográficas (sin incluir claves o datos sensibles) para detección de anomalías y cumplimiento normativo.',
            'estimated_effort': 'Medio',
            'security_impact': 'Bajo'
        })
        
        return recommendations
    
    @staticmethod
    def _generate_risk_assessment(analysis_data):
        """Genera evaluación de riesgos"""
        vulnerabilities = analysis_data.get('vulnerabilities', [])
        
        risk_scores = {
            'CRÍTICA': 10,
            'ALTA': 7,
            'MEDIA': 4,
            'BAJA': 1
        }
        
        total_risk = sum(risk_scores.get(v['severity'], 0) for v in vulnerabilities)
        
        if total_risk >= 20:
            overall_risk = 'CRÍTICO'
            risk_description = 'El sistema presenta múltiples vulnerabilidades graves que lo hacen altamente inseguro.'
        elif total_risk >= 10:
            overall_risk = 'ALTO'
            risk_description = 'El sistema tiene vulnerabilidades significativas que deben ser corregidas.'
        elif total_risk >= 5:
            overall_risk = 'MEDIO'
            risk_description = 'El sistema tiene algunas debilidades que deberían mejorarse.'
        else:
            overall_risk = 'BAJO'
            risk_description = 'El sistema presenta un nivel de seguridad aceptable con mejoras menores recomendadas.'
        
        return {
            'overall_risk': overall_risk,
            'risk_score': total_risk,
            'risk_description': risk_description,
            'vulnerabilities_by_severity': {
                'critical': sum(1 for v in vulnerabilities if v['severity'] == 'CRÍTICA'),
                'high': sum(1 for v in vulnerabilities if v['severity'] == 'ALTA'),
                'medium': sum(1 for v in vulnerabilities if v['severity'] == 'MEDIA'),
                'low': sum(1 for v in vulnerabilities if v['severity'] == 'BAJA')
            }
        }
    
    @staticmethod
    def format_html_report(report):
        """Formatea el reporte en HTML para visualización"""
        html = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Auditoría Criptográfica</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f5f5;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 2.5em;
                }}
                .metadata {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .executive-summary {{
                    background: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .risk-badge {{
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.9em;
                }}
                .risk-CRÍTICO {{ background: #dc3545; color: white; }}
                .risk-ALTO {{ background: #fd7e14; color: white; }}
                .risk-MEDIO {{ background: #ffc107; color: black; }}
                .risk-BAJO {{ background: #28a745; color: white; }}
                .vulnerability {{
                    background: white;
                    padding: 20px;
                    margin-bottom: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #dc3545;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .vulnerability.ALTA {{ border-left-color: #fd7e14; }}
                .vulnerability.MEDIA {{ border-left-color: #ffc107; }}
                .vulnerability.BAJA {{ border-left-color: #28a745; }}
                .recommendation {{
                    background: white;
                    padding: 20px;
                    margin-bottom: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .stats {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }}
                .stat-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .stat-card h3 {{
                    margin: 0;
                    color: #666;
                    font-size: 0.9em;
                }}
                .stat-card .number {{
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #667eea;
                    margin: 10px 0;
                }}
                h2 {{
                    color: #333;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔒 Reporte de Auditoría Criptográfica</h1>
                <p>CryptoAnalyzer - Análisis de Fortaleza Criptográfica</p>
            </div>
            
            <div class="metadata">
                <p><strong>Fecha de Generación:</strong> {report['metadata']['generated_at']}</p>
                <p><strong>Herramienta:</strong> {report['metadata']['tool']}</p>
                <p><strong>Algoritmo Analizado:</strong> {report['executive_summary']['algorithm']}</p>
            </div>
            
            <div class="executive-summary">
                <h2>📊 Resumen Ejecutivo</h2>
                <p><strong>Nivel de Riesgo:</strong> <span class="risk-badge risk-{report['executive_summary']['risk_level']}">{report['executive_summary']['risk_level']}</span></p>
                <p>{report['executive_summary']['summary']}</p>
                
                <div class="stats">
                    <div class="stat-card">
                        <h3>Total Vulnerabilidades</h3>
                        <div class="number">{report['executive_summary']['total_vulnerabilities']}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Críticas</h3>
                        <div class="number" style="color: #dc3545;">{report['executive_summary']['critical_vulnerabilities']}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Altas</h3>
                        <div class="number" style="color: #fd7e14;">{report['executive_summary']['high_vulnerabilities']}</div>
                    </div>
                </div>
            </div>
            
            <h2>🔍 Vulnerabilidades Detectadas</h2>
        """
        
        if report['detailed_findings']:
            for vuln in report['detailed_findings']:
                html += f"""
                <div class="vulnerability {vuln['severity']}">
                    <h3>{vuln['type']} <span class="risk-badge risk-{vuln['severity']}">{vuln['severity']}</span></h3>
                    <p><strong>Descripción:</strong> {vuln['description']}</p>
                    <p><strong>Impacto:</strong> {vuln['impact']}</p>
                    <p><strong>Recomendación:</strong> {vuln['recommendation']}</p>
                </div>
                """
        else:
            html += "<p>No se detectaron vulnerabilidades.</p>"
        
        html += "<h2>💡 Recomendaciones</h2>"
        
        for rec in report['recommendations']:
            html += f"""
            <div class="recommendation">
                <h3>{rec['recommendation']} <span class="risk-badge risk-{rec['priority']}">{rec['priority']}</span></h3>
                <p><strong>Categoría:</strong> {rec['category']}</p>
                <p><strong>Detalles:</strong> {rec['details']}</p>
                <p><strong>Esfuerzo Estimado:</strong> {rec['estimated_effort']} | <strong>Impacto en Seguridad:</strong> {rec['security_impact']}</p>
            </div>
            """
        
        html += f"""
            <h2>⚠️ Evaluación de Riesgos</h2>
            <div class="executive-summary">
                <p><strong>Riesgo General:</strong> <span class="risk-badge risk-{report['risk_assessment']['overall_risk']}">{report['risk_assessment']['overall_risk']}</span></p>
                <p><strong>Puntuación de Riesgo:</strong> {report['risk_assessment']['risk_score']}</p>
                <p>{report['risk_assessment']['risk_description']}</p>
            </div>
        </body>
        </html>
        """
        
        return html
    
    @staticmethod
    def export_json(report):
        """Exporta el reporte en formato JSON"""
        return json.dumps(report, indent=2, ensure_ascii=False)