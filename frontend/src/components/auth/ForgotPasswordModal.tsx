import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useForgotPassword } from '../../hooks/useUser';
import { ru } from '../../locales/ru';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    forgotPasswordMutation.mutate({ email: email.trim() }, {
      onSuccess: () => {
        setEmail('');
        onClose();
      }
    });
  };

  const handleClose = () => {
    if (!forgotPasswordMutation.isPending) {
      setEmail('');
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    {ru.auth.passwordRecovery}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={forgotPasswordMutation.isPending}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {ru.auth.passwordRecoveryDescription}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {ru.auth.emailAddress}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={ru.auth.enterYourEmail}
                      disabled={forgotPasswordMutation.isPending}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={forgotPasswordMutation.isPending}
                      className="btn-secondary"
                    >
                      {ru.auth.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={!email.trim() || forgotPasswordMutation.isPending}
                      className="btn-primary"
                    >
                      {forgotPasswordMutation.isPending ? ru.auth.sending : ru.auth.send}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ForgotPasswordModal;
