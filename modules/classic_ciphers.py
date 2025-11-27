"""
Implementación de cifrados clásicos: César, Vigenère y Playfair
"""

class CaesarCipher:
    """Cifrado César con desplazamiento configurable"""
    
    @staticmethod
    def encrypt(text, shift):
        """Cifra el texto con el desplazamiento dado"""
        result = ""
        for char in text:
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                result += chr((ord(char) - ascii_offset + shift) % 26 + ascii_offset)
            else:
                result += char
        return result
    
    @staticmethod
    def decrypt(text, shift):
        """Descifra el texto con el desplazamiento dado"""
        return CaesarCipher.encrypt(text, -shift)


class VigenereCipher:
    """Cifrado Vigenère con clave variable"""
    
    @staticmethod
    def _prepare_key(text, key):
        """Prepara la clave para que coincida con el texto"""
        key = key.upper()
        extended_key = ""
        key_index = 0
        
        for char in text:
            if char.isalpha():
                extended_key += key[key_index % len(key)]
                key_index += 1
            else:
                extended_key += char
        
        return extended_key
    
    @staticmethod
    def encrypt(text, key):
        """Cifra el texto usando la clave Vigenère"""
        if not key:
            return text
        
        result = ""
        extended_key = VigenereCipher._prepare_key(text, key)
        
        for i, char in enumerate(text):
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                shift = ord(extended_key[i]) - 65
                result += chr((ord(char) - ascii_offset + shift) % 26 + ascii_offset)
            else:
                result += char
        
        return result
    
    @staticmethod
    def decrypt(text, key):
        """Descifra el texto usando la clave Vigenère"""
        if not key:
            return text
        
        result = ""
        extended_key = VigenereCipher._prepare_key(text, key)
        
        for i, char in enumerate(text):
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                shift = ord(extended_key[i]) - 65
                result += chr((ord(char) - ascii_offset - shift) % 26 + ascii_offset)
            else:
                result += char
        
        return result


class PlayfairCipher:
    """Cifrado Playfair con matriz 5x5"""
    
    @staticmethod
    def _create_matrix(key):
        """Crea la matriz Playfair 5x5"""
        key = key.upper().replace('J', 'I')
        matrix = []
        used = set()
        
        # Agregar caracteres de la clave
        for char in key:
            if char.isalpha() and char not in used:
                matrix.append(char)
                used.add(char)
        
        # Agregar resto del alfabeto
        for char in 'ABCDEFGHIKLMNOPQRSTUVWXYZ':
            if char not in used:
                matrix.append(char)
                used.add(char)
        
        # Convertir a matriz 5x5
        return [matrix[i:i+5] for i in range(0, 25, 5)]
    
    @staticmethod
    def _find_position(matrix, char):
        """Encuentra la posición de un caracter en la matriz"""
        for i, row in enumerate(matrix):
            for j, c in enumerate(row):
                if c == char:
                    return i, j
        return None, None
    
    @staticmethod
    def _prepare_text(text):
        """Prepara el texto para cifrado Playfair"""
        text = text.upper().replace('J', 'I').replace(' ', '')
        prepared = ""
        i = 0
        
        while i < len(text):
            if not text[i].isalpha():
                i += 1
                continue
            
            prepared += text[i]
            
            if i + 1 < len(text):
                next_char = text[i + 1]
                while i + 1 < len(text) and not next_char.isalpha():
                    i += 1
                    if i + 1 < len(text):
                        next_char = text[i + 1]
                
                if i + 1 < len(text) and next_char.isalpha():
                    if text[i] == next_char:
                        prepared += 'X'
                    else:
                        prepared += next_char
                        i += 1
            
            i += 1
        
        # Agregar X si la longitud es impar
        if len(prepared) % 2 != 0:
            prepared += 'X'
        
        return prepared
    
    @staticmethod
    def encrypt(text, key):
        """Cifra el texto usando Playfair"""
        if not key:
            return text
        
        matrix = PlayfairCipher._create_matrix(key)
        prepared_text = PlayfairCipher._prepare_text(text)
        result = ""
        
        for i in range(0, len(prepared_text), 2):
            row1, col1 = PlayfairCipher._find_position(matrix, prepared_text[i])
            row2, col2 = PlayfairCipher._find_position(matrix, prepared_text[i + 1])
            
            if row1 == row2:  # Misma fila
                result += matrix[row1][(col1 + 1) % 5]
                result += matrix[row2][(col2 + 1) % 5]
            elif col1 == col2:  # Misma columna
                result += matrix[(row1 + 1) % 5][col1]
                result += matrix[(row2 + 1) % 5][col2]
            else:  # Rectángulo
                result += matrix[row1][col2]
                result += matrix[row2][col1]
        
        return result
    
    @staticmethod
    def decrypt(text, key):
        """Descifra el texto usando Playfair"""
        if not key:
            return text
        
        matrix = PlayfairCipher._create_matrix(key)
        text = text.upper().replace('J', 'I').replace(' ', '')
        result = ""
        
        for i in range(0, len(text), 2):
            if i + 1 >= len(text):
                break
            
            row1, col1 = PlayfairCipher._find_position(matrix, text[i])
            row2, col2 = PlayfairCipher._find_position(matrix, text[i + 1])
            
            if row1 is None or row2 is None:
                continue
            
            if row1 == row2:  # Misma fila
                result += matrix[row1][(col1 - 1) % 5]
                result += matrix[row2][(col2 - 1) % 5]
            elif col1 == col2:  # Misma columna
                result += matrix[(row1 - 1) % 5][col1]
                result += matrix[(row2 - 1) % 5][col2]
            else:  # Rectángulo
                result += matrix[row1][col2]
                result += matrix[row2][col1]
        
        return result