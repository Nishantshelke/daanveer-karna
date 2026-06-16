from django.urls import reverse
from rest_framework.test import APITestCase

from analytics.models import ClickLog

from .models import Category, Platform, Tag


class PlatformApiTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Documentaries", slug="documentaries")
        tag = Tag.objects.create(name="Featured", slug="featured")
        self.platform = Platform.objects.create(
            name="Example Platform",
            slug="example-platform",
            description="A database-driven destination.",
            destination_url="https://example.com/watch",
            category=category,
        )
        self.platform.tags.add(tag)

    def test_active_platform_is_listed(self):
        response = self.client.get(reverse("platform-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"][0]["slug"], self.platform.slug)

    def test_redirect_records_click_and_redirects(self):
        response = self.client.get(
            reverse("platform-redirect", kwargs={"slug": self.platform.slug}),
            HTTP_USER_AGENT="StreamHub test",
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, self.platform.destination_url)
        self.assertEqual(ClickLog.objects.count(), 1)

    def test_inactive_platform_cannot_redirect(self):
        self.platform.is_active = False
        self.platform.save()
        response = self.client.get(reverse("platform-redirect", kwargs={"slug": self.platform.slug}))
        self.assertEqual(response.status_code, 404)

    def test_analytics_requires_staff(self):
        response = self.client.get(reverse("analytics-dashboard"))
        self.assertIn(response.status_code, (401, 403))
