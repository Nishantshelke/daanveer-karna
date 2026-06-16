from django.core.management.base import BaseCommand

from platforms.models import Category, Platform, Tag


class Command(BaseCommand):
    help = "Create a small set of generic demo destinations."

    def handle(self, *args, **options):
        demos = [
            ("Learning", "◈", "Open Library", "Explore a broad catalog of books and reading resources.", "https://openlibrary.org/", ["Books", "Free"]),
            ("Communities", "◎", "Internet Archive", "Discover preserved media, software, books, and web history.", "https://archive.org/", ["Archive", "Free"]),
            ("Culture", "◇", "TED", "Browse ideas and talks from speakers around the world.", "https://www.ted.com/", ["Talks", "Ideas"]),
            ("Audio", "◉", "LibriVox", "Listen to public-domain audiobooks read by volunteers.", "https://librivox.org/", ["Audio", "Free"]),
        ]
        for category_name, icon, name, description, url, tag_names in demos:
            category, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={"slug": category_name.lower(), "icon": icon},
            )
            platform, _ = Platform.objects.get_or_create(
                name=name,
                defaults={
                    "slug": name.lower().replace(" ", "-"),
                    "description": description,
                    "destination_url": url,
                    "category": category,
                },
            )
            platform.tags.set([
                Tag.objects.get_or_create(name=tag_name, defaults={"slug": tag_name.lower()})[0]
                for tag_name in tag_names
            ])
        self.stdout.write(self.style.SUCCESS("Demo destinations are ready."))
