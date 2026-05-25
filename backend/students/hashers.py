from django.contrib.auth.hashers import PBKDF2PasswordHasher


class FastPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    """
    Faster PBKDF2 hasher with reduced iterations.
    Default Django uses 720,000 iterations (~2s per hash).
    260,000 iterations brings it down to ~0.3s — still secure for a dev/internal app.
    """
    iterations = 260000
