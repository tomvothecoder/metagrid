# Generated by Django 3.0.8 on 2020-08-24 22:31
from typing import TYPE_CHECKING

from django.db import migrations

if TYPE_CHECKING:
    from metagrid.projects.models import Facet, FacetGroup, Project


def link_facets_to_groups(apps, schema_editor):
    """Links facet objects to groups through a foreign key relation.

    Args:
        apps ([type]): [description]
        schema_editor ([type]): [description]
    """

    FacetModel = apps.get_model("projects", "Facet")  # type: Facet

    FacetGroupModel = apps.get_model(
        "projects", "FacetGroup"
    )  # type: FacetGroup

    GROUPS = FacetGroupModel.objects.all().order_by("pk")

    projects = {
        "CMIP6": {
            GROUPS[0]: ["activity_id", "data_node"],
            GROUPS[1]: [
                "source_id",
                "institution_id",
                "source_type",
                "experiment_id",
                "sub_experiment_id",
            ],
            GROUPS[2]: ["nominal_resolution",],
            GROUPS[3]: ["variant_label", "grid_label",],
            GROUPS[4]: [
                "table_id",
                "frequency",
                "realm",
                "variable_id",
                "cf_standard_name",
            ],
        },
        "CMIP5": {
            GROUPS[0]: [
                "project",
                "product",
                "institute",
                "model",
                "data_node",
            ],
            GROUPS[1]: ["experiment", "experiment_family",],
            GROUPS[4]: [
                "time_frequency",
                "realm",
                "cmor_table",
                "ensemble",
                "variable",
                "variable_long_name",
                "cf_standard_name",
            ],
        },
        "E3SM": {
            GROUPS[0]: ["data_node"],
            GROUPS[1]: ["experiment", "science_driver", "model_version",],
            GROUPS[4]: [
                "realm",
                "regridding",
                "time_frequency",
                "data_type",
                "ensemble_member",
                "tuning",
                "campaign",
                "period",
            ],
            GROUPS[2]: [
                "atmos_grid_resolution",
                "ocean_grid_resolution",
                "land_grid_resolution",
                "seaice_grid_resolution",
            ],
        },
        "CMIP3": {
            GROUPS[0]: ["model", "experiment", "institute",],
            GROUPS[4]: ["variable", "realm", "time_frequency", "ensemble",],
        },
        "input4MIPs": {
            GROUPS[0]: ["target_mip_list", "dataset_status"],
            GROUPS[1]: ["institution_id", "source_id", "source_version",],
            GROUPS[4]: [
                "dataset_category",
                "variable_id",
                "grid_label",
                "nominal_resolution",
                "frequency",
                "realm",
            ],
        },
        "obs4MIPs": {
            GROUPS[0]: ["product", "realm", "data_node",],
            GROUPS[1]: ["source_id"],
            GROUPS[4]: ["variable", "variable_long_name", "cf_standard_name",],
            GROUPS[5]: ["institute", "time_frequency",],
            GROUPS[6]: [
                "institution_id",
                "frequency",
                "grid_label",
                "nominal_resolution",
                "region",
                "source_type",
                "variant_label",
            ],
        },
    }
    for project_name, facet_groups in projects.items():
        for group, facets, in facet_groups.items():
            objs = FacetModel.objects.filter(
                project__name=project_name, name__in=facets
            ).update(group=group)


def reverse_link_facets_to_groups(apps, schema_editor):
    FacetModel = apps.get_model("projects", "Facet")  # type: Facet
    FacetModel.objects.all().update(group=None)


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0013_facet_group"),
    ]

    operations = [
        migrations.RunPython(
            link_facets_to_groups, reverse_link_facets_to_groups
        ),
    ]
