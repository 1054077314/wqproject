from unittest.mock import MagicMock
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from apps.users.models import User
from apps.categories.models import Category


class CategoryListTest(APITestCase):
    def test_list_empty(self):
        resp = self.client.get("/api/categories/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"], 200)
        self.assertEqual(resp.data["message"], "success")
        self.assertEqual(resp.data["data"], [])

    def test_list_ordered_by_sort_order(self):
        Category.objects.create(name="B类", sort_order=2)
        Category.objects.create(name="A类", sort_order=1)
        resp = self.client.get("/api/categories/")
        names = [c["name"] for c in resp.data["data"]]
        self.assertEqual(names, ["A类", "B类"])

    def test_list_returns_id_and_name_only(self):
        Category.objects.create(name="电子", sort_order=0)
        resp = self.client.get("/api/categories/")
        item = resp.data["data"][0]
        self.assertEqual(set(item.keys()), {"id", "name"})

    def test_anonymous_list_with_data(self):
        Category.objects.create(name="电子", sort_order=1)
        Category.objects.create(name="服装", sort_order=2)
        resp = self.client.get("/api/categories/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"], 200)
        self.assertEqual(resp.data["message"], "success")
        self.assertEqual(len(resp.data["data"]), 2)


class CategoryCreateTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        self.student = User.objects.create_user(
            username="student", password="student123"
        )

    def test_admin_create_success(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(
            "/api/admin/categories/", {"name": "电子", "sort_order": 1}
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["code"], 201)
        self.assertEqual(resp.data["data"]["name"], "电子")

    def test_duplicate_name_returns_409(self):
        self.client.force_authenticate(user=self.admin)
        Category.objects.create(name="电子", sort_order=0)
        resp = self.client.post(
            "/api/admin/categories/", {"name": "电子", "sort_order": 1}
        )
        self.assertEqual(resp.status_code, 409)

    def test_student_create_returns_403(self):
        self.client.force_authenticate(user=self.student)
        resp = self.client.post(
            "/api/admin/categories/", {"name": "电子", "sort_order": 1}
        )
        self.assertEqual(resp.status_code, 403)

    def test_anonymous_create_returns_401(self):
        resp = self.client.post(
            "/api/admin/categories/", {"name": "电子", "sort_order": 1}
        )
        self.assertEqual(resp.status_code, 401)


class CategoryUpdateTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        self.category = Category.objects.create(name="电子", sort_order=0)

    def test_admin_update_success(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.put(
            f"/api/admin/categories/{self.category.id}/",
            {"name": "数码产品", "sort_order": 5},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["data"]["name"], "数码产品")
        self.assertEqual(resp.data["data"]["sort_order"], 5)

    def test_update_duplicate_name_returns_409(self):
        self.client.force_authenticate(user=self.admin)
        Category.objects.create(name="服装", sort_order=1)
        resp = self.client.put(
            f"/api/admin/categories/{self.category.id}/", {"name": "服装"}
        )
        self.assertEqual(resp.status_code, 409)

    def test_update_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.put(
            "/api/admin/categories/999/", {"name": "不存在"}
        )
        self.assertEqual(resp.status_code, 404)


class CategoryDeleteTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        self.category = Category.objects.create(name="电子", sort_order=0)

    def test_admin_delete_empty_category(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.delete(f"/api/admin/categories/{self.category.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["code"], 200)
        self.assertEqual(resp.data["message"], "删除成功")
        self.assertFalse(Category.objects.filter(id=self.category.id).exists())

    def test_delete_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.delete("/api/admin/categories/999/")
        self.assertEqual(resp.status_code, 404)

    def test_delete_category_with_products_returns_400(self):
        self.client.force_authenticate(user=self.admin)
        mock_product = MagicMock()
        mock_qs = MagicMock()
        mock_qs.exists.return_value = True
        mock_product.objects.filter.return_value = mock_qs
        mock_models = MagicMock()
        mock_models.Product = mock_product
        import sys
        sys.modules["apps.products"] = MagicMock()
        sys.modules["apps.products.models"] = mock_models
        try:
            resp = self.client.delete(f"/api/admin/categories/{self.category.id}/")
        finally:
            sys.modules.pop("apps.products", None)
            sys.modules.pop("apps.products.models", None)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data["message"], "该分类下有商品，不可删除")
        self.assertTrue(Category.objects.filter(id=self.category.id).exists())

    def test_student_delete_returns_403(self):
        student = User.objects.create_user(username="stu", password="stu123")
        self.client.force_authenticate(user=student)
        resp = self.client.delete(f"/api/admin/categories/{self.category.id}/")
        self.assertEqual(resp.status_code, 403)
