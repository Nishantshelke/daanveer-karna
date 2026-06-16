from rest_framework import serializers

from .models import Category, Platform, Tag


class CategorySerializer(serializers.ModelSerializer):
    platform_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ["id", "name", "icon", "slug", "platform_count"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class PlatformListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()
    click_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Platform
        fields = [
            "id", "name", "slug", "description", "logo_url", "category",
            "tags", "created_at", "click_count",
        ]

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url


class PlatformDetailSerializer(PlatformListSerializer):
    related = serializers.SerializerMethodField()

    class Meta(PlatformListSerializer.Meta):
        fields = PlatformListSerializer.Meta.fields + ["related"]

    def get_related(self, obj):
        related = (
            Platform.objects.filter(is_active=True, category=obj.category)
            .exclude(pk=obj.pk)
            .select_related("category")
            .prefetch_related("tags")[:6]
        )
        return PlatformListSerializer(related, many=True, context=self.context).data
