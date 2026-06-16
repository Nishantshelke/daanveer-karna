from django.contrib import admin

from .models import ClickLog


@admin.register(ClickLog)
class ClickLogAdmin(admin.ModelAdmin):
    list_display = ("platform", "timestamp", "ip_address", "short_referrer")
    list_filter = ("platform", "timestamp")
    search_fields = ("platform__name", "ip_address", "user_agent", "referrer")
    readonly_fields = ("platform", "timestamp", "ip_address", "user_agent", "referrer")
    date_hierarchy = "timestamp"

    @admin.display(description="Referrer")
    def short_referrer(self, obj):
        return obj.referrer[:60]

    def has_add_permission(self, request):
        return False
