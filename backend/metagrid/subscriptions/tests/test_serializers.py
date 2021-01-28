import pytest
from django.forms.models import model_to_dict

from metagrid.subscriptions.serializers import (
    SavedSubscriptionsSerializer,
    SubscriptionSerializer,
)
from metagrid.subscriptions.tests.factories import (
    SavedSubscriptionsFactory,
    SubscriptionFactory,
)


class TestSavedSubscriptionsSerializer:
    @pytest.fixture(autouse=True)
    def setUp(self):
        self.saved_subscriptions_data = model_to_dict(
            SavedSubscriptionsFactory.build()
        )

    def test_serializer_success(self):
        serializer = SavedSubscriptionsSerializer(
            data=self.saved_subscriptions_data
        )
        assert serializer.is_valid


class TestSubscriptionSerializer:
    @pytest.fixture(autouse=True)
    def setUp(self):
        self.subscription_data = model_to_dict(SubscriptionFactory.build())

    def test_serializer_success(self):
        serializer = SubscriptionSerializer(data=self.subscription_data)
        assert serializer.is_valid
