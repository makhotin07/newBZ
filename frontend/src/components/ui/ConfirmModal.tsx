import React from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Подтверждение',
  message = 'Вы уверены?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
}) => {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">{title}</Dialog.Title>
                {!!message && <div className="mt-2 text-sm text-gray-600">{message}</div>}
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    {cancelText}
                  </button>
                  <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;


