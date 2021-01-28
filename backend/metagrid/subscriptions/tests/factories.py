import json

import factory

from metagrid.users.tests.factories import UserFactory


class JSONFactory(factory.DictFactory):
    """
    Use with factory.Dict to make JSON strings.
    https://stackoverflow.com/a/41154232
    """

    @classmethod
    def _generate(cls, create, attrs):
        obj = super()._generate(create, attrs)
        return json.dumps(obj)


class SavedSubscriptionsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "subscriptions.SavedSubscriptions"

    subscriptions = factory.Dict(
        {"title": "dataset"}, dict_factory=JSONFactory
    )


class SubscriptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "subscriptions.Subscription"

    user = factory.SubFactory(UserFactory)
    facets = factory.Dict({"facet": ["option"]}, dict_factory=JSONFactory)
