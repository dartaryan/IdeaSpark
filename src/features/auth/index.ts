// Auth feature barrel export

// Components
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { UserMenu } from './components/UserMenu';
export { SessionExpiredHandler } from './components/SessionExpiredHandler';

// Pages
export { RegisterPage } from './pages/RegisterPage';
export { LoginPage } from './pages/LoginPage';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';
export { useLogin } from './hooks/useLogin';
export { useSession } from './hooks/useSession';

// Services
export { authService } from './services/authService';
export type { ServiceResponse } from './services/authService';

// Schemas
export { registerSchema, loginSchema } from './schemas/authSchemas';
export type { RegisterFormData, LoginFormData } from './schemas/authSchemas';

// Types
export * from './types';
