import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ru } from '../../locales/ru';

const RegisterPage: React.FC = () => {
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      toast.error(ru.auth.passwordsDoNotMatch);
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      toast.success(ru.auth.accountCreatedSuccess);
    } catch (error: any) {
      toast.error(error.message || ru.auth.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {ru.auth.createAccount}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {ru.auth.alreadyHaveAccount}{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {ru.auth.signInHere}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  {ru.auth.firstName}
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={ru.auth.firstNamePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  {ru.auth.lastName}
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={ru.auth.lastNamePlaceholder}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {ru.auth.emailAddress}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={ru.auth.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {ru.auth.username}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={ru.auth.usernamePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {ru.auth.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={ru.auth.passwordPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                {ru.auth.confirmPassword}
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password_confirm}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={ru.auth.confirmPasswordPlaceholder}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? ru.auth.creatingAccount : ru.auth.createAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
