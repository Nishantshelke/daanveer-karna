from django.db import models


class ClickLog(models.Model):
    platform = models.ForeignKey("platforms.Platform", on_delete=models.CASCADE, related_name="clicks")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(max_length=2048, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [models.Index(fields=["platform", "-timestamp"])]

    def __str__(self):
        return f"{self.platform} at {self.timestamp:%Y-%m-%d %H:%M}"
