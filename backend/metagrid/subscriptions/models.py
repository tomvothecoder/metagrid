import uuid

from django.db import models
from django.db.models import JSONField as JSONBField


class SavedSubscriptions(models.Model):
    """Model definition for SavedSubscriptions."""

    user = models.OneToOneField("users.User", on_delete=models.CASCADE)

    subscriptions = JSONBField(default=list)

    class Meta:
        """Meta definition for SavedSubscriptions."""

        verbose_name = "SavedSubscriptions"
        verbose_name_plural = "SavedSubscriptions"

    def __str__(self):
        """Unicode representation of SavedSubscriptions."""
        return str(self.subscriptions)


class Subscription(models.Model):
    """Model definition for Subscription."""

    uuid = models.UUIDField(default=uuid.uuid4)
    DAILY = "D"
    WEEKLY = "W"
    BI_WEEKLY = "BW"
    MONTHLY = "M"
    INTERVALS = [
        (DAILY, "Daily"),
        (WEEKLY, "Weekly"),
        (BI_WEEKLY, "Bi-weekly"),
        (MONTHLY, "Monthly"),
    ]
    period = models.CharField(max_length=2, choices=INTERVALS, default=WEEKLY)
    timestamp = models.DateTimeField()
    name = models.CharField(max_length=255, blank=True, null=True)
    facets = JSONBField(default=dict)

    class Meta:
        """Meta definition for Subscription."""

        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"

    def __str__(self):
        """Unicode representation of Subscription."""
        return self
