from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Workspace, WorkspaceMember

User = get_user_model()


class WorkspaceModelTest(TestCase):
    """Tests for workspace models"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_workspace(self):
        """Test creating a workspace"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            description='A test workspace',
            created_by=self.user
        )

        self.assertEqual(workspace.name, 'Test Workspace')
        self.assertEqual(workspace.created_by, self.user)
        self.assertTrue(
            WorkspaceMember.objects.filter(
                workspace=workspace,
                user=self.user,
                role='admin'
            ).exists()
        )

    def test_workspace_str(self):
        """Test workspace string representation"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

        self.assertEqual(str(workspace), 'Test Workspace')

    def test_workspace_member_str(self):
        """Test workspace member string representation"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )
        member = WorkspaceMember.objects.get(workspace=workspace, user=self.user)

        expected_str = f'{self.user.email} - Test Workspace (admin)'
        self.assertEqual(str(member), expected_str)


class WorkspaceAPITest(APITestCase):
    """Tests for workspace API"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            first_name='Other',
            last_name='User'
        )

    def test_create_workspace_success(self):
        """Test creating workspace successfully"""
        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-list')
        payload = {
            'name': 'Test Workspace',
            'description': 'A test workspace'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        workspace = Workspace.objects.get(id=res.data['id'])
        self.assertEqual(workspace.name, payload['name'])
        self.assertEqual(workspace.created_by, self.user)

    def test_create_workspace_unauthenticated(self):
        """Test that authentication is required for creating workspace"""
        url = reverse('workspace-list')
        payload = {'name': 'Test Workspace'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_user_workspaces(self):
        """Test listing workspaces for authenticated user"""
        workspace1 = Workspace.objects.create(
            name='Workspace 1',
            created_by=self.user
        )
        workspace2 = Workspace.objects.create(
            name='Workspace 2',
            created_by=self.other_user
        )
        # Add user to second workspace as member
        WorkspaceMember.objects.create(
            workspace=workspace2,
            user=self.user,
            role='member'
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        workspace_names = [w['name'] for w in res.data]
        self.assertIn('Workspace 1', workspace_names)
        self.assertIn('Workspace 2', workspace_names)

    def test_retrieve_workspace_success(self):
        """Test retrieving workspace details"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-detail', args=[workspace.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], workspace.name)

    def test_update_workspace_as_admin(self):
        """Test updating workspace as admin"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-detail', args=[workspace.id])
        payload = {'name': 'Updated Workspace'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        workspace.refresh_from_db()
        self.assertEqual(workspace.name, payload['name'])

    def test_update_workspace_as_member_fails(self):
        """Test that regular members cannot update workspace"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.other_user
        )
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.user,
            role='member'
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-detail', args=[workspace.id])
        payload = {'name': 'Updated Workspace'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_workspace_as_admin(self):
        """Test deleting workspace as admin"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-detail', args=[workspace.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Workspace.objects.filter(id=workspace.id).exists()
        )

    def test_invite_user_to_workspace(self):
        """Test inviting user to workspace"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspace-invite-user', args=[workspace.id])
        payload = {
            'email': self.other_user.email,
            'role': 'member'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            WorkspaceMember.objects.filter(
                workspace=workspace,
                user=self.other_user,
                role='member'
            ).exists()
        )

    def test_remove_member_from_workspace(self):
        """Test removing member from workspace"""
        workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )
        member = WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.other_user,
            role='member'
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('workspacemember-detail', args=[member.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            WorkspaceMember.objects.filter(id=member.id).exists()
        )
