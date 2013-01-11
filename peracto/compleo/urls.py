#set encoding=utf-8
from django.conf.urls.defaults import *
from compleo import views

urlpatterns = patterns('',
    # note to self: appnavn i name
    url(r'^/?$', views.index, name='index'),
    # r = regex: ^: start, $: end, 
    url(r'^(?P<listname>[\wæøå ._0-9-]+)$', views.get_list, name='todo'), 
    url('add/$', views.add, name='ajax-add'),
    url('rename/$', views.rename, name='ajax-rename'),
    url('delete/$', views.delete, name='ajax-delete'),
    url('check/$', views.check, name='ajax-check'),
   # url(r'^edit$', views.edit, name='edit'), 
)