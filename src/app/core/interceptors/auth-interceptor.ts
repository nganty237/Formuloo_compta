import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Using a fallback token for demo/development; in production, this would be retrieved from secure storage
  let token = 'guest-token';
  
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const storedUser = sessionStorage.getItem('formuloo_user');
    if (storedUser) {
      // Mocking JWT extraction from user session for demo purposes
      token = 'valid-session-jwt-token'; 
    }
  }
  
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  
  return next(authReq);
};
