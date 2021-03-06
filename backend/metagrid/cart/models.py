import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import JSONField as JSONBField


class Cart(models.Model):
    """Model definition for Cart."""

    user = models.OneToOneField("users.User", on_delete=models.CASCADE)
    items = JSONBField(default=list)

    class Meta:
        """Meta definition for Cart."""

        verbose_name = "Cart"
        verbose_name_plural = "Cart"

    def __str__(self):
        """Unicode representation of Cart."""
        return str(self.items)


class Search(models.Model):
    """Model definition for Search."""

    ALL = "all"
    ORIGINALS_ONLY = "originals only"
    REPLICAS_ONLY = "replicas only"

    RESULT_TYPE_CHOICES = (
        (ALL, ALL),
        (ORIGINALS_ONLY, ORIGINALS_ONLY),
        (REPLICAS_ONLY, REPLICAS_ONLY),
    )

    uuid = models.UUIDField(default=uuid.uuid4)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE)
    result_type = models.CharField(
        max_length=255, default=ALL, choices=RESULT_TYPE_CHOICES
    )
    # CharField is used instead of DateField for consistency with ESGF
    # Search API.
    # https://esgf.github.io/esg-search/ESGF_Search_RESTful_API.html#minimum-and-maximum-version-queries
    # Version date fields format is 'YYYYMMDD' (e.g. 20200101)
    min_version_date = models.CharField(max_length=255, blank=True, null=True)
    max_version_date = models.CharField(max_length=255, blank=True, null=True)
    filename_vars = ArrayField(
        models.CharField(max_length=255, blank=True),
        blank=True,
        null=True,
        default=list,
        size=1,
    )
    active_facets = JSONBField(default=dict)
    text_inputs = ArrayField(
        models.CharField(max_length=255, blank=True),
        blank=True,
        null=True,
        default=list,
        size=1,
    )
    url = models.URLField(max_length=2000)

    class Meta:
        """Meta definition for Search."""

        verbose_name = "Search"
        verbose_name_plural = "Searches"

    def __str__(self):
        """Unicode representation of Search."""
        return self
