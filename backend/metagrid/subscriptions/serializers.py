from rest_framework import serializers

from metagrid.subscriptions.models import SavedSubscriptions, Subscription


class SavedSubscriptionsSerializer(serializers.ModelSerializer):
    lookup_field = "user"
    read_only_fields = ("user",)

    class Meta:
        model = SavedSubscriptions
        fields = ("user", "subscriptions")


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ("uuid", "period", "timestamp", "name", "facets")
