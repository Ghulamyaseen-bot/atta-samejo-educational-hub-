/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Pakistani Phone Number Validation & Formatting Utility
 *
 * Rules:
 * - Accept Pakistani mobile numbers in either:
 *   1) +92XXXXXXXXXX format (must start with +92, followed by 10 digits e.g. 3001234567, total 13 chars)
 *      OR
 *   2) 03XXXXXXXXX format (must start with 03, exactly 11 digits)
 * - Clear validation messages
 * - Clean normalization helper
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string; // Standardized to +923XXXXXXXXX
  display?: string;    // Human readable e.g. +92 300 1234567
}

export function validatePakistaniPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'Mobile number is required.',
    };
  }

  const raw = input.trim();

  // Case 1: Starts with +92
  if (raw.startsWith('+92')) {
    const afterPrefix = raw.slice(3).replace(/[\s\-]/g, '');
    
    // Digits only
    if (!/^\d+$/.test(afterPrefix)) {
      return {
        isValid: false,
        error: 'Invalid format. When using +92, only digits are allowed after +92 (e.g. +923001234567).',
      };
    }

    if (afterPrefix.length !== 10) {
      return {
        isValid: false,
        error: `Invalid length: +92 format requires exactly 10 digits after +92 (found ${afterPrefix.length} digits). Example: +923001234567`,
      };
    }

    // Pakistani mobile network codes typically start with 3 (e.g. 300, 301, 312, 321, 333, 345, etc.)
    if (!afterPrefix.startsWith('3')) {
      return {
        isValid: false,
        error: 'Invalid mobile code: Pakistani mobile numbers must start with 3 (e.g. +923001234567).',
      };
    }

    const normalized = `+92${afterPrefix}`;
    const display = `+92 ${afterPrefix.slice(0, 3)} ${afterPrefix.slice(3)}`;
    return {
      isValid: true,
      normalized,
      display,
    };
  }

  // Case 2: Starts with 03
  const cleanedLocal = raw.replace(/[\s\-]/g, '');
  if (cleanedLocal.startsWith('03')) {
    if (!/^\d+$/.test(cleanedLocal)) {
      return {
        isValid: false,
        error: 'Invalid format. Local Pakistani mobile number must contain digits only (e.g. 03001234567).',
      };
    }

    if (cleanedLocal.length !== 11) {
      return {
        isValid: false,
        error: `Invalid length: Local Pakistani mobile numbers starting with 03 must contain exactly 11 digits (found ${cleanedLocal.length} digits). Example: 03001234567`,
      };
    }

    const after0 = cleanedLocal.slice(1); // 3XXXXXXXXX
    const normalized = `+92${after0}`;
    const display = `${cleanedLocal.slice(0, 4)} ${cleanedLocal.slice(4)}`;
    return {
      isValid: true,
      normalized,
      display,
    };
  }

  // Neither +92 nor 03
  return {
    isValid: false,
    error: 'Please enter a valid Pakistani mobile number in +92XXXXXXXXXX or 03XXXXXXXXX format (e.g. +923001234567 or 03001234567).',
  };
}
