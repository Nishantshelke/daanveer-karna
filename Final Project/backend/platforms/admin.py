from django.contrib import admin

from .models import Category, Platform, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_active", "created_at", "click_total")
    list_filter = ("is_active", "category", "tags", "created_at")
    search_fields = ("name", "description", "destination_url")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("tags",)
    readonly_fields = ("created_at",)
    list_editable = ("is_active",)
    date_hierarchy = "created_at"
    actions = ("activate", "deactivate")

    @admin.display(description="Clicks")
    def click_total(self, obj):
        return obj.clicks.count()

    @admin.action(description="Activate selected platforms")
    def activate(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected platforms")
    def deactivate(self, request, queryset):
        queryset.update(is_active=False)
