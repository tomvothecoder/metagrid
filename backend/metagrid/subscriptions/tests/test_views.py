import pytest
from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from metagrid.subscriptions.models import SavedSubscriptions, Subscription
from metagrid.subscriptions.tests.factories import SubscriptionFactory
from metagrid.users.tests.factories import UserFactory, raw_password

pytestmark = pytest.mark.django_db


class TestSavedSubscriptionDetail(APITestCase):
    """
    Tests saved subscriptions detail operations.
    """

    def setUp(self):
        self.user = UserFactory()

        # Login user to fetch access token
        rest_login_url = reverse("rest_login")
        payload = {
            "email": self.user.email,
            "password": raw_password,
        }
        response = self.client.post(
            rest_login_url,
            payload,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # Add access token to authorization header
        access_token = response.data["access_token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # URL for subscription detail
        self.url = reverse(
            "subscription-detail", kwargs={"user": self.user.pk}
        )

    def test_get_request_returns_user_saved_subscriptions(self):
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_patch_request_updates_user_saved_subscriptions(self):
        # Add item to the user's saved subscriptions
        payload = {"subscriptions": [{"title": "dataset"}]}
        response = self.client.patch(
            self.url,
            payload,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        user_saved_subscriptions = SavedSubscriptions.objects.get(
            user=self.user
        )
        assert user_saved_subscriptions.items == payload.get("subscriptions")


class TestSubscriptionViewSet(APITestCase):
    """
    Tests subscription operations.
    """

    def setUp(self):
        self.user = UserFactory()

        # Login user to fetch access token
        rest_login_url = reverse("rest_login")
        payload = {
            "email": self.user.email,
            "password": raw_password,
        }
        response = self.client.post(
            rest_login_url,
            payload,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

        # Add access token to authorization header
        access_token = response.data["access_token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # URL for GET (list), POST (create)
        self.list_url = reverse("subscription-list")

        # URL for GET, PUT, PATCH, DELETE
        self.subscription_obj = SubscriptionFactory(user=self.user)
        self.detail_url = reverse(
            "subscription-detail", kwargs={"uuid": self.subscription_obj.uuid}
        )

    def test_get_request_returns_list_of_objects(self):
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_get_request_returns_object(self):
        response = self.client.get(self.detail_url)
        assert response.status_code == status.HTTP_200_OK

    def test_post_request_creates_object(self):
        payload = model_to_dict(SubscriptionFactory.build(user=self.user))

        response = self.client.post(self.list_url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_destroy_request_deletes_object(self):
        response = self.client.delete(self.detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        subscription_exists = Subscription.objects.filter(
            pk=self.subscription_obj.pk
        ).exists()
        assert not subscription_exists
