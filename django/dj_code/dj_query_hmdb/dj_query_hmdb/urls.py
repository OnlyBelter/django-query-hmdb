"""dj_query_hmdb URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from query_hmdb import views

# https://docs.djangoproject.com/en/2.1/topics/http/urls/#how-django-processes-a-request
# https://docs.djangoproject.com/en/2.1/ref/urls/
urlpatterns = [
    path('admin/', admin.site.urls),
    path(r'hmdb/', views.hmdb_home),
    path(r'hmdb/search/', views.hmdb_search),
    path(r'hmdb/result/search/', views.hmdb_result_search),
    path(r'hmdb/input_example.csv/?', views.CCS_input_example),
]
