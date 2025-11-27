# -*- coding: utf-8 -*-
"""
CryptoAnalyzer - Aplicacion Flask Principal
Analizador de Fortaleza Criptografica
"""

from flask import Flask, render_template, request, jsonify, send_file
from modules.classic_ciphers import CaesarCipher, VigenereCipher, PlayfairCipher
from modules.cryptanalysis import FrequencyAnalysis, BruteForce
from modules.modern_crypto import AESCrypto, RSACrypto, HybridCrypto
from modules.reports import ReportGenerator
from modules.modern_crypto import AESEvaluator, RSAEvaluator
from modules.modern_crypto import StrengthEvaluator, VulnerabilityDetector
import io
import base64

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cryptoanalyzer-secret-key-2024'

print("APP CARGADA CORRECTAMENTE")

# Rutas principales
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/classic')
def classic():
    return render_template('classic.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/modern')
def modern():
    return render_template('modern.html')

@app.route('/benchmark')
def benchmark():
    return render_template('benchmark.html')

@app.route('/report')
def report():
    return render_template('report.html')

# API - CIFRADOS CLASICOS
@app.route('/api/caesar/encrypt', methods=['POST'])
def caesar_encrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        shift = data.get('shift')
        
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere un texto'}), 400
        
        if shift is None:
            return jsonify({'success': False, 'error': 'Se requiere un desplazamiento'}), 400
        
        try:
            shift = int(shift)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'El desplazamiento debe ser un número'}), 400
        
        if shift < 0 or shift > 25:
            return jsonify({'success': False, 'error': 'El desplazamiento debe estar entre 0 y 25'}), 400
        
        encrypted = CaesarCipher.encrypt(text, shift)
        return jsonify({'success': True, 'result': encrypted, 'shift': shift})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/caesar/decrypt', methods=['POST'])
def caesar_decrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        shift = data.get('shift')
        
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere un texto cifrado'}), 400
        
        if shift is None:
            return jsonify({'success': False, 'error': 'Se requiere un desplazamiento'}), 400
        
        try:
            shift = int(shift)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'El desplazamiento debe ser un número'}), 400
        
        if shift < 0 or shift > 25:
            return jsonify({'success': False, 'error': 'El desplazamiento debe estar entre 0 y 25'}), 400
        
        decrypted = CaesarCipher.decrypt(text, shift)
        return jsonify({'success': True, 'result': decrypted, 'shift': shift})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/vigenere/encrypt', methods=['POST'])
def vigenere_encrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        key = data.get('key', '')
        if not key:
            return jsonify({'success': False, 'error': 'Se requiere una clave'}), 400
        encrypted = VigenereCipher.encrypt(text, key)
        return jsonify({'success': True, 'result': encrypted, 'key': key})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/vigenere/decrypt', methods=['POST'])
def vigenere_decrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        key = data.get('key', '')
        if not key:
            return jsonify({'success': False, 'error': 'Se requiere una clave'}), 400
        decrypted = VigenereCipher.decrypt(text, key)
        return jsonify({'success': True, 'result': decrypted, 'key': key})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/playfair/encrypt', methods=['POST'])
def playfair_encrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        key = data.get('key', '')
        if not key:
            return jsonify({'success': False, 'error': 'Se requiere una clave'}), 400
        encrypted = PlayfairCipher.encrypt(text, key)
        return jsonify({'success': True, 'result': encrypted, 'key': key})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/playfair/decrypt', methods=['POST'])
def playfair_decrypt():
    try:
        data = request.get_json()
        text = data.get('text', '')
        key = data.get('key', '')
        if not key:
            return jsonify({'success': False, 'error': 'Se requiere una clave'}), 400
        decrypted = PlayfairCipher.decrypt(text, key)
        return jsonify({'success': True, 'result': decrypted, 'key': key})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# API - CRIPTOANALISIS
@app.route('/api/analysis/frequency', methods=['POST'])
def frequency_analysis():
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere texto para analizar'}), 400
        frequencies = FrequencyAnalysis.analyze(text)
        chi_squared = FrequencyAnalysis.calculate_chi_squared(frequencies)
        chart_image = FrequencyAnalysis.generate_frequency_chart(frequencies)
        return jsonify({'success': True, 'frequencies': frequencies, 'chi_squared': chi_squared, 'chart': chart_image})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/analysis/bruteforce/caesar', methods=['POST'])
def bruteforce_caesar():
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere texto cifrado'}), 400
        results = BruteForce.caesar_attack(text)
        return jsonify({'success': True, 'results': results[:10]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/analysis/vigenere/keylength', methods=['POST'])
def vigenere_keylength():
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere texto cifrado'}), 400
        results = BruteForce.vigenere_key_length(text)
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/analysis/vigenere/estimatekey', methods=['POST'])
def vigenere_estimate_key():
    try:
        data = request.get_json()
        text = data.get('text', '')
        key_length = int(data.get('key_length', 5))
        if not text:
            return jsonify({'success': False, 'error': 'Se requiere texto cifrado'}), 400
        estimated_key = BruteForce.estimate_vigenere_key(text, key_length)
        decrypted = VigenereCipher.decrypt(text, estimated_key)
        return jsonify({'success': True, 'estimated_key': estimated_key, 'decrypted_preview': decrypted[:200]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# API - ALGORITMOS MODERNOS
@app.route('/api/aes/generate-key', methods=['POST'])
def aes_generate_key():
    try:
        data = request.get_json()
        key_size = int(data.get('key_size', 256))
        key = AESCrypto.generate_key(key_size)
        key_b64 = base64.b64encode(key).decode('utf-8')
        return jsonify({'success': True, 'key': key_b64, 'key_size': key_size})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/rsa/generate-keypair', methods=['POST'])
def rsa_generate_keypair():
    try:
        data = request.get_json()
        key_size = int(data.get('key_size', 2048))
        keypair = RSACrypto.generate_keypair(key_size)
        return jsonify({'success': True, 'keypair': keypair})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

 
@app.route('/api/analyze/aes', methods=['POST'])
def analyze_aes():
    try:
        data = request.json
        plaintext = data.get('plaintext')
        key = data.get('key')
        mode = data.get('mode')
        
        evaluation = StrengthEvaluator.evaluate_aes_implementation(plaintext, key, mode)
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/analyze/rsa', methods=['POST'])
def analyze_rsa():
    try:
        data = request.json
        public_key = data.get('public_key')
        key_size = data.get('key_size')
        padding = data.get('padding', 'OAEP')  # Agregar padding
        text = data.get('text', '')
        
        evaluation = StrengthEvaluator.evaluate_rsa_implementation(public_key, key_size)
        
        # Agregar información de padding al resultado
        evaluation['padding'] = padding
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/benchmark/aes', methods=['POST'])
def benchmark_aes():
    try:
        data = request.json
        text = data.get('text', 'Test text')
        iterations = data.get('iterations', 100)
        
        results = AESCrypto.benchmark(text, iterations=iterations)
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/benchmark/rsa', methods=['POST'])
def benchmark_rsa():
    try:
        data = request.json
        text = data.get('text', 'Test')[:100]  # Limitar para RSA
        iterations = data.get('iterations', 10)
        
        results = RSACrypto.benchmark(text, iterations=iterations)
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

   

print("TODAS LAS RUTAS DEFINIDAS")
if __name__ == '__main__':
    print("=" * 50)
    print("Iniciando CryptoAnalyzer...")
    print("Abre tu navegador en: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
