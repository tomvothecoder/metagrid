import logging
import urllib.parse
from typing import Dict, List, Union

from django.db import models

# Get an instance of a logger
logger = logging.getLogger(__name__)


class Project(models.Model):
    """Model definition for Project."""

    name = models.CharField(
        max_length=255, unique=True, help_text="The acronym of the project",
    )
    full_name = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        help_text="The spelled out name of the project.",
    )
    description = models.TextField(null=True)

    class Meta:
        """Meta definition for Project."""

        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self) -> str:
        """Unicode representation of Project."""
        return self.name

    def get_absolute_url(self) -> str:
        """Return absolute url for Project."""
        return self.name

    @property
    def facets_url(self) -> Union[None, str]:
        """Generates a URL query for the ESG-Search API."""
        facets = self.facets.order_by("id").values_list("name", flat=True)  # type: ignore

        if not facets:
            logger.warning(f"No facets found for project: {self.name}")
            return None

        # TODO: Configure base_url to be a dynamic Django setting using .env
        base_url = "https://esgf-node.llnl.gov/esg-search/search/?"
        params = {
            "offset": 0,
            "limit": 0,
            "type": "Dataset",
            "replica": False,
            "latest": True,
            "format": "application/solr+json",
            "project": [self.name, self.name.upper(), self.name.lower()],
            "facets": ", ".join(facets),
        }  # type: Dict[str, Union[int, str, List[str]]]

        query_string = urllib.parse.urlencode(params, True)
        return base_url + query_string


class Facet(models.Model):
    """Model definition for Facet."""

    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        Project, related_name="facets", on_delete=models.CASCADE
    )

    class Meta:
        """Meta definition for Facet."""

        unique_together = ["name", "project"]
        verbose_name = "Facet"
        verbose_name_plural = "Facets"

    def __str__(self) -> str:
        """Unicode representation of Facet."""
        return self.name

    def get_absolute_url(self) -> str:
        """Return absolute url for Facet."""
        return self.name