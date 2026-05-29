import io
from unittest.mock import MagicMock

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from apps.users.models import User
from apps.categories.models import Category
from apps.products.models import Product, ProductImage


def _make_image(name="test.jpg", size=(1, 1)):
    img = Image.new("RGB", size, color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/jpeg")


class ProductCreateTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="seller", password="pass123")
        self.category = Category.objects.create(name="电子", sort_order=0)
        self.valid_data = {
            "title": "iPhone 15",
            "description": "九成新",
            "price": "2999.00",
            "category": self.category.id,
            "contact_info": "微信: seller",
        }

    def test_create_success(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/products/", self.valid_data)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["code"], 201)
        self.assertEqual(resp.data["message"], "发布成功")
        self.assertEqual(resp.data["data"]["title"], "iPhone 15")
        self.assertEqual(resp.data["data"]["status"], "pending")

    def test_create_with_images(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "uploaded_images": [_make_image(), _make_image()]}
        resp = self.client.post("/api/products/", data, format="multipart")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(len(resp.data["data"]["images"]), 2)

    def test_missing_required_field_returns_400(self):
        self.client.force_authenticate(user=self.user)
        for field in ["title", "description", "price", "category", "contact_info"]:
            data = {k: v for k, v in self.valid_data.items() if k != field}
            resp = self.client.post("/api/products/", data)
            self.assertEqual(resp.status_code, 400, f"missing {field} should return 400")

    def test_negative_price_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "price": "-10.00"}
        resp = self.client.post("/api/products/", data)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("正数", resp.data["message"])

    def test_zero_price_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "price": "0.00"}
        resp = self.client.post("/api/products/", data)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("正数", resp.data["message"])

    def test_more_than_3_images_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {
            **self.valid_data,
            "uploaded_images": [_make_image(f"img{i}.jpg") for i in range(4)],
        }
        resp = self.client.post("/api/products/", data, format="multipart")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("3", resp.data["message"])

    def test_unauthenticated_returns_401(self):
        resp = self.client.post("/api/products/", self.valid_data)
        self.assertEqual(resp.status_code, 401)

    def test_invalid_category_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "category": 999}
        resp = self.client.post("/api/products/", data)
        self.assertEqual(resp.status_code, 400)

    def test_empty_title_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "title": "   "}
        resp = self.client.post("/api/products/", data)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("标题", resp.data["message"])

    def test_empty_description_returns_400(self):
        self.client.force_authenticate(user=self.user)
        data = {**self.valid_data, "description": "   "}
        resp = self.client.post("/api/products/", data)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("描述", resp.data["message"])


class ProductEditTest(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="seller", password="pass123")
        self.other = User.objects.create_user(username="other", password="pass123")
        self.category = Category.objects.create(name="电子", sort_order=0)
        self.product = Product.objects.create(
            title="iPhone",
            description="旧手机",
            price="1000.00",
            category=self.category,
            seller=self.seller,
            contact_info="微信: seller",
            status="pending",
        )

    def test_edit_success(self):
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "iPhone 15", "price": "2000.00"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["data"]["title"], "iPhone 15")
        self.assertEqual(resp.data["data"]["status"], "pending")

    def test_edit_resets_status_to_pending(self):
        self.product.status = "rejected"
        self.product.save()
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "Updated"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["data"]["status"], "pending")

    def test_edit_active_product_returns_400(self):
        self.product.status = "active"
        self.product.save()
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "Updated"},
        )
        self.assertEqual(resp.status_code, 400)

    def test_edit_non_owner_returns_403(self):
        self.client.force_authenticate(user=self.other)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "Hacked"},
        )
        self.assertEqual(resp.status_code, 403)

    def test_edit_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put("/api/products/999/", {"title": "X"})
        self.assertEqual(resp.status_code, 404)

    def test_edit_with_new_images(self):
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "With Image", "uploaded_images": [_make_image()]},
            format="multipart",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["data"]["images"]), 1)

    def test_edit_keep_existing_images(self):
        ProductImage.objects.create(product=self.product, image=_make_image("keep.jpg"))
        self.client.force_authenticate(user=self.seller)
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "Keep Image", "keep_image_ids": str(self.product.images.first().id)},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["data"]["images"]), 1)

    def test_edit_unauthenticated_returns_401(self):
        resp = self.client.put(
            f"/api/products/{self.product.id}/",
            {"title": "X"},
        )
        self.assertEqual(resp.status_code, 401)


class ProductDeleteTest(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="seller", password="pass123")
        self.other = User.objects.create_user(username="other", password="pass123")
        self.category = Category.objects.create(name="电子", sort_order=0)
        self.product = Product.objects.create(
            title="iPhone",
            description="旧手机",
            price="1000.00",
            category=self.category,
            seller=self.seller,
            contact_info="微信: seller",
            status="active",
        )

    def test_delete_success(self):
        self.client.force_authenticate(user=self.seller)
        resp = self.client.delete(f"/api/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "offline")

    def test_delete_non_owner_returns_403(self):
        self.client.force_authenticate(user=self.other)
        resp = self.client.delete(f"/api/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 403)

    def test_delete_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.seller)
        resp = self.client.delete("/api/products/999/")
        self.assertEqual(resp.status_code, 404)

    def test_delete_unauthenticated_returns_401(self):
        resp = self.client.delete(f"/api/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 401)

    def test_delete_with_appointment_returns_400(self):
        self.client.force_authenticate(user=self.seller)
        mock_appt = MagicMock()
        mock_qs = MagicMock()
        mock_qs.exists.return_value = True
        mock_appt.objects.filter.return_value = mock_qs
        mock_models = MagicMock()
        mock_models.Appointment = mock_appt
        import sys
        sys.modules["apps.appointments"] = MagicMock()
        sys.modules["apps.appointments.models"] = mock_models
        try:
            resp = self.client.delete(f"/api/products/{self.product.id}/")
        finally:
            sys.modules.pop("apps.appointments", None)
            sys.modules.pop("apps.appointments.models", None)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("预约", resp.data["message"])
        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "active")
