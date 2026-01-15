// Auth feature barrel export

// Components
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { UserMenu } from './components/UserMenu';
export { SessionExpiredHandler } from './components/SessionExpiredHandler';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { ResetPasswordForm } from './components/ResetPasswordForm';
export { AuthGuard } from './components/AuthGuard';

// Pages
export { RegisterPage } from './pages/RegisterPage';
export { LoginPage } from './pages/LoginPage';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { ResetPasswordPage } from './pages/ResetPasswordPage';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';
export { useLogin } from './hooks/useLogin';
export { useSession } from './hooks/useSession';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useResetPassword } from './hooks/useResetPassword';

// Services
export { authService } from './services/authService';
export type { ServiceResponse } from './services/authService';

// Schemas
export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schemas/authSchemas';
export type {
  RegisterFormData,
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from './schemas/authSchemas';

// Types
export * from './types';
