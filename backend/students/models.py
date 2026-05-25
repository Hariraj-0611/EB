"""
Student model — maps to the 'students' table in MySQL.
"""

from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"
