# -*- coding: utf8 -*-
from functools import wraps
from django.conf import settings
from django.utils.decorators import available_attrs
from django.contrib.auth.views import redirect_to_login


def peracto_login_required(view_func):
    @wraps(view_func, assigned=available_attrs(view_func))
    def _wrapped_view(request, *args, **kwargs):
        if getattr(settings, 'PERACTO_USE_AUTH', False):
            if request.user.is_anonymous():
                return redirect_to_login(request.path)
        return view_func(request, *args, **kwargs)

    return _wrapped_view