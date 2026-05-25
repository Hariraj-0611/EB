"""
Serializers for Student model and user registration.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Student


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration with password confirmation."""

    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class StudentSerializer(serializers.ModelSerializer):
    """Full serializer for Student CRUD operations."""

    class Meta:
        model = Student
        fields = ('id', 'name', 'age', 'email', 'course', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_age(self, value):
        if value < 1 or value > 120:
            raise serializers.ValidationError('Age must be between 1 and 120.')
        return value

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Name must be at least 2 characters.')
        return value.strip()
