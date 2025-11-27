"""
Herramientas de criptoanálisis: análisis de frecuencia y fuerza bruta
"""

import string
from collections import Counter
import matplotlib
matplotlib.use('Agg')  # Backend sin GUI
import matplotlib.pyplot as plt
import io
import base64

class FrequencyAnalysis:
    """Análisis de frecuencia de caracteres en texto cifrado"""
    
    # Frecuencias esperadas en español (%)
    SPANISH_FREQ = {
        'E': 13.68, 'A': 12.53, 'O': 8.68, 'S': 7.98, 'R': 6.87,
        'N': 6.71, 'I': 6.25, 'D': 5.86, 'L': 4.97, 'C': 4.68,
        'T': 4.63, 'U': 3.93, 'M': 3.15, 'P': 2.51, 'B': 2.22,
        'G': 1.01, 'V': 0.90, 'Y': 0.90, 'Q': 0.88, 'H': 0.70,
        'F': 0.69, 'Z': 0.52, 'J': 0.44, 'Ñ': 0.31, 'X': 0.22,
        'W': 0.02, 'K': 0.01
    }
    
    @staticmethod
    def analyze(text):
        """Analiza la frecuencia de letras en el texto"""
        # Limpiar texto (solo letras)
        clean_text = ''.join(c.upper() for c in text if c.isalpha())
        
        if not clean_text:
            return {}
        
        # Contar frecuencias
        total_letters = len(clean_text)
        letter_count = Counter(clean_text)
        
        # Calcular porcentajes
        frequencies = {}
        for letter in string.ascii_uppercase:
            count = letter_count.get(letter, 0)
            frequencies[letter] = (count / total_letters) * 100 if total_letters > 0 else 0
        
        return frequencies
    
    @staticmethod
    def calculate_chi_squared(frequencies):
        """Calcula el chi-cuadrado para comparar con español estándar"""
        chi_squared = 0
        
        for letter in string.ascii_uppercase:
            if letter == 'Ñ':
                continue
            
            observed = frequencies.get(letter, 0)
            expected = FrequencyAnalysis.SPANISH_FREQ.get(letter, 0)
            
            if expected > 0:
                chi_squared += ((observed - expected) ** 2) / expected
        
        return chi_squared
    
    @staticmethod
    def generate_frequency_chart(frequencies):
        """Genera un gráfico de barras de frecuencias"""
        letters = sorted(frequencies.keys())
        values = [frequencies[letter] for letter in letters]
        expected = [FrequencyAnalysis.SPANISH_FREQ.get(letter, 0) for letter in letters]
        
        plt.figure(figsize=(12, 6))
        x = range(len(letters))
        width = 0.35
        
        plt.bar([i - width/2 for i in x], values, width, label='Texto analizado', alpha=0.8)
        plt.bar([i + width/2 for i in x], expected, width, label='Español estándar', alpha=0.8)
        
        plt.xlabel('Letras')
        plt.ylabel('Frecuencia (%)')
        plt.title('Análisis de Frecuencia de Letras')
        plt.xticks(x, letters)
        plt.legend()
        plt.grid(axis='y', alpha=0.3)
        
        # Convertir a base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return image_base64
    

class BruteForce:
    """Ataques de fuerza bruta a cifrados clásicos"""
    
    @staticmethod
    def caesar_attack(ciphertext):
        """Ataque de fuerza bruta a César (26 posibilidades)"""
        from modules.classic_ciphers import CaesarCipher
        
        results = []
        for shift in range(26):
            decrypted = CaesarCipher.decrypt(ciphertext, shift)
            frequencies = FrequencyAnalysis.analyze(decrypted)
            chi_squared = FrequencyAnalysis.calculate_chi_squared(frequencies)
            
            results.append({
                'shift': shift,
                'text': decrypted,
                'chi_squared': chi_squared,
                'preview': decrypted[:100] + ('...' if len(decrypted) > 100 else '')
            })
        
        # Ordenar por chi-cuadrado
        results.sort(key=lambda x: x['chi_squared'])
        
        return results
    
    @staticmethod
    def vigenere_key_length(ciphertext, max_length=20):
        """Estima la longitud de la clave Vigenère usando el Índice de Coincidencia"""
        ciphertext = ''.join(c.upper() for c in ciphertext if c.isalpha())
        
        if len(ciphertext) < 50:
            return []
        
        ic_values = []
        
        for key_length in range(1, min(max_length + 1, len(ciphertext) // 2)):
            # Dividir texto en grupos según longitud de clave
            groups = [''] * key_length
            for i, char in enumerate(ciphertext):
                groups[i % key_length] += char
            
            # Calcular IC promedio
            total_ic = 0
            for group in groups:
                ic = BruteForce._calculate_ic(group)
                total_ic += ic
            
            avg_ic = total_ic / key_length if key_length > 0 else 0
            ic_values.append({
                'length': key_length,
                'ic': avg_ic
            })
        
        # Ordenar por IC más alto (cercano a 0.065 para español)
        ic_values.sort(key=lambda x: abs(x['ic'] - 0.065))
        
        return ic_values[:5]
    
    @staticmethod
    def _calculate_ic(text):
        """Calcula el Índice de Coincidencia de un texto"""
        if len(text) <= 1:
            return 0
        
        frequencies = Counter(text)
        n = len(text)
        
        ic = sum(f * (f - 1) for f in frequencies.values()) / (n * (n - 1))
        
        return ic
    
    @staticmethod
    def estimate_vigenere_key(ciphertext, key_length):
        """Estima la clave Vigenère usando análisis de frecuencia"""
        from modules.classic_ciphers import CaesarCipher
        
        ciphertext = ''.join(c.upper() for c in ciphertext if c.isalpha())
        
        if len(ciphertext) < key_length:
            return ""
        
        estimated_key = ""
        
        for i in range(key_length):
            # Extraer cada n-ésima letra
            group = ''.join(ciphertext[j] for j in range(i, len(ciphertext), key_length))
            
            # Probar cada posible letra de clave
            best_shift = 0
            best_chi = float('inf')
            
            for shift in range(26):
                decrypted = CaesarCipher.decrypt(group, shift)
                frequencies = FrequencyAnalysis.analyze(decrypted)
                chi_squared = FrequencyAnalysis.calculate_chi_squared(frequencies)
                
                if chi_squared < best_chi:
                    best_chi = chi_squared
                    best_shift = shift
            
            estimated_key += chr(65 + best_shift)
        
        return estimated_key