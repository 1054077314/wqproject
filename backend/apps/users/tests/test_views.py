from datetime import timedelta

from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import Token, User


class RegisterViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/register"

    def test_register_success(self):
        resp = self.client.post(self.url, {"username": "testuser", "password": "123456"})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["code"], 201)
        self.assertIn("user_id", resp.data["data"])
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_register_duplicate_username(self):
        User.objects.create_user(username="existing", password="123456")
        resp = self.client.post(self.url, {"username": "existing", "password": "123456"})
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data["code"], 400)

    def test_register_username_too_short(self):
        resp = self.client.post(self.url, {"username": "ab", "password": "123456"})
        self.assertEqual(resp.status_code, 400)

    def test_register_username_too_long(self):
        resp = self.client.post(self.url, {"username": "a" * 51, "password": "123456"})
        self.assertEqual(resp.status_code, 400)

    def test_register_password_too_short(self):
        resp = self.client.post(self.url, {"username": "testuser", "password": "12345"})
        self.assertEqual(resp.status_code, 400)


class LoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/login"
        self.user = User.objects.create_user(username="testuser", password="123456")

    def test_login_success(self):
        resp = self.client.post(self.url, {"username": "testuser", "password": "123456"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"], 200)
        self.assertIn("token", resp.data["data"])
        self.assertEqual(resp.data["data"]["user"]["username"], "testuser")
        self.assertTrue(Token.objects.filter(key=resp.data["data"]["token"]).exists())

    def test_login_wrong_password(self):
        resp = self.client.post(self.url, {"username": "testuser", "password": "wrong"})
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.data["code"], 401)

    def test_login_disabled_user(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post(self.url, {"username": "testuser", "password": "123456"})
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.data["code"], 403)


class ProfileViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/profile"
        self.user = User.objects.create_user(username="testuser", password="123456")
        self.token = Token.objects.create(user=self.user)

    def test_profile_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"], 200)
        self.assertEqual(resp.data["data"]["username"], "testuser")

    def test_profile_no_token(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 401)

    def test_profile_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalidtoken123")
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 401)

    def test_profile_expired_token(self):
        self.token.expires_at = self.token.expires_at - timedelta(days=8)
        self.token.save()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 401)
