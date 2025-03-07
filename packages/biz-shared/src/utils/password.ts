const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

// 验证密码强度
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `密码长度至少${MIN_PASSWORD_LENGTH}位`,
    };
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return {
      isValid: false,
      error: '密码必须包含大小写字母、数字和特殊字符',
    };
  }

  return { isValid: true };
}
