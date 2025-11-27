"""
Implementación de algoritmos criptográficos modernos: AES y RSA
"""

from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64
import time
import hashlib
import os
from collections import Counter
import math

class AESCrypto:
    """Cifrado AES con diferentes modos de operación"""
    
    @staticmethod
    def generate_key(key_size=256):
        """Genera una clave AES aleatoria (128, 192 o 256 bits)"""
        return get_random_bytes(key_size // 8)
    
    @staticmethod
    def encrypt(plaintext, key, mode='CBC'):
        """
        Cifra texto usando AES
        Modos soportados: ECB, CBC, CFB, OFB, CTR
        """
        try:
            # Convertir texto a bytes
            if isinstance(plaintext, str):
                plaintext = plaintext.encode('utf-8')
            
            # Crear cipher según el modo
            if mode == 'ECB':
                cipher = AES.new(key, AES.MODE_ECB)
                ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
                return {
                    'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                    'mode': mode,
                    'key': base64.b64encode(key).decode('utf-8')
                }
            
            elif mode == 'CBC':
                cipher = AES.new(key, AES.MODE_CBC)
                ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
                return {
                    'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                    'iv': base64.b64encode(cipher.iv).decode('utf-8'),
                    'mode': mode,
                    'key': base64.b64encode(key).decode('utf-8')
                }
            
            elif mode == 'CFB':
                cipher = AES.new(key, AES.MODE_CFB)
                ciphertext = cipher.encrypt(plaintext)
                return {
                    'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                    'iv': base64.b64encode(cipher.iv).decode('utf-8'),
                    'mode': mode,
                    'key': base64.b64encode(key).decode('utf-8')
                }
            
            elif mode == 'OFB':
                cipher = AES.new(key, AES.MODE_OFB)
                ciphertext = cipher.encrypt(plaintext)
                return {
                    'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                    'iv': base64.b64encode(cipher.iv).decode('utf-8'),
                    'mode': mode,
                    'key': base64.b64encode(key).decode('utf-8')
                }
            
            elif mode == 'CTR':
                cipher = AES.new(key, AES.MODE_CTR)
                ciphertext = cipher.encrypt(plaintext)
                return {
                    'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                    'nonce': base64.b64encode(cipher.nonce).decode('utf-8'),
                    'mode': mode,
                    'key': base64.b64encode(key).decode('utf-8')
                }
            
            else:
                raise ValueError(f"Modo no soportado: {mode}")
        
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def decrypt(ciphertext_b64, key, mode='CBC', iv=None, nonce=None):
        """Descifra texto usando AES"""
        try:
            # Decodificar base64
            ciphertext = base64.b64decode(ciphertext_b64)
            
            # Crear cipher según el modo
            if mode == 'ECB':
                cipher = AES.new(key, AES.MODE_ECB)
                plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
                return plaintext.decode('utf-8')
            
            elif mode == 'CBC':
                if iv is None:
                    raise ValueError("Se requiere IV para modo CBC")
                iv_bytes = base64.b64decode(iv) if isinstance(iv, str) else iv
                cipher = AES.new(key, AES.MODE_CBC, iv=iv_bytes)
                plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
                return plaintext.decode('utf-8')
            
            elif mode == 'CFB':
                if iv is None:
                    raise ValueError("Se requiere IV para modo CFB")
                iv_bytes = base64.b64decode(iv) if isinstance(iv, str) else iv
                cipher = AES.new(key, AES.MODE_CFB, iv=iv_bytes)
                plaintext = cipher.decrypt(ciphertext)
                return plaintext.decode('utf-8')
            
            elif mode == 'OFB':
                if iv is None:
                    raise ValueError("Se requiere IV para modo OFB")
                iv_bytes = base64.b64decode(iv) if isinstance(iv, str) else iv
                cipher = AES.new(key, AES.MODE_OFB, iv=iv_bytes)
                plaintext = cipher.decrypt(ciphertext)
                return plaintext.decode('utf-8')
            
            elif mode == 'CTR':
                if nonce is None:
                    raise ValueError("Se requiere nonce para modo CTR")
                nonce_bytes = base64.b64decode(nonce) if isinstance(nonce, str) else nonce
                cipher = AES.new(key, AES.MODE_CTR, nonce=nonce_bytes)
                plaintext = cipher.decrypt(ciphertext)
                return plaintext.decode('utf-8')
            
            else:
                raise ValueError(f"Modo no soportado: {mode}")
        
        except Exception as e:
            return f"Error al descifrar: {str(e)}"
    
    @staticmethod
    def benchmark(plaintext, key_sizes=[128, 192, 256], iterations=100):
        """Compara el rendimiento de diferentes tamaños de clave AES"""
        results = []
        
        for key_size in key_sizes:
            key = AESCrypto.generate_key(key_size)
            
            # Medir tiempo de cifrado
            start = time.time()
            for _ in range(iterations):
                AESCrypto.encrypt(plaintext, key, mode='CBC')
            encrypt_time = (time.time() - start) / iterations
            
            # Medir tiempo de descifrado
            encrypted = AESCrypto.encrypt(plaintext, key, mode='CBC')
            start = time.time()
            for _ in range(iterations):
                AESCrypto.decrypt(
                    encrypted['ciphertext'], 
                    key, 
                    mode='CBC', 
                    iv=encrypted['iv']
                )
            decrypt_time = (time.time() - start) / iterations
            
            results.append({
                'key_size': key_size,
                'encrypt_time_ms': encrypt_time * 1000,
                'decrypt_time_ms': decrypt_time * 1000,
                'total_time_ms': (encrypt_time + decrypt_time) * 1000
            })
        
        return results


class RSACrypto:
    """Cifrado asimétrico RSA"""
    
    @staticmethod
    def generate_keypair(key_size=2048):
        """Genera un par de claves RSA (pública y privada)"""
        key = RSA.generate(key_size)
        
        private_key = key.export_key().decode('utf-8')
        public_key = key.publickey().export_key().decode('utf-8')
        
        return {
            'private_key': private_key,
            'public_key': public_key,
            'key_size': key_size
        }
    
    @staticmethod
    def encrypt(plaintext, public_key_pem):
        """Cifra texto usando la clave pública RSA"""
        try:
            # Importar clave pública
            public_key = RSA.import_key(public_key_pem)
            cipher = PKCS1_OAEP.new(public_key)
            
            # Convertir texto a bytes
            if isinstance(plaintext, str):
                plaintext = plaintext.encode('utf-8')
            
            # RSA tiene límite de tamaño, dividir si es necesario
            max_length = (public_key.size_in_bytes() - 42)  # OAEP padding
            
            if len(plaintext) <= max_length:
                ciphertext = cipher.encrypt(plaintext)
                return base64.b64encode(ciphertext).decode('utf-8')
            else:
                return "Error: Texto demasiado largo para RSA. Use AES para textos largos."
        
        except Exception as e:
            return f"Error al cifrar: {str(e)}"
    
    @staticmethod
    def decrypt(ciphertext_b64, private_key_pem):
        """Descifra texto usando la clave privada RSA"""
        try:
            # Importar clave privada
            private_key = RSA.import_key(private_key_pem)
            cipher = PKCS1_OAEP.new(private_key)
            
            # Decodificar y descifrar
            ciphertext = base64.b64decode(ciphertext_b64)
            plaintext = cipher.decrypt(ciphertext)
            
            return plaintext.decode('utf-8')
        
        except Exception as e:
            return f"Error al descifrar: {str(e)}"
    
    @staticmethod
    def benchmark(plaintext, key_sizes=[1024, 2048, 4096], iterations=10):
        """Compara el rendimiento de diferentes tamaños de clave RSA"""
        results = []
        
        for key_size in key_sizes:
            keypair = RSACrypto.generate_keypair(key_size)
            
            # Limitar texto para RSA
            test_text = plaintext[:100]
            
            # Medir tiempo de cifrado
            start = time.time()
            for _ in range(iterations):
                RSACrypto.encrypt(test_text, keypair['public_key'])
            encrypt_time = (time.time() - start) / iterations
            
            # Medir tiempo de descifrado
            encrypted = RSACrypto.encrypt(test_text, keypair['public_key'])
            start = time.time()
            for _ in range(iterations):
                RSACrypto.decrypt(encrypted, keypair['private_key'])
            decrypt_time = (time.time() - start) / iterations
            
            results.append({
                'key_size': key_size,
                'encrypt_time_ms': encrypt_time * 1000,
                'decrypt_time_ms': decrypt_time * 1000,
                'total_time_ms': (encrypt_time + decrypt_time) * 1000
            })
        
        return results


class HybridCrypto:
    """Cifrado híbrido: RSA para clave + AES para datos"""
    
    @staticmethod
    def encrypt(plaintext, public_key_pem):
        """Cifra usando esquema híbrido RSA-AES"""
        try:
            # Generar clave AES aleatoria
            aes_key = AESCrypto.generate_key(256)
            
            # Cifrar datos con AES
            aes_encrypted = AESCrypto.encrypt(plaintext, aes_key, mode='CBC')
            
            # Cifrar clave AES con RSA
            rsa_encrypted_key = RSACrypto.encrypt(aes_key, public_key_pem)
            
            return {
                'encrypted_data': aes_encrypted['ciphertext'],
                'encrypted_key': rsa_encrypted_key,
                'iv': aes_encrypted['iv'],
                'method': 'RSA-AES-256-CBC'
            }
        
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def decrypt(encrypted_data, encrypted_key, iv, private_key_pem):
        """Descifra usando esquema híbrido RSA-AES"""
        try:
            # Descifrar clave AES con RSA
            aes_key_str = RSACrypto.decrypt(encrypted_key, private_key_pem)
            
            if aes_key_str.startswith("Error"):
                return aes_key_str
            
            aes_key = base64.b64decode(aes_key_str)
            
            # Descifrar datos con AES
            plaintext = AESCrypto.decrypt(encrypted_data, aes_key, mode='CBC', iv=iv)
            
            return plaintext
        
        except Exception as e:
            return f"Error al descifrar: {str(e)}"
        
class AESEvaluator:
    """Evaluador de fortaleza para AES"""
    
    @staticmethod
    def evaluate(key_size, mode):
        """Evalúa la fortaleza de una configuración AES"""
        evaluation = {
            'key_size': key_size,
            'mode': mode,
            'score': 0,
            'security_level': '',
            'key_strength': '',
            'mode_security': '',
            'vulnerabilities': '',
            'attack_resistance': '',
            'recommendations': []
        }
        
        # Evaluar tamaño de clave
        key_scores = {128: 70, 192: 85, 256: 100}
        key_score = key_scores.get(key_size, 0)
        evaluation['score'] += key_score * 0.5
        
        if key_size == 256:
            evaluation['key_strength'] = f"""
                <p><strong>Fortaleza:</strong> <span style="color: #1b5e20;">Excelente</span></p>
                <p>Complejidad: 2^{key_size} combinaciones posibles</p>
                <p>Tiempo estimado de ataque por fuerza bruta: ~10^77 años</p>
                <p>Resistente a computación cuántica (Grover reduce a ~128 bits efectivos)</p>
            """
        elif key_size == 192:
            evaluation['key_strength'] = f"""
                <p><strong>Fortaleza:</strong> <span style="color: #388e3c;">Muy Buena</span></p>
                <p>Complejidad: 2^{key_size} combinaciones posibles</p>
                <p>Tiempo estimado de ataque por fuerza bruta: ~10^58 años</p>
                <p>Seguridad adecuada para la mayoría de aplicaciones</p>
            """
        else:
            evaluation['key_strength'] = f"""
                <p><strong>Fortaleza:</strong> <span style="color: #ffa000;">Buena</span></p>
                <p>Complejidad: 2^{key_size} combinaciones posibles</p>
                <p>Tiempo estimado de ataque por fuerza bruta: ~10^38 años</p>
                <p>Suficiente para aplicaciones estándar</p>
            """
        
        # Evaluar modo de operación
        mode_scores = {'CBC': 90, 'CTR': 95, 'CFB': 80, 'OFB': 80, 'ECB': 0}
        mode_score = mode_scores.get(mode, 50)
        evaluation['score'] += mode_score * 0.5
        
        if mode == 'ECB':
            evaluation['mode_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #d32f2f;">INSEGURO</span></p>
                <p><span class="material-icons" style="color: #d32f2f;">error</span> 
                ECB no debe usarse NUNCA en producción</p>
                <p>Problema: Bloques idénticos producen cifrado idéntico, revelando patrones</p>
                <p>Vulnerable a: Análisis de patrones, ataques de texto conocido</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #d32f2f;">Preservación de patrones:</strong> Permite detectar repeticiones en datos</li>
                    <li><strong style="color: #d32f2f;">Sin difusión:</strong> Cambios localizados no se propagan</li>
                    <li><strong style="color: #d32f2f;">Ataque de diccionario:</strong> Bloques conocidos pueden identificarse</li>
                </ul>
            """
            evaluation['recommendations'].append('CRÍTICO: Cambiar inmediatamente a CBC, CTR o GCM')
        elif mode == 'CBC':
            evaluation['mode_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #388e3c;">SEGURO</span></p>
                <p>CBC es un modo seguro y ampliamente adoptado</p>
                <p>Requisito: IV único y aleatorio para cada mensaje</p>
                <p>Limitación: No proporciona autenticación (considerar usar GCM)</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #ffa000;">Padding Oracle:</strong> Si el padding no se valida correctamente</li>
                    <li><strong style="color: #ffa000;">IV reutilizado:</strong> Usar siempre IV único y aleatorio</li>
                </ul>
            """
            evaluation['recommendations'].append('Usar IV único por mensaje')
            evaluation['recommendations'].append('Considerar HMAC para autenticación')
        elif mode == 'CTR':
            evaluation['mode_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #388e3c;">MUY SEGURO</span></p>
                <p>CTR es altamente seguro y eficiente</p>
                <p>Ventajas: Paralelizable, no requiere padding</p>
                <p>Requisito: Nonce único para cada mensaje</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #ffa000;">Nonce reutilizado:</strong> NUNCA reutilizar el nonce</li>
                    <li>Sin autenticación integrada (considerar GCM)</li>
                </ul>
            """
            evaluation['recommendations'].append('NUNCA reutilizar el nonce')
            evaluation['recommendations'].append('Usar GCM para autenticación integrada')
        else:
            evaluation['mode_security'] = f"""
                <p><strong>Seguridad:</strong> <span style="color: #388e3c;">SEGURO</span></p>
                <p>{mode} es un modo de operación seguro</p>
                <p>Requisito: IV único para cada mensaje</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #ffa000;">IV reutilizado:</strong> Usar siempre IV único</li>
                </ul>
            """
        
        # Resistencia a ataques
        evaluation['attack_resistance'] = f"""
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>Fuerza bruta:</strong></td>
                    <td style="padding: 8px; color: #1b5e20;">Prácticamente imposible (2^{key_size} combinaciones)</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>Criptoanálisis diferencial:</strong></td>
                    <td style="padding: 8px; color: #1b5e20;">Resistente (diseño específico)</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>Criptoanálisis lineal:</strong></td>
                    <td style="padding: 8px; color: #1b5e20;">Resistente (número suficiente de rondas)</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>Ataques de canal lateral:</strong></td>
                    <td style="padding: 8px; color: #ffa000;">Requiere implementación cuidadosa</td>
                </tr>
                <tr>
                    <td style="padding: 8px;"><strong>Computación cuántica:</strong></td>
                    <td style="padding: 8px; color: {"#1b5e20" if key_size >= 256 else "#ffa000"};">
                        {"Resistente (reducido a ~" + str(key_size//2) + " bits)" if key_size >= 256 else "Considerar AES-256"}
                    </td>
                </tr>
            </table>
        """
        
        # Determinar nivel de seguridad
        score = evaluation['score']
        if score >= 90:
            evaluation['security_level'] = 'MUY ALTO'
        elif score >= 75:
            evaluation['security_level'] = 'ALTO'
        elif score >= 50:
            evaluation['security_level'] = 'MEDIO'
        elif score >= 25:
            evaluation['security_level'] = 'BAJO'
        else:
            evaluation['security_level'] = 'CRÍTICO'
        
        # Recomendaciones adicionales
        if key_size < 256:
            evaluation['recommendations'].append('Considerar actualizar a AES-256 para máxima seguridad')
        
        if mode not in ['CBC', 'CTR']:
            evaluation['recommendations'].append('Considerar usar CBC o CTR para mejor seguridad')
        
        evaluation['recommendations'].append('Implementar rotación periódica de claves')
        evaluation['recommendations'].append('Usar un sistema de gestión de claves (KMS)')
        
        return evaluation


class RSAEvaluator:
    """Evaluador de fortaleza para RSA"""
    
    @staticmethod
    def evaluate(key_size, padding):
        """Evalúa la fortaleza de una configuración RSA"""
        evaluation = {
            'key_size': key_size,
            'padding': padding,
            'score': 0,
            'security_level': '',
            'key_strength': '',
            'padding_security': '',
            'vulnerabilities': '',
            'projection': '',
            'factorization': '',
            'recommendations': []
        }
        
        # Evaluar tamaño de clave
        key_scores = {1024: 0, 2048: 75, 4096: 100}
        key_score = key_scores.get(key_size, 50)
        evaluation['score'] += key_score * 0.6
        
        if key_size == 1024:
            evaluation['key_strength'] = """
                <p><strong>Fortaleza:</strong> <span style="color: #d32f2f;">INSEGURO</span></p>
                <p><span class="material-icons" style="color: #d32f2f;">error</span> 
                RSA-1024 NO debe usarse</p>
                <p>Estado: Factorizable con recursos modernos</p>
                <p>Equivalencia: ~80 bits de seguridad simétrica</p>
                <p>Descontinuado desde: 2010</p>
            """
            evaluation['factorization'] = """
                <p><strong>Complejidad de factorización:</strong> <span style="color: #d32f2f;">BAJA</span></p>
                <p>Método GNFS: ~2^86 operaciones</p>
                <p>Tiempo estimado: Factorizable en meses con recursos adecuados</p>
                <p>Estado: Ya se han factorizado claves RSA-768 públicamente</p>
            """
            evaluation['projection'] = """
                <p><strong>Seguro hasta:</strong> <span style="color: #d32f2f;">YA INSEGURO</span></p>
                <p>No apto para ningún uso en producción</p>
            """
        elif key_size == 2048:
            evaluation['key_strength'] = """
                <p><strong>Fortaleza:</strong> <span style="color: #388e3c;">BUENA</span></p>
                <p>Estado: Estándar actual de la industria</p>
                <p>Equivalencia: ~112 bits de seguridad simétrica</p>
                <p>Adoptado ampliamente desde: 2010</p>
            """
            evaluation['factorization'] = """
                <p><strong>Complejidad de factorización:</strong> <span style="color: #388e3c;">ALTA</span></p>
                <p>Método GNFS: ~2^117 operaciones</p>
                <p>Tiempo estimado: ~10^6 MIPS-years con tecnología actual</p>
                <p>Estado: Seguro contra ataques conocidos</p>
            """
            evaluation['projection'] = """
                <p><strong>Seguro hasta:</strong> <span style="color: #388e3c;">~2030</span></p>
                <p>Proyecciones NIST: Adecuado hasta 2030</p>
                <p>Recomendación: Planificar migración a 4096 bits para largo plazo</p>
            """
        else:  # 4096
            evaluation['key_strength'] = """
                <p><strong>Fortaleza:</strong> <span style="color: #1b5e20;">EXCELENTE</span></p>
                <p>Estado: Seguridad a largo plazo</p>
                <p>Equivalencia: ~140 bits de seguridad simétrica</p>
                <p>Uso: Datos altamente sensibles y largo plazo</p>
            """
            evaluation['factorization'] = """
                <p><strong>Complejidad de factorización:</strong> <span style="color: #1b5e20;">MUY ALTA</span></p>
                <p>Método GNFS: ~2^140 operaciones</p>
                <p>Tiempo estimado: >10^9 MIPS-years con tecnología actual</p>
                <p>Estado: Máxima seguridad práctica</p>
            """
            evaluation['projection'] = """
                <p><strong>Seguro hasta:</strong> <span style="color: #1b5e20;">2040+</span></p>
                <p>Proyecciones NIST: Seguro más allá de 2040</p>
                <p>Ideal para protección a muy largo plazo</p>
            """
        
        # Evaluar padding
        padding_scores = {'OAEP': 100, 'PKCS1v15': 60, 'None': 0}
        padding_score = padding_scores.get(padding, 50)
        evaluation['score'] += padding_score * 0.4
        
        if padding == 'None':
            evaluation['padding_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #d32f2f;">CRÍTICO</span></p>
                <p><span class="material-icons" style="color: #d32f2f;">error</span> 
                Sin padding es EXTREMADAMENTE INSEGURO</p>
                <p>Vulnerable a: Ataques matemáticos directos</p>
                <p>Nunca usar en producción</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #d32f2f;">RSA textbook:</strong> Cifrado determinístico, completamente inseguro</li>
                    <li><strong style="color: #d32f2f;">Propiedad multiplicativa:</strong> E(m1) * E(m2) = E(m1*m2)</li>
                    <li><strong style="color: #d32f2f;">Mensajes pequeños:</strong> Vulnerable a ataques de raíz</li>
                </ul>
            """
            evaluation['recommendations'].append('CRÍTICO: Implementar OAEP inmediatamente')
        elif padding == 'PKCS1v15':
            evaluation['padding_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #ffa000;">LEGACY</span></p>
                <p>PKCS#1 v1.5 es un esquema antiguo</p>
                <p>Vulnerable a: Ataques de padding oracle (Bleichenbacher)</p>
                <p>Recomendación: Migrar a OAEP</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li><strong style="color: #ff6f00;">Bleichenbacher attack:</strong> Padding oracle permite descifrar</li>
                    <li><strong style="color: #ff6f00;">Timing attacks:</strong> Variaciones en tiempo revelan información</li>
                    <li>Requiere validación cuidadosa de padding</li>
                </ul>
            """
            evaluation['recommendations'].append('Actualizar a OAEP para mejor seguridad')
        else:  # OAEP
            evaluation['padding_security'] = """
                <p><strong>Seguridad:</strong> <span style="color: #1b5e20;">SEGURO</span></p>
                <p>OAEP es el estándar recomendado</p>
                <p>Características: Probabilístico, resistente a ataques conocidos</p>
                <p>Usa: SHA-256 o superior para la función hash</p>
            """
            evaluation['vulnerabilities'] = """
                <ul>
                    <li>Sin vulnerabilidades conocidas significativas</li>
                    <li>Implementación debe ser constante en tiempo</li>
                    <li>Protección contra ataques de canal lateral requiere cuidado</li>
                </ul>
            """
        
        # Determinar nivel de seguridad
        score = evaluation['score']
        if score >= 90:
            evaluation['security_level'] = 'MUY ALTO'
        elif score >= 70:
            evaluation['security_level'] = 'ALTO'
        elif score >= 40:
            evaluation['security_level'] = 'MEDIO'
        elif score >= 20:
            evaluation['security_level'] = 'BAJO'
        else:
            evaluation['security_level'] = 'CRÍTICO'
        
        # Recomendaciones adicionales
        if key_size < 2048:
            evaluation['recommendations'].append('URGENTE: Actualizar a RSA-2048 como mínimo')
        elif key_size == 2048:
            evaluation['recommendations'].append('Planificar migración a RSA-4096 para datos de largo plazo')
        
        if padding != 'OAEP':
            evaluation['recommendations'].append('Usar OAEP con SHA-256 o superior')
        
        evaluation['recommendations'].append('Considerar curvas elípticas (ECDSA) como alternativa más eficiente')
        evaluation['recommendations'].append('Proteger la clave privada en HSM o almacenamiento seguro')
        evaluation['recommendations'].append('Implementar rotación periódica de pares de claves')
        
        return evaluation
    
import hashlib
import os
from collections import Counter
import math


class CryptoAnalyzer:
    """Análisis de fortaleza criptográfica"""
    
    @staticmethod
    def calculate_entropy(data):
        """Calcula la entropía de Shannon de los datos"""
        if not data:
            return 0
        
        # Contar frecuencias
        counter = Counter(data)
        length = len(data)
        
        # Calcular entropía
        entropy = 0
        for count in counter.values():
            probability = count / length
            entropy -= probability * math.log2(probability)
        
        return entropy
    
    @staticmethod
    def analyze_distribution(ciphertext):
        """Analiza la distribución de bytes en el texto cifrado"""
        if isinstance(ciphertext, str):
            import base64
            data = base64.b64decode(ciphertext)
        else:
            data = ciphertext
        
        byte_counts = Counter(data)
        total_bytes = len(data)
        
        # Calcular chi-cuadrado para uniformidad
        expected = total_bytes / 256
        chi_squared = sum((count - expected) ** 2 / expected for count in byte_counts.values())
        
        # Bytes únicos
        unique_bytes = len(byte_counts)
        
        return {
            'unique_bytes': unique_bytes,
            'total_bytes': total_bytes,
            'chi_squared': chi_squared,
            'uniformity': unique_bytes / 256 * 100  # Porcentaje de bytes únicos
        }
    
    @staticmethod
    def detect_patterns(ciphertext, block_size=16):
        """Detecta patrones repetidos (vulnerabilidad ECB)"""
        if isinstance(ciphertext, str):
            import base64
            data = base64.b64decode(ciphertext)
        else:
            data = ciphertext
        
        # Dividir en bloques
        blocks = [data[i:i+block_size] for i in range(0, len(data), block_size)]
        
        # Contar bloques únicos
        unique_blocks = len(set(blocks))
        total_blocks = len(blocks)
        
        # Detectar repeticiones
        block_counts = Counter(blocks)
        repeated_blocks = sum(1 for count in block_counts.values() if count > 1)
        
        return {
            'total_blocks': total_blocks,
            'unique_blocks': unique_blocks,
            'repeated_blocks': repeated_blocks,
            'repetition_rate': (total_blocks - unique_blocks) / total_blocks * 100 if total_blocks > 0 else 0
        }


class VulnerabilityDetector:
    """Detector de vulnerabilidades en implementaciones"""
    
    @staticmethod
    def test_iv_reuse(plaintext, key, mode='CBC'):
        """Detecta si el IV se reutiliza (genera mismo cifrado)"""
        try:
            # Cifrar dos veces el mismo texto
            result1 = AESCrypto.encrypt(plaintext, key, mode)
            result2 = AESCrypto.encrypt(plaintext, key, mode)
            
            if 'error' in result1 or 'error' in result2:
                return {
                    'vulnerable': False,
                    'message': 'No se pudo realizar la prueba'
                }
            
            # Si el cifrado es idéntico, el IV se está reutilizando (MALO)
            if result1['ciphertext'] == result2['ciphertext']:
                return {
                    'vulnerable': True,
                    'severity': 'CRÍTICO',
                    'message': 'IV reutilizado detectado - El cifrado es determinístico',
                    'details': 'Mismo texto plano produce mismo texto cifrado. Esto permite análisis de patrones.'
                }
            else:
                return {
                    'vulnerable': False,
                    'severity': 'SEGURO',
                    'message': 'IV único generado correctamente',
                    'details': 'Cada cifrado produce resultado diferente (comportamiento correcto)'
                }
        except Exception as e:
            return {
                'vulnerable': False,
                'message': f'Error en prueba: {str(e)}'
            }
    
    @staticmethod
    def test_ecb_weakness(plaintext, key):
        """Detecta vulnerabilidad ECB mediante patrones"""
        try:
            # Crear texto con repeticiones
            repeated_text = plaintext * 3
            
            # Cifrar en modo ECB
            result = AESCrypto.encrypt(repeated_text, key, 'ECB')
            
            if 'error' in result:
                return {
                    'vulnerable': False,
                    'message': 'No se pudo realizar la prueba'
                }
            
            # Analizar patrones
            patterns = CryptoAnalyzer.detect_patterns(result['ciphertext'])
            
            if patterns['repetition_rate'] > 10:
                return {
                    'vulnerable': True,
                    'severity': 'CRÍTICO',
                    'message': f'Patrones detectados: {patterns["repetition_rate"]:.1f}% de bloques repetidos',
                    'details': f'{patterns["repeated_blocks"]} de {patterns["total_blocks"]} bloques se repiten',
                    'recommendation': 'NUNCA usar modo ECB - Cambiar a CBC, CTR o GCM'
                }
            else:
                return {
                    'vulnerable': False,
                    'severity': 'SEGURO',
                    'message': 'No se detectaron patrones repetidos',
                    'details': f'Solo {patterns["repetition_rate"]:.1f}% de repetición (normal)'
                }
        except Exception as e:
            return {
                'vulnerable': False,
                'message': f'Error en prueba: {str(e)}'
            }
    
    @staticmethod
    def analyze_key_strength(key_b64):
        """Analiza la fortaleza de la clave"""
        try:
            import base64
            key = base64.b64decode(key_b64)
            
            # Calcular entropía
            entropy = CryptoAnalyzer.calculate_entropy(key)
            max_entropy = 8.0  # Máxima entropía para bytes
            
            # Analizar distribución
            byte_counts = Counter(key)
            unique_bytes = len(byte_counts)
            
            # Detectar patrones simples
            has_pattern = False
            pattern_type = None
            
            # ¿Es toda la clave el mismo byte?
            if unique_bytes == 1:
                has_pattern = True
                pattern_type = 'Clave compuesta de un solo valor'
            
            # ¿Hay secuencias?
            sequential = all(key[i] == key[i-1] + 1 for i in range(1, len(key)))
            if sequential:
                has_pattern = True
                pattern_type = 'Secuencia incremental detectada'
            
            # Evaluación
            if has_pattern:
                return {
                    'strong': False,
                    'severity': 'CRÍTICO',
                    'entropy': entropy,
                    'max_entropy': max_entropy,
                    'entropy_percentage': (entropy / max_entropy) * 100,
                    'message': f'Clave débil detectada: {pattern_type}',
                    'recommendation': 'Generar clave aleatoria criptográficamente segura'
                }
            elif entropy < max_entropy * 0.9:
                return {
                    'strong': False,
                    'severity': 'MEDIO',
                    'entropy': entropy,
                    'max_entropy': max_entropy,
                    'entropy_percentage': (entropy / max_entropy) * 100,
                    'message': f'Entropía baja: {entropy:.2f}/{max_entropy:.2f}',
                    'recommendation': 'Considerar regenerar clave con mejor fuente de aleatoriedad'
                }
            else:
                return {
                    'strong': True,
                    'severity': 'SEGURO',
                    'entropy': entropy,
                    'max_entropy': max_entropy,
                    'entropy_percentage': (entropy / max_entropy) * 100,
                    'message': f'Clave fuerte: Entropía {entropy:.2f}/{max_entropy:.2f}',
                    'unique_bytes': unique_bytes,
                    'total_bytes': len(key)
                }
        except Exception as e:
            return {
                'strong': False,
                'message': f'Error al analizar clave: {str(e)}'
            }
    
    @staticmethod
    def test_rsa_key_properties(public_key_pem):
        """Analiza propiedades de la clave RSA"""
        try:
            from Crypto.PublicKey import RSA
            
            key = RSA.import_key(public_key_pem)
            n = key.n
            e = key.e
            
            # Analizar exponente público
            weak_exponents = [3, 5, 17]
            common_exponents = [65537]
            
            issues = []
            
            if e in weak_exponents:
                issues.append({
                    'type': 'Exponente público débil',
                    'severity': 'ALTO',
                    'detail': f'e={e} es vulnerable a ciertos ataques',
                    'recommendation': 'Usar e=65537'
                })
            
            # Verificar que n sea impar (debe serlo)
            if n % 2 == 0:
                issues.append({
                    'type': 'Módulo par',
                    'severity': 'CRÍTICO',
                    'detail': 'El módulo n no debe ser par',
                    'recommendation': 'Regenerar clave'
                })
            
            # Analizar tamaño
            bit_length = key.size_in_bits()
            
            if bit_length < 2048:
                issues.append({
                    'type': 'Clave demasiado corta',
                    'severity': 'CRÍTICO',
                    'detail': f'{bit_length} bits es inseguro',
                    'recommendation': 'Usar mínimo 2048 bits'
                })
            
            return {
                'bit_length': bit_length,
                'exponent': e,
                'modulus_length': len(bin(n)) - 2,
                'issues': issues,
                'secure': len([i for i in issues if i['severity'] == 'CRÍTICO']) == 0
            }
        except Exception as e:
            return {
                'error': str(e),
                'secure': False
            }


class StrengthEvaluator:
    """Evaluador integral de fortaleza"""
    
    @staticmethod
    def evaluate_aes_implementation(plaintext, key_b64, mode):
        """Evaluación completa de implementación AES"""
        try:
            import base64
            key = base64.b64decode(key_b64)
            
            # 1. Analizar clave
            key_analysis = VulnerabilityDetector.analyze_key_strength(key_b64)
            
            # 2. Cifrar
            result = AESCrypto.encrypt(plaintext, key, mode)
            if 'error' in result:
                return {'error': result['error']}
            
            # 3. Analizar texto cifrado
            entropy = CryptoAnalyzer.calculate_entropy(base64.b64decode(result['ciphertext']))
            distribution = CryptoAnalyzer.analyze_distribution(result['ciphertext'])
            patterns = CryptoAnalyzer.detect_patterns(result['ciphertext'])
            
            # 4. Pruebas de vulnerabilidades
            iv_test = VulnerabilityDetector.test_iv_reuse(plaintext, key, mode)
            
            # 5. Prueba ECB si aplica
            ecb_test = None
            if mode == 'ECB':
                ecb_test = VulnerabilityDetector.test_ecb_weakness(plaintext, key)
            
            # Calcular puntuación
            score = 0
            issues = []
            
            # Puntuación por clave
            if key_analysis['strong']:
                score += 30
            else:
                issues.append(f"Clave: {key_analysis['message']}")
                score += 10
            
            # Puntuación por modo
            mode_scores = {'CBC': 25, 'CTR': 30, 'CFB': 20, 'OFB': 20, 'ECB': 0}
            score += mode_scores.get(mode, 15)
            
            if mode == 'ECB':
                issues.append('Modo ECB es inseguro')
            
            # Puntuación por entropía
            if entropy > 7.5:
                score += 25
            elif entropy > 6.5:
                score += 15
            else:
                score += 5
                issues.append(f'Entropía baja: {entropy:.2f}/8.0')
            
            # Puntuación por uniformidad
            if distribution['uniformity'] > 80:
                score += 10
            elif distribution['uniformity'] > 60:
                score += 5
            
            # Penalización por patrones
            if patterns['repetition_rate'] > 10:
                score -= 20
                issues.append(f'{patterns["repetition_rate"]:.1f}% de bloques repetidos')
            
            # Penalización por IV reutilizado
            if iv_test.get('vulnerable'):
                score -= 30
                issues.append('IV reutilizado detectado')
            
            # Puntuación por tamaño de clave
            key_size = len(key) * 8
            if key_size >= 256:
                score += 10
            elif key_size >= 192:
                score += 5
            
            score = max(0, min(100, score))
            
            return {
                'score': score,
                'key_analysis': key_analysis,
                'entropy': entropy,
                'distribution': distribution,
                'patterns': patterns,
                'iv_test': iv_test,
                'ecb_test': ecb_test,
                'issues': issues,
                'ciphertext_sample': result['ciphertext'][:100]
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def evaluate_rsa_implementation(public_key_pem, key_size):
        """Evaluación completa de implementación RSA"""
        try:
            # 1. Analizar propiedades de clave
            key_props = VulnerabilityDetector.test_rsa_key_properties(public_key_pem)
            
            # 2. Calcular puntuación
            score = 0
            issues = []
            
            # Puntuación por tamaño
            if key_size >= 4096:
                score += 50
            elif key_size >= 2048:
                score += 35
            elif key_size >= 1024:
                score += 10
            else:
                score += 0
                issues.append(f'Clave de {key_size} bits es demasiado corta')
            
            # Verificar problemas críticos
            critical_issues = [i for i in key_props.get('issues', []) if i['severity'] == 'CRÍTICO']
            high_issues = [i for i in key_props.get('issues', []) if i['severity'] == 'ALTO']
            
            score -= len(critical_issues) * 30
            score -= len(high_issues) * 15
            
            # Puntuación por exponente
            if key_props.get('exponent') == 65537:
                score += 25
            elif key_props.get('exponent') in [3, 5, 17]:
                score += 5
                issues.append('Exponente público débil')
            
            # Bonus por seguridad general
            if key_props.get('secure'):
                score += 25
            
            score = max(0, min(100, score))
            
            for issue in key_props.get('issues', []):
                issues.append(f"{issue['type']}: {issue['detail']}")
            
            return {
                'score': score,
                'key_properties': key_props,
                'issues': issues,
                'bit_length': key_props.get('bit_length'),
                'exponent': key_props.get('exponent')
            }
            
        except Exception as e:
            return {'error': str(e)}