import ipaddress
from urllib.parse import urlparse

from django.db.models import Count, Q
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, throttling
from rest_framework.views import APIView

from analytics.models import ClickLog

from .models import Category, Platform, Tag
from .serializers import CategorySerializer, PlatformDetailSerializer, PlatformListSerializer, TagSerializer


class PlatformListView(generics.ListAPIView):
    serializer_class = PlatformListSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name", "description", "category__name", "tags__name"]
    ordering_fields = ["created_at", "name", "click_count"]
    ordering = "-created_at"
    filterset_fields = {"category__slug": ["exact"], "tags__slug": ["exact"]}

    def get_queryset(self):
        queryset = (
            Platform.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("tags")
            .annotate(click_count=Count("clicks"))
        )
        section = self.request.query_params.get("section")
        if section == "trending":
            since = timezone.now() - timezone.timedelta(days=30)
            queryset = queryset.annotate(
                recent_clicks=Count("clicks", filter=Q(clicks__timestamp__gte=since))
            ).order_by("-recent_clicks", "-created_at")
        elif section == "recent":
            queryset = queryset.order_by("-created_at")
        return queryset.distinct()


class PlatformDetailView(generics.RetrieveAPIView):
    queryset = Platform.objects.filter(is_active=True).select_related("category").prefetch_related("tags")
    serializer_class = PlatformDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            platform_count=Count("platforms", filter=Q(platforms__is_active=True))
        ).filter(platform_count__gt=0)


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.filter(platforms__is_active=True).distinct()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class RedirectThrottle(throttling.AnonRateThrottle):
    scope = "redirect"


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    candidate = forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR")
    try:
        return str(ipaddress.ip_address(candidate)) if candidate else None
    except ValueError:
        return None


class PlatformRedirectView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RedirectThrottle]

    def get(self, request, slug):
        platform = get_object_or_404(Platform, slug=slug, is_active=True)
        parsed = urlparse(platform.destination_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return HttpResponseRedirect("/")

        ClickLog.objects.create(
            platform=platform,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
            referrer=request.META.get("HTTP_REFERER", "")[:2048],
        )
        response = HttpResponseRedirect(platform.destination_url)
        response["Referrer-Policy"] = "no-referrer"
        return response
