from rest_framework import mixins, viewsets

from metagrid.subscriptions.models import SavedSubscriptions, Subscription
from metagrid.subscriptions.serializers import (
    SavedSubscriptionsSerializer,
    SubscriptionSerializer,
)
from metagrid.users.permissions import IsOwner


class SavedSubscriptionsViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    queryset = SavedSubscriptions.objects.all().order_by("id")
    serializer_class = SavedSubscriptionsSerializer
    permission_classes = [IsOwner]
    lookup_field = "user"

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.filter(user=user).prefetch_related()
        return queryset


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all().order_by("id")
    serializer_class = SubscriptionSerializer
    permission_classes = [IsOwner]
    lookup_field = "uuid"

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.filter(user=user).prefetch_related()
        return queryset
