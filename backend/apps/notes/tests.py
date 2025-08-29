from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from backend.apps.workspaces.models import Workspace
from .models import Page, Tag, Comment
from .serializers import PageSerializer, TagSerializer, CommentSerializer

User = get_user_model()


class NoteModelTest(TestCase):
    """Tests for note models"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

    def test_create_note(self):
        """Test creating a note"""
        note = Note.objects.create(
            title='Test Note',
            content='This is test content',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(note.title, 'Test Note')
        self.assertEqual(note.workspace, self.workspace)
        self.assertEqual(note.created_by, self.user)

    def test_note_str(self):
        """Test note string representation"""
        note = Note.objects.create(
            title='Test Note',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(str(note), 'Test Note')

    def test_create_tag(self):
        """Test creating a tag"""
        tag = Tag.objects.create(name='important')

        self.assertEqual(tag.name, 'important')
        self.assertEqual(str(tag), 'important')

    def test_create_category(self):
        """Test creating a category"""
        category = Category.objects.create(
            name='Work',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(category.name, 'Work')
        self.assertEqual(str(category), 'Work')

    def test_note_with_tags_and_category(self):
        """Test creating note with tags and category"""
        tag1 = Tag.objects.create(name='urgent')
        tag2 = Tag.objects.create(name='meeting')
        category = Category.objects.create(
            name='Work',
            workspace=self.workspace,
            created_by=self.user
        )

        note = Note.objects.create(
            title='Test Note',
            content='Content',
            workspace=self.workspace,
            created_by=self.user,
            category=category
        )
        note.tags.add(tag1, tag2)

        self.assertEqual(note.category, category)
        self.assertEqual(note.tags.count(), 2)
        self.assertIn(tag1, note.tags.all())
        self.assertIn(tag2, note.tags.all())


class NoteAPITest(APITestCase):
    """Tests for note API"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

    def test_create_note_success(self):
        """Test creating note successfully"""
        self.client.force_authenticate(user=self.user)
        url = reverse('note-list')
        payload = {
            'title': 'Test Note',
            'content': 'This is test content',
            'workspace': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        note = Note.objects.get(id=res.data['id'])
        self.assertEqual(note.title, payload['title'])
        self.assertEqual(note.created_by, self.user)

    def test_create_note_unauthenticated(self):
        """Test that authentication is required for creating note"""
        url = reverse('note-list')
        payload = {'title': 'Test Note', 'workspace': str(self.workspace.id)}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_workspace_notes(self):
        """Test listing notes in workspace"""
        Note.objects.create(
            title='Note 1',
            workspace=self.workspace,
            created_by=self.user
        )
        Note.objects.create(
            title='Note 2',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = f"{reverse('note-list')}?workspace={self.workspace.id}"
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)

    def test_retrieve_note_success(self):
        """Test retrieving note details"""
        note = Note.objects.create(
            title='Test Note',
            content='Test content',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('note-detail', args=[note.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], note.title)
        self.assertEqual(res.data['content'], note.content)

    def test_update_note_success(self):
        """Test updating note"""
        note = Note.objects.create(
            title='Test Note',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('note-detail', args=[note.id])
        payload = {'title': 'Updated Note'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.title, payload['title'])

    def test_delete_note_success(self):
        """Test deleting note"""
        note = Note.objects.create(
            title='Test Note',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('note-detail', args=[note.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Note.objects.filter(id=note.id).exists()
        )

    def test_note_permissions(self):
        """Test that users can only access notes in their workspaces"""
        # Create workspace for other user
        other_workspace = Workspace.objects.create(
            name='Other Workspace',
            created_by=self.other_user
        )
        note = Note.objects.create(
            title='Private Note',
            workspace=other_workspace,
            created_by=self.other_user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('note-detail', args=[note.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_comment_on_note(self):
        """Test creating comment on note"""
        note = Note.objects.create(
            title='Test Note',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('comment-list')
        payload = {
            'content': 'This is a comment',
            'note': str(note.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment = Comment.objects.get(id=res.data['id'])
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.note, note)
        self.assertEqual(comment.created_by, self.user)

    def test_note_version_creation(self):
        """Test that note versions are created on update"""
        note = Note.objects.create(
            title='Original Title',
            content='Original Content',
            workspace=self.workspace,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('note-detail', args=[note.id])
        payload = {
            'title': 'Updated Title',
            'content': 'Updated Content'
        }
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        # Check that a version was created
        versions = NoteVersion.objects.filter(note=note)
        self.assertEqual(versions.count(), 1)
        
        version = versions.first()
        self.assertEqual(version.title, 'Original Title')
        self.assertEqual(version.content, 'Original Content')
