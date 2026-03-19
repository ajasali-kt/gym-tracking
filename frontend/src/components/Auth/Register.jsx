import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Register Component
 * Handles user registration
 */
function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name] || errors.submit) {
      setErrors({
        ...errors,
        [e.target.name]: '',
        submit: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    const result = await register(formData.username, formData.password);

    if (result.success) {
      navigate('/', { replace: true });
      return;
    }

    setErrors({ submit: result.error });
    setLoading(false);
  };

  const errorInputClasses = 'border-red-500/60 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]';

  return (
    <div className="min-h-screen bg-app px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <div className="w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10h2m12 0h2M7 7v6m10-6v6m-7-2h4m-6 7h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-app-primary">Create your account</h2>
            <p className="mt-2 text-sm text-app-muted">Start tracking your fitness journey today</p>
          </div>

          <form className="card mt-8 space-y-6 p-6 sm:p-7" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field ${errors.username ? errorInputClasses : ''}`}
                  placeholder="Choose a username"
                  disabled={loading}
                />
                {errors.username && <p className="mt-1 text-sm text-red-300">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? errorInputClasses : ''}`}
                  placeholder="Create a password"
                  disabled={loading}
                />
                {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
                {!errors.password && (
                  <p className="mt-1 text-xs text-app-muted">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? errorInputClasses : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                id="register-submit-button"
                type="submit"
                disabled={loading}
                className={`btn-primary w-full ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-app-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-300 transition-colors hover:text-blue-200">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
