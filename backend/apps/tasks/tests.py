from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from backend.apps.workspaces.models import Workspace
from .models import TaskBoard, Task, TaskComment
from .serializers import TaskBoardSerializer, TaskSerializer, TaskCommentSerializer

User = get_user_model()


class TaskModelTest(TestCase):
    """Tests for task models"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

    def test_create_task_board(self):
        """Test creating a task board"""
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(board.name, 'Test Board')
        self.assertEqual(board.workspace, self.workspace)
        self.assertEqual(board.created_by, self.user)

    def test_task_board_str(self):
        """Test task board string representation"""
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(str(board), 'Test Board')

    def test_create_task_status(self):
        """Test creating a task status"""
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        status = TaskStatus.objects.create(
            name='In Progress',
            board=board,
            order=1
        )

        self.assertEqual(status.name, 'In Progress')
        self.assertEqual(status.board, board)
        self.assertEqual(status.order, 1)

    def test_create_task(self):
        """Test creating a task"""
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        status = TaskStatus.objects.create(
            name='To Do',
            board=board,
            order=0
        )
        task = Task.objects.create(
            title='Test Task',
            description='Task description',
            board=board,
            status=status,
            created_by=self.user,
            priority='medium'
        )

        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.board, board)
        self.assertEqual(task.status, status)
        self.assertEqual(task.priority, 'medium')

    def test_task_str(self):
        """Test task string representation"""
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        status = TaskStatus.objects.create(
            name='To Do',
            board=board,
            order=0
        )
        task = Task.objects.create(
            title='Test Task',
            board=board,
            status=status,
            created_by=self.user
        )

        self.assertEqual(str(task), 'Test Task')


class TaskAPITest(APITestCase):
    """Tests for task API"""

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
        self.board = TaskBoard.objects.create(
            name='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        self.status = TaskStatus.objects.create(
            name='To Do',
            board=self.board,
            order=0
        )

    def test_create_task_board_success(self):
        """Test creating task board successfully"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        payload = {
            'name': 'New Board',
            'description': 'Board description',
            'workspace': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        board = TaskBoard.objects.get(id=res.data['id'])
        self.assertEqual(board.name, payload['name'])
        self.assertEqual(board.created_by, self.user)

    def test_create_task_success(self):
        """Test creating task successfully"""
        self.client.force_authenticate(user=self.user)
        url = reverse('task-list')
        payload = {
            'title': 'New Task',
            'description': 'Task description',
            'board': str(self.board.id),
            'status': str(self.status.id),
            'priority': 'high'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=res.data['id'])
        self.assertEqual(task.title, payload['title'])
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.priority, 'high')

    def test_list_board_tasks(self):
        """Test listing tasks in board"""
        Task.objects.create(
            title='Task 1',
            board=self.board,
            status=self.status,
            created_by=self.user
        )
        Task.objects.create(
            title='Task 2',
            board=self.board,
            status=self.status,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = f"{reverse('task-list')}?board={self.board.id}"
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)

    def test_update_task_status(self):
        """Test updating task status"""
        new_status = TaskStatus.objects.create(
            name='In Progress',
            board=self.board,
            order=1
        )
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            status=self.status,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        payload = {'status': str(new_status.id)}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, new_status)

    def test_assign_task_to_user(self):
        """Test assigning task to user"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            status=self.status,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('task-assign', args=[task.id])
        payload = {'assigned_to': str(self.other_user.id)}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.assigned_to, self.other_user)

    def test_create_task_status(self):
        """Test creating task status"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskstatus-list')
        payload = {
            'name': 'Done',
            'board': str(self.board.id),
            'order': 2,
            'color': '#28a745'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task_status = TaskStatus.objects.get(id=res.data['id'])
        self.assertEqual(task_status.name, payload['name'])
        self.assertEqual(task_status.board, self.board)

    def test_task_permissions(self):
        """Test that users can only access tasks in their workspaces"""
        other_workspace = Workspace.objects.create(
            name='Other Workspace',
            created_by=self.other_user
        )
        other_board = TaskBoard.objects.create(
            name='Other Board',
            workspace=other_workspace,
            created_by=self.other_user
        )
        other_status = TaskStatus.objects.create(
            name='To Do',
            board=other_board,
            order=0
        )
        task = Task.objects.create(
            title='Private Task',
            board=other_board,
            status=other_status,
            created_by=self.other_user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_task(self):
        """Test deleting task"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            status=self.status,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Task.objects.filter(id=task.id).exists()
        )

    def test_task_board_with_default_statuses(self):
        """Test that creating a board creates default statuses"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        payload = {
            'name': 'New Board',
            'workspace': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        board = TaskBoard.objects.get(id=res.data['id'])
        
        # Should have default statuses created
        statuses = TaskStatus.objects.filter(board=board)
        self.assertGreaterEqual(statuses.count(), 3)  # At least To Do, In Progress, Done
        
        status_names = [s.name for s in statuses]
        self.assertIn('To Do', status_names)
        self.assertIn('In Progress', status_names)
        self.assertIn('Done', status_names)
