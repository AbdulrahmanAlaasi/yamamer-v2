from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'super_admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('student',     'Student'),
        ('admin',       'Admin'),
        ('super_admin', 'Super Admin'),
    ]
    LANG_CHOICES = [
        ('en', 'English'),
        ('ar', 'Arabic'),
    ]

    supabase_uid        = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email               = models.EmailField(unique=True)
    full_name           = models.CharField(max_length=150)
    phone               = models.CharField(max_length=20, blank=True)
    role                = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    preferred_language  = models.CharField(max_length=5, choices=LANG_CHOICES, default='en')
    is_active           = models.BooleanField(default=True)
    is_staff            = models.BooleanField(default=False)
    date_joined         = models.DateTimeField(auto_now_add=True)

    # Student-specific fields
    student_id          = models.CharField(max_length=20, blank=True, null=True, unique=True)
    major               = models.CharField(max_length=100, blank=True)
    academic_year       = models.PositiveSmallIntegerField(null=True, blank=True)
    gpa                 = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    credit_hours        = models.PositiveSmallIntegerField(null=True, blank=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_admin_user(self):
        return self.role in ('admin', 'super_admin')

    @property
    def is_super_admin(self):
        return self.role == 'super_admin'