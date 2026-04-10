from django.db import models
from django.conf import settings


class DailyStats(models.Model):
    """Aggregated daily statistics for quick analytics queries."""
    date              = models.DateField(unique=True)
    total_sessions    = models.PositiveIntegerField(default=0)
    total_messages    = models.PositiveIntegerField(default=0)
    kb_hits           = models.PositiveIntegerField(default=0)
    llm_hits          = models.PositiveIntegerField(default=0)
    fallback_hits     = models.PositiveIntegerField(default=0)
    avg_similarity    = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'daily_stats'
        ordering = ['-date']

    def __str__(self):
        return f'Stats for {self.date}'
