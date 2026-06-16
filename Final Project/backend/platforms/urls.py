from django.urls import path

from .views import CategoryListView, PlatformDetailView, PlatformListView, PlatformRedirectView, TagListView

urlpatterns = [
    path("platforms/", PlatformListView.as_view(), name="platform-list"),
    path("platforms/<slug:slug>/", PlatformDetailView.as_view(), name="platform-detail"),
    path("platforms/<slug:slug>/redirect/", PlatformRedirectView.as_view(), name="platform-redirect"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("tags/", TagListView.as_view(), name="tag-list"),
]
