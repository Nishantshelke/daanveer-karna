from django.apps import AppConfig


class PlatformsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "platforms"

    def ready(self):
        try:
            from .models import Category, Platform

            category, _ = Category.objects.get_or_create(
                name="Movies",
                defaults={
                    "slug": "movies",
                    "icon": "🎬",
                },
            )

            platforms = [
                {
                    "name": "UHD Movies",
                    "slug": "uhd-movies",
                    "description": "Ultra HD Movies",
                    "destination_url": "https://uhdmovies.food/",
                },
                {
                    "name": "MoviesLeech",
                    "slug": "moviesleech",
                    "description": "Bollywood Movies",
                    "destination_url": "https://moviesleech.bar/",
                },
                {
                    "name": "AnimeFlix",
                    "slug": "animeflix",
                    "description": "Anime Streaming",
                    "destination_url": "https://animeflix.dad/",
                },
                {
                    "name": "MoviesMod",
                    "slug": "moviesmod",
                    "description": "Hollywood Movies",
                    "destination_url": "https://moviesmod.army/",
                },
            ]

            for item in platforms:
                Platform.objects.get_or_create(
                    slug=item["slug"],
                    defaults={
                        "name": item["name"],
                        "description": item["description"],
                        "destination_url": item["destination_url"],
                        "category": category,
                        "is_active": True,
                    },
                )

        except Exception:
            pass