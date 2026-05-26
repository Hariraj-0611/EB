"""
Django settings for student_project.
"""

try:
    import importlib
    pymysql = importlib.import_module('pymysql')
    pymysql.install_as_MySQLdb()
except ImportError:
    # pymysql may not be installed in some environments; fall back gracefully.
    pass

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env before anything else
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env', override=True)
except ImportError:
    pass

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'students',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

ROOT_URLCONF = 'student_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'student_project.wsgi.application'

# MySQL Database — credentials loaded from environment variables
# Support writing the Aiven CA PEM from the `AIVEN_CA` env var at runtime
AIVEN_CA = os.environ.get('AIVEN_CA')
AIVEN_CA_PATH = None
if AIVEN_CA:
    try:
        AIVEN_CA_PATH = BASE_DIR / 'aiven-ca.pem'
        # write the PEM file if it does not exist or content differs
        if not AIVEN_CA_PATH.exists() or AIVEN_CA_PATH.read_text(encoding='utf-8') != AIVEN_CA:
            AIVEN_CA_PATH.write_text(AIVEN_CA, encoding='utf-8')
    except Exception:
        AIVEN_CA_PATH = None
else:
    ca_fallback = BASE_DIR / 'ca.pem'
    if ca_fallback.exists():
        AIVEN_CA_PATH = ca_fallback

# Only enable SSL options when a valid CA file exists
# Otherwise connect without explicit SSL configuration.
db_options = {'charset': 'utf8mb4'}
if AIVEN_CA_PATH:
    db_options['ssl'] = {'ca': str(AIVEN_CA_PATH)}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'defaultdb'),
        'USER': os.environ.get('DB_USER', 'avnadmin'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '19322'),
        'OPTIONS': db_options,
        'CONN_MAX_AGE': 60,
    }
}

# Faster password hasher — custom subclass with reduced iterations
# Default Django PBKDF2 uses 720,000 iterations (~2s). 260,000 = ~0.3s, still secure for dev.
PASSWORD_HASHERS = [
    'students.hashers.FastPBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework — JWT auth by default
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Simple JWT — 24h access token
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS — allow Vercel frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://eb-peach.vercel.app/login',
    'https://student-backend-k0vi.onrender.com/',  # Add this after deploy
]
CORS_ALLOW_CREDENTIALS = True
