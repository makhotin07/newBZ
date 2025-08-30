import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UpdateUserData, ChangePasswordData, ForgotPasswordData, ResetPasswordData } from '../../features/auth/api';
import toast from 'react-hot-toast';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userApi.getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) => userApi.updateUserProfile(data),
    onSuccess: (updatedUser) => {
      // Update user profile cache
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      
      // Also update auth context cache if it exists
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast.success('Профиль успешно обновлён!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка обновления профиля');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Пароль успешно изменён!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.old_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          'Ошибка смены пароля';
      toast.error(errorMessage);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      // Invalidate user profile to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast.success('Аватар успешно обновлён!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка загрузки аватара');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => userApi.forgotPassword(data),
    onSuccess: () => {
      toast.success('Инструкции по восстановлению пароля отправлены на ваш email!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при отправке запроса на восстановление пароля');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => userApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Пароль успешно изменён! Теперь вы можете войти с новым паролем.');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.new_password?.[0] ||
                          'Ошибка при сбросе пароля';
      toast.error(errorMessage);
    },
  });
};
