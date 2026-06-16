from django.contrib.sitemaps import Sitemap

from .models import Platform


class PlatformSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Platform.objects.filter(is_active=True)

    def location(self, item):
        return f"/platform/{item.slug}"

    def lastmod(self, item):
        return item.created_at
