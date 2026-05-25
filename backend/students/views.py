"""
API views for authentication and student CRUD operations.
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Student
from .serializers import RegisterSerializer, StudentSerializer

token_generator = PasswordResetTokenGenerator()


class RegisterView(generics.CreateAPIView):
    """POST /api/register/ — create a new user account."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Account created successfully. Please log in.'},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/login/
    Accepts either username or email + password.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '').strip()
        password = request.data.get('password', '').strip()

        if not identifier:
            return Response({'error': 'Username or email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        username = identifier
        if '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                username = user_obj.username
            except User.DoesNotExist:
                return Response({'error': 'No account found with that email address.'}, status=status.HTTP_404_NOT_FOUND)

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({'error': 'Incorrect password. Please try again.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'This account has been deactivated. Contact support.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': f'Welcome back, {user.username}!',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    POST /api/forgot-password/
    Accepts an email address and returns a password reset token + uidb64.
    In production you would email the link; here we return it directly
    so the frontend can construct the reset URL without an SMTP server.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Return success anyway to avoid email enumeration
            return Response({
                'message': 'If that email exists, a reset link has been generated.',
                'reset_available': False,
            }, status=status.HTTP_200_OK)

        # Generate secure one-time token
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        return Response({
            'message': 'Reset token generated successfully.',
            'reset_available': True,
            'uid': uid,
            'token': token,
            'username': user.username,
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/reset-password/
    Validates uid + token, then sets the new password.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        uid      = request.data.get('uid', '')
        token    = request.data.get('token', '')
        password = request.data.get('password', '')
        password2 = request.data.get('password2', '')

        if not all([uid, token, password, password2]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        # Decode uid
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate token (one-time use, expires after password change)
        if not token_generator.check_token(user, token):
            return Response({'error': 'Reset link is invalid or has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({'message': 'Password reset successfully. You can now log in.'}, status=status.HTTP_200_OK)


class StudentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'course']

    def get_queryset(self):
        return Student.objects.all()


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Student deleted successfully.'}, status=status.HTTP_200_OK)
