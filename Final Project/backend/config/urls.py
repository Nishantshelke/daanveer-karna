from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.http import HttpResponse
from django.urls import include, path

from platforms.sitemaps import PlatformSitemap


def robots_txt(_request):
    return HttpResponse(
        f"User-agent: *\nAllow: /\nSitemap: {settings.SITE_URL}/sitemap.xml\n",
        content_type="text/plain",
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("platforms.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("sitemap.xml", sitemap, {"sitemaps": {"platforms": PlatformSitemap}}, name="sitemap"),
    path("robots.txt", robots_txt),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
