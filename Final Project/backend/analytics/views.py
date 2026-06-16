from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ClickLog


class AnalyticsDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            days = int(request.query_params.get("days", 30))
        except (TypeError, ValueError):
            days = 30
        days = min(max(days, 1), 365)
        since = timezone.now() - timezone.timedelta(days=days)
        period_logs = ClickLog.objects.filter(timestamp__gte=since)

        daily = period_logs.annotate(date=TruncDate("timestamp")).values("date").annotate(
            clicks=Count("id")
        ).order_by("date")
        top = period_logs.values("platform__name", "platform__slug").annotate(
            clicks=Count("id")
        ).order_by("-clicks")[:10]
        categories = period_logs.values(
            "platform__category__name", "platform__category__slug"
        ).annotate(clicks=Count("id")).order_by("-clicks")
        recent = ClickLog.objects.select_related("platform")[:20]

        return Response({
            "total_clicks": ClickLog.objects.count(),
            "period_clicks": period_logs.count(),
            "days": days,
            "daily_trends": list(daily),
            "most_visited": list(top),
            "category_popularity": list(categories),
            "recent_clicks": [{
                "id": log.id,
                "platform": log.platform.name,
                "platform_slug": log.platform.slug,
                "timestamp": log.timestamp,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "referrer": log.referrer,
            } for log in recent],
        })
