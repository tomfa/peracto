#coding: utf-8
from django.conf.urls.defaults import *
from compleo import views

urlpatterns = patterns('',
    url(r'^/?$', views.index, name='index'),
    url(r'^(?P<list_name>[a-z0-9]+)$', views.get_list, name='todo'),
    url('add/$', views.add, name='ajax-add'),
    url('rename/$', views.rename, name='ajax-rename'),
    url('delete/$', views.delete, name='ajax-delete'),
    url('check/$', views.check, name='ajax-check'),
   # url(r'^edit$', views.edit, name='edit'), 
)