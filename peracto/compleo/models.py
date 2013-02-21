# -*- encoding: utf-8 -*-#
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class RandomName(models.Model):
    random_name = models.CharField(max_length=20);
    def __unicode__(self):
        return unicode(self.random_name)


class ListManager(models.Manager):
    def permitted_objects(self, user, *args, **kwargs):
        qs = self.get_query_set().filter(*args, **kwargs)
        if user.is_authenticated():
            qs = qs.filter(Q(user=None) | Q(user=user))
        else:
            qs = qs.filter(user=None)
        return qs


class PeractoList(models.Model):
    '''
    The main class for a list
    '''
    title = models.CharField(max_length=50, verbose_name='PeractoList_identifer', unique=True)
    user = models.ForeignKey(User, null=True, blank=True)

    objects = ListManager()

    def __unicode__(self):
        return unicode(self.title)

class Topic(models.Model):
    ''' 
    The class for a topic
    '''
    title = models.CharField(max_length=15, verbose_name='PeractoTopic')
    description = models.CharField(max_length=100, verbose_name='Description')
    parentList = models.ForeignKey(PeractoList)

    def __unicode__(self):
        return unicode(self.title)

class Theme(models.Model):
    ''' 
    The class for a theme
    '''
    title = models.CharField(max_length=15, verbose_name='PeractoTheme')
    parentTopic = models.ForeignKey(Topic)

    def __unicode__(self):
        return unicode(self.title)

class Goal(models.Model):
    ''' 
    The class for a goal
    '''
    title = models.CharField(max_length=30, verbose_name='PeractoGoal')
    parentTheme = models.ForeignKey(Theme)
    checked = models.BooleanField(default=False)

    def __unicode__(self):
        return unicode(self.title)
