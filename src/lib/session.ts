const KEY = 'lastEmail';

export function rememberEmail(email: string) {
  localStorage.setItem(KEY, email);
}

export function getRememberedEmail(): string | null {
  return localStorage.getItem(KEY);
}

export function forgetEmail() {
  localStorage.removeItem(KEY);
}
