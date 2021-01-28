from django.contrib import admin

from metagrid.subscriptions.models import SavedSubscriptions, Subscription


@admin.register(SavedSubscriptions)
class SavedSubscriptionsAdmin(admin.ModelAdmin):
    pass


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    pass
